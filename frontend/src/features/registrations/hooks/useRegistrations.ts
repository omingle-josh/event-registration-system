import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyConfirmedBookings,
  registerForEvent,
  downloadReceipt as downloadReceiptApi,
} from "../api/bookingsApi";


// ── My confirmed bookings ─────────────────────────────────────────────────────

export function useMyConfirmedBookings() {
  return useQuery({
    queryKey: ["my-confirmed-bookings"],
    queryFn: () => getMyConfirmedBookings(),
    staleTime: 30_000,
  });
}

// ── Register for an event ─────────────────────────────────────────────────────

export function useRegisterForEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId }: { eventId: number }) =>
      registerForEvent(eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-confirmed-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// ── Download receipt ──────────────────────────────────────────────────────────

export function useDownloadReceipt() {
  return useMutation({
    mutationFn: downloadReceiptApi,
  });
}
