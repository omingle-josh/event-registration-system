import { useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { ApiError } from "../../../lib/http/httpClient";
import { useGetMyConfirmedBookings } from "../api/queries";
import { useGetEventsByIds } from "../../events/api/queries";
import { BookingCard } from "../components/BookingCard";
import { Card, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import type { MyBookingDto } from "../types";
import type { EventDto } from "../../events/types";

function isFuture(dateIso: string): boolean {
  const d = new Date(dateIso);
  return Number.isFinite(d.getTime()) && d.getTime() >= Date.now();
}

export function MyUpcomingEventsPage() {
  const navigate = useNavigate();

  const { data: myBookings = [], isLoading: isLoadingBookings, error } = useGetMyConfirmedBookings();

  if (error) {
    if (error instanceof ApiError) toast.error(error.message);
    else toast.error("Unable to load upcoming events.");
    navigate("/sign-in", { replace: true });
  }

  const uniqueEventIds = useMemo(() => Array.from(new Set(myBookings.map((b) => b.eventId))), [myBookings]);

  const { data: events = [], isLoading: isLoadingEvents } = useGetEventsByIds(uniqueEventIds, uniqueEventIds.length > 0);

  const isLoading = isLoadingBookings || isLoadingEvents;

  const upcoming = useMemo(() => {
    const eventsById = Object.fromEntries(events.map((e) => [e.id, e]));
    return myBookings
      .map((booking) => ({ booking, event: eventsById[booking.eventId] }))
      .filter((row) => row.event && isFuture(row.event.date.toString()))
      .sort((a, b) => new Date(a.event.date.toString()).getTime() - new Date(b.event.date.toString()).getTime()) as Array<{ booking: MyBookingDto; event: EventDto }>;
  }, [myBookings, events]);

  const upcomingCount = upcoming.length;

  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="border-brand-300/20 bg-slate-900/70 p-4 sm:p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl font-bold text-white">Upcoming Events</CardTitle>
            <CardDescription className="text-sm text-slate-300">
              {upcomingCount} upcoming event{upcomingCount === 1 ? "" : "s"} you have confirmed.
            </CardDescription>
          </CardHeader>

          {isLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-40 animate-pulse rounded-2xl border border-slate-700/80 bg-slate-900/60"
                />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-brand-300/30 bg-slate-900/55 p-10 text-center">
              <p className="text-lg font-semibold text-slate-100">No upcoming events</p>
              <p className="mt-2 text-sm text-slate-300">
                When your payments are confirmed, upcoming events will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map(({ booking, event }) => (
                <BookingCard key={booking.id} booking={booking} event={event} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

