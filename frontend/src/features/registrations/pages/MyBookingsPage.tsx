import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { ApiError } from "../../../lib/http/httpClient";
import { useAppSelector } from "../../../store/hooks";
import { useGetMyConfirmedBookings } from "../api/queries";
import { useDownloadReceipt } from "../api/mutations";
import { useGetEventsByIds } from "../../events/api/queries";
import { Button, buttonVariants } from "../../../components/ui/button";
import { BookingCard } from "../components/BookingCard";
import { Card, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Download } from "lucide-react";


export function MyBookingsPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/sign-in");
    }
  }, [navigate, accessToken]);

  const { data: confirmedBookings = [], isLoading: isLoadingBookings } = useGetMyConfirmedBookings();
  const uniqueEventIds = useMemo(() => Array.from(new Set(confirmedBookings.map((b) => b.eventId))), [confirmedBookings]);
  const { data: events = [], isLoading: isLoadingEvents } = useGetEventsByIds(uniqueEventIds, uniqueEventIds.length > 0);

  const eventsById = useMemo(() => Object.fromEntries(events.map(e => [e.id, e])), [events]);
  const isLoading = isLoadingBookings || (uniqueEventIds.length > 0 && isLoadingEvents);

  const { mutateAsync: downloadReceipt } = useDownloadReceipt();

  const confirmedCount = confirmedBookings.length;

  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="border-brand-300/20 bg-slate-900/70 p-4 sm:p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl font-bold text-white">My Bookings</CardTitle>
            <CardDescription className="text-slate-300">
              {confirmedCount} confirmed booking{confirmedCount === 1 ? "" : "s"}. Receipts are
              available after payment confirmation.
            </CardDescription>
          </CardHeader>

          <div className="mt-4">
            <Link
              to="/bookings/upcoming"
              className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
            >
              View Upcoming Events
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={idx}
                  className="h-40 animate-pulse rounded-2xl border border-slate-700/80 bg-slate-900/60"
                />
              ))}
            </div>
          ) : confirmedBookings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-brand-300/30 bg-slate-900/55 p-10 text-center">
              <p className="text-lg font-semibold text-slate-100">No confirmed bookings yet</p>
              <p className="mt-2 text-sm text-slate-300">
                When your payment is confirmed, the booking will show up here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {confirmedBookings.map((b) => {
                const ev = eventsById[b.eventId];

                return (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    event={ev}
                    footer={
                      b.receiptId ? (
                        <Button
                          type="button"
                          variant="gradient"
                          className="w-full text-sm rounded-xl py-5"
                          onClick={() => {
                            if (!accessToken) return;
                            void downloadReceipt({
                              receiptId: b.receiptId as number,
                              receiptNumber: b.receiptNumber,
                            }).catch((err) => {
                              const message =
                                err instanceof ApiError ? err.message : "Unable to download receipt.";
                              toast.error(message);
                            });
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </Button>
                      ) : (
                        <div className="flex h-[44px] items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/50 text-sm font-medium text-slate-400">
                          Receipt generating...
                        </div>
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

