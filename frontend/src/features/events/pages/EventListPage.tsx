import {
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  IndianRupee,
  MapPin,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../store/hooks";
import { getMyBookings } from "../../registrations/api/bookingsApi";
import { ApiError } from "../../../lib/http/httpClient";
import { type EventDto, type EventFilters } from "../types";
import { useGetEvents } from "../api/queries";
import { useGetMyConfirmedBookings as useMyConfirmedBookings } from "../../registrations/api/queries";
import { useRegisterForEvent } from "../../registrations/api/mutations";
import { loadRazorpayCheckout } from "../../../lib/payment/loadRazorpay";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { EmptyState } from "../../../components/shared/EmptyState";
import { EventCard } from "../components/EventCard";
import { formatEventDate, isEventPast, statusVariant } from "../utils/eventUtils";
import { ChatDialog } from "../components/ChatDialog";
import { MessageSquare } from "lucide-react";

const FilterSchema = z.object({
  venue: z.string().optional(),
  minFee: z.string().optional().refine((v) => !v || Number(v) >= 0, "Cannot be negative"),
  maxFee: z.string().optional().refine((v) => !v || Number(v) >= 0, "Cannot be negative"),
});

type FilterValues = z.infer<typeof FilterSchema>;

const initialFilters: FilterValues = {
  venue: "",
  minFee: "",
  maxFee: "",
};



export function EventListPage() {
  const { accessToken, role, email } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FilterValues>({
    resolver: zodResolver(FilterSchema),
    defaultValues: initialFilters,
  });
  const [appliedFilters, setAppliedFilters] = useState<EventFilters>({});
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
  const [registeringEventId, setRegisteringEventId] = useState<number | null>(null);
  const [shouldAnimateCards, setShouldAnimateCards] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const loadCountRef = useRef(0);

  const { data: rawEvents = [], isLoading, error } = useGetEvents(appliedFilters);
  const events = useMemo(() => rawEvents.filter(e => !isEventPast(e.date)), [rawEvents]);

  const { data: confirmedBookings = [] } = useMyConfirmedBookings({
    enabled: Boolean(accessToken && role === "REGISTRANT")
  });
  const confirmedEventIds = useMemo(() => new Set(confirmedBookings.map(b => b.eventId)), [confirmedBookings]);

  const { mutateAsync: registerAsync } = useRegisterForEvent();

  useEffect(() => {
    if (isLoading && loadCountRef.current === 0) {
      loadCountRef.current = 1;
    } else if (!isLoading) {
      setShouldAnimateCards(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      const message = error instanceof ApiError ? error.message : "Unable to load events right now.";
      toast.error(message);
    }
  }, [error]);

  const applyFilters = (data: FilterValues) => {
    setAppliedFilters({
      name: searchTerm || undefined,
      venue: data.venue || undefined,
      minFee: data.minFee ? Number(data.minFee) : undefined,
      maxFee: data.maxFee ? Number(data.maxFee) : undefined,
    });
  };



  async function handleRegister(eventId: number) {
    if (!accessToken) {
      toast.error("Please sign in to register.");
      navigate("/sign-in", { state: { from: "/events" } });
      return;
    }

    if (role !== "REGISTRANT") {
      toast.error("Only REGISTRANT users can register for events.");
      return;
    }

    setRegisteringEventId(eventId);
    try {
      const response = await registerAsync({ eventId });
      const requiresPayment = Boolean(response.razorpayOrderId && response.razorpayKeyId && response.amount && response.amount > 0);

      if (!requiresPayment) {
        toast.success("Booking confirmed successfully.");
        navigate("/bookings", { replace: true });
        setRegisteringEventId(null);
        return;
      }

      toast.success("Payment checkout opened. Complete payment to confirm your booking.");

      await loadRazorpayCheckout();
      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        toast.error("Payment gateway is not available. Please try again.");
        setRegisteringEventId(null);
        return;
      }
      const amountInPaise = String(Math.floor((response.amount ?? 0) * 100));
      const orderId = response.razorpayOrderId!;
      const keyId = response.razorpayKeyId!;

      const rzp = new RazorpayCtor({
        key: keyId,
        amount: amountInPaise,
        currency: response.currency ?? "INR",
        name: "Josh",
        description: "Event registration payment",
        order_id: orderId,
        prefill: {
          email: email ?? undefined,
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        theme: {
          color: "#3399cc",
        },
        handler: async () => {
          toast.success("Payment successful. Confirming booking...");
          try {
            // Poll until backend webhook flips status to CONFIRMED.
            let confirmed = false;
            for (let i = 0; i < 12; i += 1) {
              const my = await getMyBookings();
              const booking = my.find((b) => b.id === response.id);
              if (booking?.status === "CONFIRMED") {
                confirmed = true;
                break;
              }
              await new Promise((r) => setTimeout(r, 2000));
            }

            if (confirmed) toast.success("Booking confirmed!");
            else toast.success("Your booking is being confirmed. You can check My Bookings shortly.");

            navigate("/bookings", { replace: true });
          } catch {
            toast.success("Payment captured. You can check My Bookings for updates.");
            navigate("/bookings", { replace: true });
          } finally {
            setRegisteringEventId(null);
          }
        },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled.");
            setRegisteringEventId(null);
          },
        },
      });

      rzp.on("payment.failed", (failResp: unknown) => {
        const msg =
          failResp && typeof failResp === "object" && "error" in failResp
            ? "Payment failed. Your booking may be cancelled shortly."
            : "Payment failed. Please try again.";
        toast.error(msg);
        setRegisteringEventId(null);
      });

      rzp.open();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to register for this event right now.";
      const userMessage =
        error instanceof ApiError && error.status === 403
          ? "Session expired. Please sign in again."
          : message;
      toast.error(userMessage);
      setRegisteringEventId(null);
    }
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(2, 6, 23, 0.78), rgba(2, 6, 23, 0.88)), url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-brand-300/30 bg-gradient-to-br from-brand-700/55 via-sky-800/50 to-pink-700/45 p-8 shadow-glow">
          <div className="absolute -top-20 right-0 h-52 w-52 animate-pulseGlow rounded-full bg-accent-cyan blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-56 w-56 animate-pulseGlow rounded-full bg-accent-pink blur-3xl" />
          <div className="relative">
            <p className="mb-3 inline-block rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm font-medium text-slate-100">
              Discover experiences around you
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Explore Upcoming Events
            </h1>
            <p className="mt-3 max-w-2xl text-slate-100/90">
            From live shows to exclusive events — explore what’s trending near you.
            Secure your spot in seconds before seats run out.
            </p>
          </div>
        </section>

        <section className="relative mt-8 rounded-2xl border border-brand-300/20 bg-slate-900/70 p-4 backdrop-blur-sm sm:p-6">
          <form onSubmit={handleSubmit(applyFilters)}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-2.5 pl-10 pr-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                  placeholder="Search events by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleSubmit(applyFilters)();
                    }
                  }}
                />
              </div>

              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 px-4 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 hover:text-white h-10 min-h-[44px]"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-80 border-slate-700/60 bg-slate-950/95 p-5 backdrop-blur-md" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none text-slate-100">Filter Events</h4>
                      <p className="text-sm text-slate-400">Set criteria to find specific events.</p>
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <label className="mb-1 block text-sm text-slate-300">Venue</label>
                        <Input
                          className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                          placeholder="Bengaluru"
                          {...register("venue")}
                        />
                        {errors.venue && <p className="mt-1 text-xs text-rose-400">{errors.venue.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-sm text-slate-300">Min Fee</label>
                          <Input
                            type="number"
                            min="0"
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                            placeholder="0"
                            {...register("minFee")}
                          />
                          {errors.minFee && <p className="mt-1 text-xs text-rose-400">{errors.minFee.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1 block text-sm text-slate-300">Max Fee</label>
                          <Input
                            type="number"
                            min="0"
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                            placeholder="2500"
                            {...register("maxFee")}
                          />
                          {errors.maxFee && <p className="mt-1 text-xs text-rose-400">{errors.maxFee.message}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 rounded-xl border-slate-700 text-slate-300 hover:text-white"
                          onClick={() => {
                            reset(initialFilters);
                            setSearchTerm("");
                            setAppliedFilters({});
                            setShowFilters(false);
                          }}
                        >
                          Clear
                        </Button>
                        <Button
                          type="button"
                          variant="gradient"
                          className="flex-1 rounded-xl"
                          onClick={() => {
                            void handleSubmit((data) => {
                              applyFilters(data);
                              setShowFilters(false);
                            })();
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                type="submit"
                variant="gradient"
                className="inline-flex items-center gap-2 rounded-xl py-5"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </form>
        </section>

        <section className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-60 animate-pulse rounded-2xl border border-slate-700/80 bg-slate-900/60"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              title="No events match your filters."
              description="Try broadening your search by removing fee or venue constraints."
              className="mt-4 bg-slate-900/55 p-10"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((item, index) => (
                <EventCard
                  key={item.id}
                  event={item}
                  index={index}
                  shouldAnimate={shouldAnimateCards}
                  onClick={setSelectedEvent}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="border-brand-300/20 bg-slate-900 p-0 sm:max-w-2xl overflow-hidden shadow-2xl">
          {selectedEvent && (
            <>
              {/* Banner Image */}
              <div className="relative h-64 w-full">
                <img
                  src={selectedEvent.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"}
                  alt={selectedEvent.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              </div>

              {/* Header with gradient */}
              <DialogHeader className="relative -mt-20 p-6 sm:p-8 text-left z-10">
                <Badge variant={statusVariant(selectedEvent.status) as any} className="mb-3 w-fit">
                  {selectedEvent.status}
                </Badge>
                <DialogTitle className="text-2xl font-bold text-white sm:text-3xl">
                  {selectedEvent.name}
                </DialogTitle>
                <DialogDescription className="mt-2 flex items-center gap-2 text-sm text-brand-300">
                  <CircleUserRound className="h-4 w-4" />
                  Organized by {selectedEvent.organizerEmail ?? "Unknown"}
                </DialogDescription>
              </DialogHeader>

              {/* Content */}
              <div className="p-6 sm:p-8 pt-0">
                <div className="prose prose-sm prose-invert max-w-none text-slate-300">
                  <p className="whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
                
                <div className="mt-8 grid gap-4 rounded-2xl bg-slate-950/50 p-5 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-cyan/10">
                      <CalendarDays className="h-5 w-5 text-accent-cyan" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Date & Time</p>
                      <p className="text-sm font-medium text-slate-200">{formatEventDate(selectedEvent.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-pink/10">
                      <MapPin className="h-5 w-5 text-accent-pink" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Venue</p>
                      <p className="text-sm font-medium text-slate-200">{selectedEvent.venue}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-amber/10">
                      <IndianRupee className="h-5 w-5 text-accent-amber" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Registration Fee</p>
                      <p className="text-sm font-medium text-slate-200">{selectedEvent.fee.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-lime/10">
                      <Users className="h-5 w-5 text-accent-lime" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Availability</p>
                      <p className="text-sm font-medium text-slate-200">{selectedEvent.availableSeats} of {selectedEvent.capacity} seats</p>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="mt-8 border-t border-white/10 pt-6">
                  {accessToken && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsChatOpen(true)}
                      className="border border-brand-400/30 bg-slate-800 text-brand-300 hover:bg-slate-700 hover:text-white mr-auto"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Live Chat
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedEvent(null)}
                    className="border-none bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="gradient"
                    disabled={
                      isEventPast(selectedEvent.date) ||
                      selectedEvent.availableSeats <= 0 ||
                      registeringEventId === selectedEvent.id ||
                      (Boolean(accessToken) && role !== "REGISTRANT") ||
                      confirmedEventIds.has(selectedEvent.id)
                    }
                    onClick={() => void handleRegister(selectedEvent.id)}
                    className="rounded-xl px-6"
                  >
                    {isEventPast(selectedEvent.date)
                      ? "Event Ended"
                      : confirmedEventIds.has(selectedEvent.id)
                      ? "Already Registered"
                      : registeringEventId === selectedEvent.id
                      ? "Registering..."
                      : selectedEvent.availableSeats <= 0
                        ? "Sold Out"
                        : Boolean(accessToken) && role !== "REGISTRANT"
                          ? "Registrants only"
                          : "Pay & Register"}
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {selectedEvent && isChatOpen && (
        <ChatDialog
          eventId={selectedEvent.id}
          eventName={selectedEvent.name}
          isOpen={isChatOpen}
          onOpenChange={setIsChatOpen}
        />
      )}
    </main>
  );
}
