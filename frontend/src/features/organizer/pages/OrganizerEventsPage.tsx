import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ApiError } from "../../../lib/http/httpClient";
import type { EventDto, EventStatus, EventCreateRequestDto as OrganizerEventRequestDto } from "../../events/types";
import {
  useGetOrganizerEvents as useMyOrganizerEvents,
  useCountOrganizerEvents as useCountMyOrganizerEvents,
} from "../../events/api/queries";
import {
  useCreateOrganizerEvent,
  useUpdateOrganizerEvent,
  useChangeOrganizerEventStatus,
} from "../../events/api/mutations";
import { Link } from "react-router";

import { Button, buttonVariants } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { PaginationControls } from "../../../components/shared/PaginationControls";
import { EmptyState } from "../../../components/shared/EmptyState";
import { EventForm, type EventFormValues } from "../../events/components/EventForm";
import { CommonTable } from "../../../components/ui/data-table";
import { Card, CardContent } from "../../../components/ui/card";


function toDatePart(localDateTimeIso: string): string {
  // event-service returns LocalDateTime like "2026-03-29T23:49:22.729"
  // date input needs "YYYY-MM-DD"
  if (!localDateTimeIso) return "";
  return localDateTimeIso.length >= 10 ? localDateTimeIso.substring(0, 10) : "";
}

function toTimePart(localDateTimeIso: string): string {
  // time input needs "HH:mm"
  if (!localDateTimeIso) return "";
  return localDateTimeIso.length >= 16 ? localDateTimeIso.substring(11, 16) : "";
}

const initialDraft: EventFormValues = {
  name: "",
  description: "",
  venue: "",
  datePart: "",
  timePart: "",
  feeText: "0",
  capacityText: "1",
  imageUrl: "",
};

export function OrganizerEventsPage() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState<EventStatus | "ALL">("ALL");

  const [initialForm, setInitialForm] = useState<EventFormValues>(initialDraft);

  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: pageData, isLoading: isLoadingList } = useMyOrganizerEvents({
    status: status === "ALL" ? undefined : (status as EventStatus),
    page,
    size: pageSize,
  });

  const { data: countData } = useCountMyOrganizerEvents({
    status: "OPEN",
  });

  const { mutateAsync: createEvent, isPending: isCreating } = useCreateOrganizerEvent();
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateOrganizerEvent();
  const { mutateAsync: changeStatus } = useChangeOrganizerEventStatus();

  const data = pageData ?? null;
  const openCount = countData ?? null;
  const isLoading = isLoadingList;
  const isSubmitting = isCreating || isUpdating;

  const items = useMemo(() => data?.content ?? [], [data?.content]);
  const totalPages = data?.totalPages ?? 0;
  const hasNext = page + 1 < totalPages;

  function resetDraft() {
    setInitialForm(initialDraft);
    setIsEditing(false);
    setEditingEventId(null);
    setShowForm(false);
  }

  function startEdit(event: EventDto) {
    setInitialForm({
      name: event.name,
      description: event.description,
      venue: event.venue,
      datePart: toDatePart(event.date),
      timePart: toTimePart(event.date),
      feeText: String(event.fee),
      capacityText: String(event.capacity),
      imageUrl: event.imageUrl || "",
    });
    setIsEditing(true);
    setEditingEventId(event.id);
    setShowForm(true);
  }

  async function onSave(data: EventFormValues) {
    const parsedFee = Number(data.feeText);
    const parsedCapacity = Number(data.capacityText);

    const request: OrganizerEventRequestDto = {
      name: data.name,
      description: data.description,
      venue: data.venue,
      date: `${data.datePart}T${data.timePart}:00`,
      fee: parsedFee,
      capacity: parsedCapacity,
      imageUrl: data.imageUrl,
    };

    try {
      if (!isEditing || editingEventId == null) {
        await createEvent({ request });
        toast.success("Event created.");
      } else {
        await updateEvent({ eventId: editingEventId, request });
        toast.success("Event updated.");
      }
      resetDraft();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to save event.";
      toast.error(message);
    }
  }

  async function onToggleStatus(eventId: number, nextStatus: EventStatus) {
    setStatusBusyId(eventId);
    try {
      await changeStatus({ eventId, status: nextStatus });
      toast.success(`Event set to ${nextStatus}.`);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to update event status.";
      toast.error(message);
    } finally {
      setStatusBusyId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-brand-300/20 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Events</h1>
            <p className="mt-2 text-sm text-slate-300">
              Create, edit, open/close events and manage registrants.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-400">{openCount !== null ? `${openCount} OPEN` : "Loading OPEN count..."}</span>
            </div>
          </div>

          <div className="flex w-full flex-col sm:w-auto sm:flex-row gap-3">
            <Button
              type="button"
              variant="gradient"
              onClick={() => {
                resetDraft();
                setShowForm(true);
              }}
            >
              + Create Event
            </Button>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border-l border-slate-700 pl-3">
              <select
                value={status}
                onChange={(e) => {
                  const v = e.target.value as EventStatus | "ALL";
                  setStatus(v);
                  setPage(0);
                }}
                className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              <PaginationControls page={page} setPage={setPage} hasNext={hasNext} isLoading={isLoading} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Card className="border-white/5 bg-slate-900/50">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="grid gap-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="h-14 animate-pulse rounded-xl bg-slate-800/60" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <EmptyState
                  title="No events found."
                  description="Try changing the status filter."
                  className="bg-slate-950/20 px-6 py-10"
                />
              ) : (
                <CommonTable
                  data={items}
                  keyExtractor={(e) => e.id}
                  columns={[
                    {
                      key: "event",
                      header: "Event",
                      cell: (e) => (
                        <>
                          <div className="font-semibold text-slate-100">{e.name}</div>
                          <div className="text-xs text-slate-400">{e.venue}</div>
                        </>
                      ),
                    },
                    {
                      key: "date",
                      header: "Date",
                      cell: (e) =>
                        e.date
                          ? new Date(e.date).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—",
                    },
                    {
                      key: "seats",
                      header: "Seats",
                      cell: (e) => `${e.availableSeats}/${e.capacity}`,
                    },
                    {
                      key: "status",
                      header: "Status",
                      cell: (e) => (
                        <Badge variant={e.status === "OPEN" ? "default" : "destructive"}>
                          {e.status}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: "Actions",
                      cell: (e) => (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-slate-900/90 text-slate-200 hover:text-white"
                            onClick={() => startEdit(e)}
                            disabled={statusBusyId === e.id}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-slate-900/90 text-slate-200 hover:text-white"
                            disabled={statusBusyId === e.id}
                            onClick={() =>
                              void onToggleStatus(e.id, e.status === "OPEN" ? "CLOSED" : "OPEN")
                            }
                          >
                            {statusBusyId === e.id
                              ? "Updating..."
                              : e.status === "OPEN"
                              ? "Close"
                              : "Open"}
                          </Button>
                          <Link
                            to={`/organizer/events/${e.id}/registrants`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                              className:
                                "bg-slate-900/90 text-slate-200 hover:text-white border-slate-600 h-7 rounded-[12px] text-[0.8rem]",
                            })}
                          >
                            Registrants
                          </Link>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </div>

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="border-white/10 bg-slate-900 text-slate-100 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {isEditing ? "Edit Event" : "Create Event"}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {isEditing
                    ? "Update event details. Seats availability adjusts automatically."
                    : "Creates a new OPEN event for your organizer account."}
                </DialogDescription>
              </DialogHeader>

              <EventForm
                initialValues={initialForm}
                onSubmit={onSave}
                onCancel={() => resetDraft()}
                isSubmitting={isSubmitting}
                submitLabel={isEditing ? "Update Event" : "Create Event"}
              />
            </DialogContent>
          </Dialog>
      </section>
    </main>
  );
}

