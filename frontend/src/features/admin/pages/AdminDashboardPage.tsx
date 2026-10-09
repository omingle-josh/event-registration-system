import { useState } from "react";
import { Link } from "react-router";
//import { useAppSelector } from "../../../store/hooks";
import { useGetAdminStats as useAdminStats } from "../../users/api/queries";
import { useGetAdminEvents as useAdminEventsByStatus, useCountAdminEvents as useCountAdminEventsByStatus } from "../../events/api/queries";
import { useGetAdminTransactions as useAdminTransactions } from "../../registrations/api/queries";
import { CommonTable } from "../../../components/ui/data-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Button, buttonVariants } from "../../../components/ui/button";

export function AdminDashboardPage() {
  // const { token } = useAppSelector((s) => s.auth);

  const [transactionsPage, setTransactionsPage] = useState(0);

  const { data: stats } = useAdminStats();
  const { data: countData } = useCountAdminEventsByStatus({ status: "OPEN" });
  const { data: eventsData, isLoading: isLoadingEvents } = useAdminEventsByStatus({ status: "OPEN", page: 0, size: 5 });
  const { data: transactionsData } = useAdminTransactions({ page: transactionsPage, size: 10 });

  const openEventsCount = countData ?? null;
  const openEventsPreview = eventsData?.content?.map(e => ({
    id: e.id,
    name: e.name,
    date: e.date,
    venue: e.venue,
    organizerEmail: e.organizerEmail,
    availableSeats: e.availableSeats,
    capacity: e.capacity,
  })) ?? [];
  const isLoading = isLoadingEvents;

  const totalPages = transactionsData?.totalPages ?? 0;
  const hasPrev = transactionsPage > 0;
  const hasNext = transactionsPage + 1 < totalPages;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-brand-300/20 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-300">
              Overview of users, open events, and latest registrations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/events"
              className="inline-flex rounded-xl bg-gradient-to-r from-brand-500 to-accent-pink px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Manage Events
            </Link>
            <Link
              to="/admin/transactions"
              className="inline-flex rounded-xl border border-slate-600 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-300 hover:text-white"
            >
              Transactions
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/5 bg-slate-900/50 shadow-sm transition hover:border-brand-500/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Total Users</CardDescription>
              <CardTitle className="text-3xl font-bold text-white">{stats?.totalUsers ?? "—"}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-white/5 bg-slate-900/50 shadow-sm transition hover:border-brand-500/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Registrants</CardDescription>
              <CardTitle className="text-3xl font-bold text-white">{stats?.registrantsCount ?? "—"}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-white/5 bg-slate-900/50 shadow-sm transition hover:border-brand-500/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Organizers</CardDescription>
              <CardTitle className="text-3xl font-bold text-white">{stats?.organizersCount ?? "—"}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-white/5 bg-slate-900/50 shadow-sm transition hover:border-brand-500/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Open Events</CardDescription>
              <CardTitle className="text-3xl font-bold text-white">{openEventsCount ?? "—"}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-white/5 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Latest Open Events</CardTitle>
                <CardDescription className="text-slate-400">Most recent OPEN entries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {openEventsPreview.map((e) => (
                  <Card key={e.id} size="sm" className="border-white/5 bg-slate-800/40">
                    <CardHeader className="p-3">
                      <div className="font-semibold text-slate-100">{e.name}</div>
                      <CardDescription className="text-xs text-slate-400">{e.venue}</CardDescription>
                      <div className="mt-1 text-xs text-slate-400">Organizer: {e.organizerEmail}</div>
                      <div className="text-xs text-slate-300">
                        Seats: {e.availableSeats}/{e.capacity}
                      </div>
                      <div className="mt-1 text-xs text-slate-300">
                        {new Date(e.date).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
                {openEventsPreview.length === 0 && !isLoading ? (
                  <div className="text-sm text-slate-400 text-center py-4">No open events yet.</div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Link
                  to="/admin/registrants"
                  className={buttonVariants({ variant: "gradient", className: "w-full" })}
                >
                  Registrants
                </Link>
                <Link
                  to="/admin/organizers"
                  className={buttonVariants({ variant: "gradient", className: "w-full" })}
                >
                  Organizers
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-white/5 bg-slate-900/50">
              <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="text-white">Latest Registrations</CardTitle>
                  <CardDescription className="text-slate-400">Table is paginated (10 rows per page).</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 bg-slate-800/10 hover:bg-slate-800/60"
                    disabled={!hasPrev}
                    onClick={() => setTransactionsPage((p) => Math.max(0, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 bg-slate-800/10 hover:bg-slate-800/60"
                    disabled={!hasNext}
                    onClick={() => setTransactionsPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CommonTable
                  data={transactionsData?.content ?? []}
                  keyExtractor={(t) => t.registrationId}
                  columns={[
                    {
                      key: "time",
                      header: "Time",
                      cell: (t) => (
                        <span className="text-slate-300">
                          {new Date(t.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      ),
                    },
                    {
                      key: "event",
                      header: "Event",
                      cell: (t) => (
                        <>
                          <div className="font-semibold text-slate-100">
                            {t.eventName ?? `Event #${t.eventId}`}
                          </div>
                          <div className="text-xs text-slate-400">
                            {t.eventDate
                              ? new Date(t.eventDate).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : ""}
                          </div>
                        </>
                      ),
                    },
                    {
                      key: "registrant",
                      header: "Registrant",
                      cell: (t) => <span className="text-slate-300">{t.userEmail}</span>,
                    },
                    {
                      key: "status",
                      header: "Status",
                      cell: (t) => (
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-medium ${
                            t.registrationStatus === "CONFIRMED"
                              ? "bg-emerald-500/25 text-emerald-200 border-emerald-300/30"
                              : t.registrationStatus === "PENDING"
                              ? "bg-amber-500/25 text-amber-200 border-amber-300/30"
                              : "bg-rose-500/25 text-rose-200 border-rose-300/30"
                          }`}
                        >
                          {t.registrationStatus}
                        </span>
                      ),
                    },
                    {
                      key: "receipt",
                      header: "Receipt",
                      cell: (t) => <span className="text-slate-300">{t.receiptNumber ?? "—"}</span>,
                    },
                  ]}
                />
                {transactionsData && transactionsData.content.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">No transactions found.</div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

