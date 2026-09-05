import { ArrowRight, CalendarDays, IndianRupee, MapPin, Users } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { type EventDto } from "../api/eventsApi";
import { formatEventDate, statusVariant } from "../utils/eventUtils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventDto;
  index?: number;
  shouldAnimate?: boolean;
  onClick?: (event: EventDto) => void;
}

export function EventCard({ event, index = 0, shouldAnimate = false, onClick }: EventCardProps) {
  const fallbackImage = `https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80`;
  const imageToUse = event.imageUrl || fallbackImage;

  return (
    <Card
      onClick={() => onClick?.(event)}
      className={cn(
        "group cursor-pointer border-brand-200/20 bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-slate-800/75 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-brand-400/40 hover:shadow-glow",
        shouldAnimate && "animate-fadeUp"
      )}
      style={shouldAnimate ? { animationDelay: `${index * 80}ms` } : undefined}
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-slate-800">
        <img
          src={imageToUse}
          alt={event.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
      </div>

      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-0 pt-4">
        <CardTitle className="line-clamp-2 text-lg font-semibold text-slate-100">
          {event.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          {event.availableSeats <= 0 && <Badge variant="destructive">Sold Out</Badge>}
          <Badge variant={statusVariant(event.status) as any}>{event.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <p className="mb-5 line-clamp-3 text-sm text-slate-300">{event.description}</p>
        <div className="space-y-2 text-sm text-slate-200">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent-cyan" />
            {formatEventDate(event.date)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent-pink" />
            {event.venue}
          </p>
          <p className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-accent-amber" />
            {event.fee.toLocaleString("en-IN")}
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent-lime" />
            {event.availableSeats} seats left / {event.capacity}
          </p>
        </div>
      </CardContent>

      <CardFooter className="mt-auto border-t border-white/10 bg-transparent pt-4">
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-semibold text-brand-300 transition group-hover:text-brand-400">
            View Details
          </span>
          <ArrowRight className="h-4 w-4 text-brand-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-400" />
        </div>
      </CardFooter>
    </Card>
  );
}
