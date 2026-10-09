import { type EventDto } from "../api/eventsApi";

export function formatEventDate(dateIso: string): string {
  if (!dateIso) return "Date unavailable";
  const parsed = new Date(dateIso);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

/** Returns true if the event's date is strictly in the past (even by 1 minute). */
export function isEventPast(dateIso: string): boolean {
  if (!dateIso) return false;
  return new Date(dateIso).getTime() < Date.now();
}

export function statusVariant(status: EventDto["status"]) {
  switch (status) {
    case "OPEN":
      return "default";
    case "CLOSED":
      return "destructive";
    default:
      return "secondary";
  }
}
