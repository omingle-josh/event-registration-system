import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerForEvent, downloadReceipt } from "./bookingsApi";

export function useRegisterForEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId }: { eventId: number }) =>
      registerForEvent(eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["my-confirmed-bookings"] });
      // We might also want to invalidate event details/available capacity
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      void queryClient.invalidateQueries({ queryKey: ["events-by-ids"] });
    },
  });
}

export function useDownloadReceipt() {
  return useMutation({
    mutationFn: ({ receiptId, receiptNumber }: { receiptId: number; receiptNumber?: string | null }) =>
      downloadReceipt({ receiptId, receiptNumber }),
  });
}
