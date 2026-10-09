import { useQuery } from "@tanstack/react-query";

import { getEvents, getEventsByIds, type EventFilters } from "../api/eventsApi";

// ── Public events query ──────────────────────────────────────────────────────

export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => getEvents(filters),
    staleTime: 30_000,
  });
}

// ── Events by IDs (for my-bookings / upcoming pages) ────────────────────────

export function useEventsByIds(ids: number[], enabled = true) {
  return useQuery({
    queryKey: ["events-by-ids", ids],
    queryFn: () => getEventsByIds(ids),
    enabled: enabled && ids.length > 0,
    staleTime: 60_000,
  });
}
