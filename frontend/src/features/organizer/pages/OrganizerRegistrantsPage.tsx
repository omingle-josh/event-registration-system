import { useMemo, useState } from "react";
import { useParams } from "react-router";
import type { RegistrationStatus as OrganizerRegistrationStatus } from "../../registrations/types";
import { useGetOrganizerEventRegistrants } from "../../registrations/api/queries";
import { CommonTable } from "../../../components/ui/data-table";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

function formatDate(dateIso: string): string {
  const parsed = new Date(dateIso);
  if (Number.isNaN(parsed.getTime())) return dateIso;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function pillColor(status: string): string {
  if (status === "CONFIRMED") return "bg-emerald-500/25 text-emerald-200 border-emerald-300/30";
  if (status === "PENDING") return "bg-amber-500/25 text-amber-200 border-amber-300/30";
  if (status === "CANCELLED") return "bg-rose-500/25 text-rose-200 border-rose-300/30";
  return "bg-slate-500/25 text-slate-200 border-slate-400/30";
}

export function OrganizerRegistrantsPage() {
  const { eventId } = useParams();

  const numericEventId = Number(eventId);

  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState<OrganizerRegistrationStatus | "ALL">("ALL");

  const { data, isLoading } = useGetOrganizerEventRegistrants({
    eventId: numericEventId,
    status: status === "ALL" ? undefined : status,
    page,
    size: pageSize,
  });

  const items = useMemo(() => data?.content ?? [], [data?.content]);
  const totalPages = data?.totalPages ?? 0;
  const hasPrev = page > 0;
  const hasNext = page + 1 < totalPages;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-brand-300/20 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Registrants</h1>
            <p className="mt-2 text-sm text-slate-300">Event ID: {numericEventId}</p>
          </div>

          <div className="flex w-full flex-col sm:w-auto sm:flex-row gap-3">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as OrganizerRegistrationStatus | "ALL");
                  setPage(0);
                }}
                className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrev || isLoading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNext || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Card className="border-white/5 bg-slate-900/50">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="grid gap-3">
                  {Array.from({ length: pageSize }).map((_, idx) => (
                    <div key={idx} className="h-14 animate-pulse rounded-xl bg-slate-800/60" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="py-12 text-center text-slate-400">No registrants found.</div>
              ) : (
                <CommonTable
                  data={items}
                  keyExtractor={(r) => r.registrationId}
                  columns={[
                    {
                      key: "time",
                      header: "Time",
                      cell: (r) => formatDate(r.createdAt),
                    },
                    {
                      key: "registrant",
                      header: "Registrant",
                      cell: (r) => r.userEmail,
                    },
                    {
                      key: "registration",
                      header: "Registration",
                      cell: (r) => (
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-medium ${pillColor(
                            r.registrationStatus
                          )}`}
                        >
                          {r.registrationStatus}
                        </span>
                      ),
                    },
                    {
                      key: "payment",
                      header: "Payment",
                      cell: (r) => (
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-medium ${pillColor(
                            r.paymentStatus ?? "N/A"
                          )}`}
                        >
                          {r.paymentStatus ?? "N/A"}
                        </span>
                      ),
                    },
                    {
                      key: "receipt",
                      header: "Receipt",
                      cell: (r) => r.receiptNumber ?? "—",
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

