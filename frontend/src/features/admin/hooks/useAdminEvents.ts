import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminEventsByStatus,
  countAdminEventsByStatus,
  createAdminEvent,
  updateAdminEvent,
  changeAdminEventStatus,
} from "../api/adminEventsApi";
import { EventStatus, EventCreateRequestDto } from "../../events/types";

export function useAdminEventsByStatus({
  status,
  page,
  size,
}: {
  status?: EventStatus;
  page: number;
  size: number;
}) {
  return useQuery({
    queryKey: ["admin-events", status, page, size],
    queryFn: () => getAdminEventsByStatus({ status, page, size }),
    staleTime: 30_000,
  });
}

export function useCountAdminEventsByStatus({
  status,
}: {
  status?: EventStatus;
}) {
  return useQuery({
    queryKey: ["admin-events-count", status],
    queryFn: () => countAdminEventsByStatus({ status }),
    staleTime: 30_000,
  });
}

export function useCreateAdminEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: EventCreateRequestDto) =>
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
    mutationFn: ({
      eventId,
      request,
    }: {
      eventId: number;
      request: EventCreateRequestDto;
    }) => updateAdminEvent({ eventId, request }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}

export function useChangeAdminEventStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      status,
    }: {
      eventId: number;
      status: EventStatus;
    }) => changeAdminEventStatus({ eventId, status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-events-count"] });
    },
  });
}
