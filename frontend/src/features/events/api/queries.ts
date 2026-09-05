import { useQuery } from "@tanstack/react-query";
import { getEvents, getEventsByIds } from "./eventsApi";
import { getAdminEventsByStatus, countAdminEventsByStatus } from "../../admin/api/adminEventsApi";
import { getMyOrganizerEvents, countMyOrganizerEvents } from "../../organizer/api/organizerEventsApi";
import { EventFilters, EventStatus } from "../types";

export function useGetEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => getEvents(filters),
    staleTime: 30_000,
  });
}

export function useGetEventsByIds(ids: number[], enabled = true) {
  return useQuery({
    queryKey: ["events-by-ids", ids],
    queryFn: () => getEventsByIds(ids),
    enabled: enabled && ids.length > 0,
    staleTime: 60_000,
  });
}

export function useGetAdminEvents({ status, page, size }: { status?: EventStatus; page: number; size: number }) {
  return useQuery({
    queryKey: ["admin-events", status, page, size],
    queryFn: () => getAdminEventsByStatus({ status, page, size }),
    // enabled: Boolean(token),
    staleTime: 30_000,
  });
}

export function useCountAdminEvents({ status }: { status?: EventStatus }) {
  return useQuery({
    queryKey: ["admin-events-count", status],
    queryFn: () => countAdminEventsByStatus({ status }),
    //enabled: Boolean(token),
    staleTime: 30_000,
  });
}

export function useGetOrganizerEvents({ status, page, size }: { status?: EventStatus; page: number; size: number }) {
  return useQuery({
    queryKey: ["organizer-events", status, page, size],
    queryFn: () => getMyOrganizerEvents({ status, page, size }),
    // enabled: Boolean(token),
    staleTime: 30_000,
  });
}

export function useCountOrganizerEvents({ status }: { status?: EventStatus }) {
  return useQuery({
    queryKey: ["organizer-events-count", status],
    queryFn: () => countMyOrganizerEvents({ status }),
    staleTime: 30_000,
  });
}
