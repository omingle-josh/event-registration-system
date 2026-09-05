import { useMemo, useState } from "react";
import { useAdminTransactions } from "../hooks/useAdminTransactions";
import { PaginationControls } from "../../../components/shared/PaginationControls";

function formatDate(dateIso: string): string {
  const parsed = new Date(dateIso);
  if (Number.isNaN(parsed.getTime())) return dateIso;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

export function AdminTransactionsPage() {

  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  const { data, isLoading } = useAdminTransactions({ page, size: pageSize });

  const totalPages = data?.totalPages ?? 0;
  const hasNext = page + 1 < totalPages;

  const items = useMemo(() => data?.content ?? [], [data?.content]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-brand-300/20 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <p className="mt-2 text-sm text-slate-300">Latest registrations (10 rows per page).</p>
          </div>
            <PaginationControls page={page} setPage={setPage} hasNext={hasNext} isLoading={isLoading} />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-100">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4 font-semibold text-slate-200">Time</th>
                <th className="py-3 pr-4 font-semibold text-slate-200">Event</th>
                <th className="py-3 pr-4 font-semibold text-slate-200">Registrant</th>
                <th className="py-3 pr-4 font-semibold text-slate-200">Status</th>
                <th className="py-3 pr-4 font-semibold text-slate-200">Payment</th>
                <th className="py-3 pr-4 font-semibold text-slate-200">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="py-3 pr-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-800/60" />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="h-4 w-48 animate-pulse rounded bg-slate-800/60" />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="h-4 w-56 animate-pulse rounded bg-slate-800/60" />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="h-5 w-28 animate-pulse rounded bg-slate-800/60" />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="h-5 w-28 animate-pulse rounded bg-slate-800/60" />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="h-4 w-40 animate-pulse rounded bg-slate-800/60" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-300">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                items.map((t) => {
                  const statusPill =
                    t.registrationStatus === "CONFIRMED"
                      ? "bg-emerald-500/25 text-emerald-200 border-emerald-300/30"
                      : t.registrationStatus === "PENDING"
                        ? "bg-amber-500/25 text-amber-200 border-amber-300/30"
                        : "bg-rose-500/25 text-rose-200 border-rose-300/30";

                  const paymentPill =
                    t.paymentStatus === "SUCCESS"
                      ? "bg-emerald-500/25 text-emerald-200 border-emerald-300/30"
                      : t.paymentStatus === "PENDING"
                        ? "bg-amber-500/25 text-amber-200 border-amber-300/30"
                        : t.paymentStatus === "FAILED"
                          ? "bg-rose-500/25 text-rose-200 border-rose-300/30"
                          : "bg-slate-500/25 text-slate-200 border-slate-400/30";

                  return (
                    <tr key={t.registrationId} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-slate-300">{formatDate(t.createdAt)}</td>
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-slate-100">{t.eventName ?? `Event #${t.eventId}`}</div>
                        <div className="text-xs text-slate-400">{t.eventDate ? formatDate(t.eventDate) : ""}</div>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{t.userEmail}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${statusPill}`}>
                          {t.registrationStatus}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${paymentPill}`}>
                          {t.paymentStatus ?? "N/A"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{t.receiptNumber ?? "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

