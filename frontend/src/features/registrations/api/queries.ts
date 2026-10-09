import { useQuery } from "@tanstack/react-query";
import { getMyBookings, getMyConfirmedBookings, getAdminTransactions } from "./bookingsApi";
import { getOrganizerEventRegistrants } from "../../organizer/api/organizerRegistrantsApi";
import { RegistrationStatus } from "../types";

export function useGetMyBookings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => getMyBookings(),
    enabled: options?.enabled,
  });
}

export function useGetMyConfirmedBookings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["my-confirmed-bookings"],
    queryFn: () => getMyConfirmedBookings(),
    enabled: options?.enabled,
  });
}

export function useGetOrganizerEventRegistrants({
  eventId,
  status,
  page,
  size,
}: {
  eventId: number;
  status?: RegistrationStatus;
  page: number;
  size: number;
}) {
  return useQuery({
    queryKey: ["organizer-registrants", eventId, status, page, size],
    queryFn: () => getOrganizerEventRegistrants({ eventId, status, page, size }),
    enabled: Boolean(eventId),
  });
}

export function useGetAdminTransactions({
  page,
  size = 10,
}: {
  page: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["admin-transactions", page, size],
    queryFn: () => getAdminTransactions({ page, size }),
  });
}
