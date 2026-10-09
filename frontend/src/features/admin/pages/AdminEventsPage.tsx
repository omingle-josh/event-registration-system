import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ApiError } from "../../../lib/http/httpClient";

import { type EventCreateRequestDto } from "../../events/types";
import {
  useGetAdminEvents as useAdminEventsByStatus,
  useCountAdminEvents as useCountAdminEventsByStatus,
} from "../../events/api/queries";
import {
  useCreateAdminEvent,
  useUpdateAdminEvent,
  useChangeAdminEventStatus,
} from "../../events/api/mutations";
import type { EventDto } from "../../events/types";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { CommonTable, type Column } from "../../../components/ui/data-table";
import { PaginationControls } from "../../../components/shared/PaginationControls";
import { EmptyState } from "../../../components/shared/EmptyState";
import { EventForm, type EventFormValues } from "../../events/components/EventForm";


const initialFormValues: EventFormValues = {
  name: "",
  description: "",
  datePart: "",
  timePart: "",
  venue: "",
  feeText: "0",
  capacityText: "1",
};


function toLocalDateTimeForBackend(value: string): string {
  // <input type="datetime-local"> returns "YYYY-MM-DDTHH:mm"
  // Backend expects LocalDateTime, so we append seconds: "YYYY-MM-DDTHH:mm:ss"
  if (!value) return "";
  return `${value}:00`;
}

export function AdminEventsPage() {

  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  const [closingEventId, setClosingEventId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const [initialForm, setInitialForm] = useState<EventFormValues>(initialFormValues);

  const { data: pageData, isLoading: isLoadingList } = useAdminEventsByStatus({
    status: "OPEN",
    page,
    size: pageSize,
  });

  const { data: countData } = useCountAdminEventsByStatus({
    status: "OPEN",
  });

  const listData = pageData ?? null;
  const openEventsCount = countData ?? null;
  const isLoading = isLoadingList;

  const { mutateAsync: createEventMutation, isPending: isCreating } = useCreateAdminEvent();
  const { mutateAsync: updateEventMutation, isPending: isUpdating } = useUpdateAdminEvent();
  const { mutateAsync: changeStatusMutation } = useChangeAdminEventStatus();

  const isSubmitting = isCreating || isUpdating;

  const totalPages = listData?.totalPages ?? 0;
  const hasNext = page + 1 < totalPages;

  const items = useMemo(() => listData?.content ?? [], [listData?.content]);

  function openCreateModal() {
    setInitialForm(initialFormValues);
    setEditingEventId(null);
    setIsModalOpen(true);
  }

  function openEditModal(e: EventDto) {
    setInitialForm({
      name: e.name,
      description: e.description,
      datePart: e.date ? e.date.substring(0, 10) : "",
      timePart: e.date ? e.date.substring(11, 16) : "",
      venue: e.venue,
      feeText: e.fee.toString(),
      capacityText: e.capacity.toString(),
    });
    setEditingEventId(e.id);
    setIsModalOpen(true);
  }

  async function onSubmit(data: EventFormValues) {
    const parsedFee = Number(data.feeText);
    const parsedCapacity = Number(data.capacityText);

    const backendDate = toLocalDateTimeForBackend(`${data.datePart}T${data.timePart}`);
    if (!backendDate) return toast.error("Invalid event date.");

    const request: EventCreateRequestDto = {
      name: data.name,
      description: data.description,
      date: backendDate,
      venue: data.venue,
      fee: parsedFee,
      capacity: parsedCapacity,
    };

    try {
      if (editingEventId !== null) {
        await updateEventMutation({ eventId: editingEventId, request });
        toast.success("Event updated successfully.");
      } else {
        await createEventMutation({ request });
        toast.success("Event created successfully.");
        setPage(0);
      }
      setIsModalOpen(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to create event.";
      toast.error(message);
    }
  }

  async function onCloseEvent(eventId: number) {
    setClosingEventId(eventId);
    try {
      await changeStatusMutation({ eventId, status: "CLOSED" });
      toast.success("Event closed.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to close event.";
      toast.error(message);
    } finally {
      setClosingEventId(null);
    }
  }

  const columns = useMemo<Column<EventDto>[]>(() => [
    {
      key: "name",
      header: "Name",
      cell: (e) => (
        <>
          <div className="font-semibold text-slate-100">{e.name}</div>
          <div className="text-xs text-slate-400">ID: {e.id}</div>
        </>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (e) => new Date(e.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    },
    {
      key: "venue",
      header: "Venue",
      cell: (e) => e.venue,
    },
    {
      key: "seats",
      header: "Seats",
      cell: (e) => `${e.availableSeats}/${e.capacity}`,
    },
    {
      key: "organizer",
      header: "Organizer",
      cell: (e) => e.organizerEmail,
    },
    {
      key: "fee",
      header: "Fee",
      cell: (e) => e.fee.toLocaleString("en-IN"),
    },
    {
      key: "action",
      header: "Action",
      cell: (e) => (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto border-blue-400/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
            onClick={() => openEditModal(e)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
            disabled={closingEventId === e.id}
            onClick={() => void onCloseEvent(e.id)}
          >
            {closingEventId === e.id ? "Closing..." : "Close"}
          </Button>
        </div>
      ),
    },
  ], [closingEventId]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-brand-300/20 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Open Events</h1>
            <p className="mt-2 text-sm text-slate-300">
              {openEventsCount !== null ? `${openEventsCount} OPEN event(s)` : "Loading count..."}
            </p>
          </div>

          <div className="flex w-full flex-col sm:w-auto sm:flex-row gap-3">
            <Button
              type="button"
              onClick={openCreateModal}
              className="bg-brand-500 text-white transition hover:bg-brand-400"
            >
              + Create Event
            </Button>
            <PaginationControls page={page} setPage={setPage} hasNext={hasNext} isLoading={isLoading} />
          </div>
        </div>

        <div className="mt-6">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:p-6">
            {isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: pageSize }).map((_, idx) => (
                  <div key={idx} className="h-12 animate-pulse rounded-xl bg-slate-800/60" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState title="No open events." />
            ) : (
              <div className="overflow-x-auto">
                <CommonTable
                  data={items}
                  columns={columns}
                  keyExtractor={(e) => e.id}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-white/10 bg-slate-900 text-slate-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingEventId ? "Edit Event" : "Create Event"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingEventId
                ? "Update event details below."
                : "Creates an OPEN event (Admin/Organizer permissions required)."}
            </DialogDescription>
          </DialogHeader>

          <EventForm
            initialValues={initialForm}
            onSubmit={onSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel={editingEventId ? "Save Changes" : "Create Event"}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}

