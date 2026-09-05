import { Link } from "react-router";
import { useCountOrganizerEvents, useGetOrganizerEvents } from "../../events/api/queries";

export function OrganizerDashboardPage() {

  const { data: totalEventsData, isLoading: isLoadingTotal } = useCountOrganizerEvents({});
  const { data: openEventsData, isLoading: isLoadingOpenCount } = useCountOrganizerEvents({ status: "OPEN" });
  const { data: listData, isLoading: isLoadingList } = useGetOrganizerEvents({ status: "OPEN", page: 0, size: 5 });

  const totalEvents = totalEventsData ?? null;
  const openEvents = openEventsData ?? null;
  const preview = listData?.content ?? [];
  const isLoading = isLoadingTotal || isLoadingOpenCount || isLoadingList;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-brand-300/20 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Organizer Dashboard</h1>
            <p className="mt-2 text-sm text-slate-300">
              Manage your events and view registrations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/organizer/events"
              className="inline-flex rounded-xl bg-gradient-to-r from-brand-500 to-accent-pink px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              My Events
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-900/40 to-slate-950/80 p-6 shadow-lg">
            <h2 className="text-sm font-semibold text-brand-300">Total Events</h2>
            <p className="mt-2 text-3xl font-bold text-white">{totalEvents ?? "—"}</p>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-brand-500/10 blur-2xl" />
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 to-slate-950/80 p-6 shadow-lg">
            <h2 className="text-sm font-semibold text-emerald-300">OPEN Events</h2>
            <p className="mt-2 text-3xl font-bold text-white">{openEvents ?? "—"}</p>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Latest Open Events</h2>
              <p className="mt-1 text-xs text-slate-400">Quick access to registrants.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={idx} className="h-16 animate-pulse rounded-xl bg-slate-800/60" />
              ))}
            </div>
          ) : preview.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No OPEN events found.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-100">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-4 font-semibold text-slate-200">Event Name</th>
                    <th className="py-3 pr-4 font-semibold text-slate-200">Venue</th>
                    <th className="py-3 pr-4 font-semibold text-slate-200">Registrants</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((e) => (
                    <tr key={e.id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-slate-100">{e.name}</div>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{e.venue}</td>
                      <td className="py-3 pr-4">
                        <Link
                          to={`/organizer/events/${e.id}/registrants`}
                          className="inline-flex rounded-xl border border-slate-600 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-300 hover:text-white"
                        >
                          View Registrants
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

