import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { EventStatus } from "../../events/api/eventsApi";
import {
  getMyOrganizerEvents,
  countMyOrganizerEvents,
  createOrganizerEvent,
  updateOrganizerEvent,
  changeOrganizerEventStatus,
  type OrganizerEventRequestDto,
} from "../api/organizerEventsApi";

// ── Queries ───────────────────────────────────────────────────────────────────

export function useMyOrganizerEvents({
  status,
  page,
  size,
}: {
  status?: EventStatus;
  page: number;
  size: number;
}) {
  return useQuery({
    queryKey: ["organizer-events", status, page, size],
    queryFn: () => getMyOrganizerEvents({ status, page, size }),
    staleTime: 30_000,
  });
}

export function useCountMyOrganizerEvents({
  status,
}: {
  status?: EventStatus;
}) {
  return useQuery({
    queryKey: ["organizer-events-count", status],
    queryFn: () => countMyOrganizerEvents({ status }),
    staleTime: 30_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateOrganizerEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: OrganizerEventRequestDto) =>
      createOrganizerEvent({ request }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
    },
  });
}

export function useUpdateOrganizerEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      request,
    }: {
      eventId: number;
      request: OrganizerEventRequestDto;
    }) => updateOrganizerEvent({ eventId, request }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
    },
  });
}

export function useChangeOrganizerEventStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      status,
    }: {
      eventId: number;
      status: EventStatus;
    }) => changeOrganizerEventStatus({ eventId, status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
    },
  });
}
