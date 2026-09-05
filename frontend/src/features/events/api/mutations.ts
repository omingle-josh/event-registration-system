import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminEvent, updateAdminEvent, changeAdminEventStatus } from "../../admin/api/adminEventsApi";
import { createOrganizerEvent, updateOrganizerEvent, changeOrganizerEventStatus } from "../../organizer/api/organizerEventsApi";
import { EventCreateRequestDto, EventStatus } from "../types";

export function useCreateAdminEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ request }: { request: EventCreateRequestDto }) =>
      createAdminEvent({ request }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-events-count"] });
    },
  });
}

export function useUpdateAdminEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, request }: { eventId: number; request: EventCreateRequestDto }) => 
      updateAdminEvent({ eventId, request }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}

export function useChangeAdminEventStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: number; status: EventStatus }) => 
      changeAdminEventStatus({ eventId, status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-events-count"] });
    },
  });
}

export function useCreateOrganizerEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ request }: { request: EventCreateRequestDto }) =>
      createOrganizerEvent({ request }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      void queryClient.invalidateQueries({ queryKey: ["organizer-events-count"] });
    },
  });
}

export function useUpdateOrganizerEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, request }: { eventId: number; request: EventCreateRequestDto }) => 
      updateOrganizerEvent({ eventId, request }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
    },
  });
}

export function useChangeOrganizerEventStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: number; status: EventStatus }) => 
      changeOrganizerEventStatus({ eventId, status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      void queryClient.invalidateQueries({ queryKey: ["organizer-events-count"] });
    },
  });
}
