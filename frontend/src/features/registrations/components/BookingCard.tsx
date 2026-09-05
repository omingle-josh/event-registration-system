import * as React from "react"
import { CalendarDays, Receipt, Ticket } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../../components/ui/dialog"
import { cn } from "@/lib/utils"

interface BookingCardProps {
  booking: {
    id: number;
    eventId: number;
    status: string;
    receiptId?: number | null;
    receiptNumber?: string | null;
    qrCode?: string | null;
    createdAt: string;
  };
  event?: {
    name: string;
    date: string;
  };
  footer?: React.ReactNode;
}

export function BookingCard({ booking, event, footer }: BookingCardProps) {
  const formatEventDate = (dateIso: string) => {
    const parsed = new Date(dateIso);
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsed);
  };

  const currentStatus = booking.status;

  const statusVariant = (status: string) => {
    if (status === "CONFIRMED") return "default";
    if (status === "PENDING") return "secondary";
    return "destructive";
  };

  return (
    <Card className="group flex flex-col justify-between border-brand-200/20 bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-slate-800/75 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-glow">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-0">
        <CardTitle className="line-clamp-2 text-lg font-bold text-slate-100 transition-colors group-hover:text-brand-300">
          {event?.name ?? `Event #${booking.eventId}`}
        </CardTitle>
        <Badge
          variant={statusVariant(currentStatus) as any}
          className={cn(
            currentStatus === "CONFIRMED" &&
              "border-emerald-300/30 bg-emerald-500/20 text-emerald-300",
            currentStatus === "PENDING" && "border-amber-300/30 bg-amber-500/20 text-amber-300",
            currentStatus === "CANCELLED" && "border-rose-300/30 bg-rose-500/20 text-rose-300"
          )}
        >
          {currentStatus}
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2 text-sm text-slate-300">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent-cyan" />
            {event?.date ? formatEventDate(event.date) : "Date unavailable"}
          </p>
          <p className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-accent-pink" />
            Receipt #{booking.receiptNumber ?? "Pending"}
          </p>
        </div>
      </CardContent>
      {footer && (
        <CardFooter className="mt-auto border-t border-slate-700/50 bg-transparent pt-4 flex flex-col gap-2">
          {booking.status === "CONFIRMED" && booking.qrCode && (
            <Dialog>
              <DialogTrigger
                render={
                  <Button variant="outline" className="w-full border-brand-400/30 text-brand-300 hover:bg-brand-500/10">
                    <Ticket className="mr-2 h-4 w-4" />
                    View Ticket
                  </Button>
                }
              />
              <DialogContent className="border-brand-300/20 bg-slate-900 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl text-white">Event Entry Pass</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Present this QR code at the entrance for verification.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="rounded-2xl bg-white p-4 shadow-glow-cyan">
                    <img
                      src={`data:image/png;base64,${booking.qrCode}`}
                      alt="Ticket QR Code"
                      className="h-48 w-48"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white">{event?.name}</h3>
                    <p className="text-sm text-slate-300">
                       {event?.date ? formatEventDate(event.date) : ""}
                    </p>
                    <p className="mt-1 text-xs font-mono text-brand-300">
                      REG-#{booking.id}
                    </p>
                  </div>
                </div>
                <DialogFooter className="sm:justify-center">
                   <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest">
                      Unique Signed Secure Ticket
                   </p>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
