import apiClient from "../../../api/axios";
import { REGISTRATION_ENDPOINTS } from "./endpoints";
import { RegistrationStatus, MyBookingDto, RegisterForEventResponseDto, AdminTransactionDto } from "../types";

import { PageResponse } from "../../events/types";
export type { RegistrationStatus, MyBookingDto, RegisterForEventResponseDto };

export interface TicketVerificationResponse {
  valid: boolean;
  message: string;
  registrationId?: number;
  userEmail?: string;
  currentStatus?: RegistrationStatus;
}

export async function getAdminTransactions({
  page = 0,
  size = 10,
}: {
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminTransactionDto>> {
  const response = await apiClient.get<PageResponse<AdminTransactionDto>>(REGISTRATION_ENDPOINTS.ADMIN_TRANSACTIONS, {
    params: { page, size },
  });
  return response.data;
}

// ── Registrant bookings ──────────────────────────────────────────────────────

export async function getMyBookings(): Promise<MyBookingDto[]> {
  const response = await apiClient.get<MyBookingDto[]>(REGISTRATION_ENDPOINTS.MY_BOOKINGS);
  return response.data;
}

export async function getMyConfirmedBookings(): Promise<MyBookingDto[]> {
  const response = await apiClient.get<MyBookingDto[]>(REGISTRATION_ENDPOINTS.MY_CONFIRMED);
  return response.data;
}

// ── Register for an event ────────────────────────────────────────────────────

export async function registerForEvent(
  eventId: number
): Promise<RegisterForEventResponseDto> {
  const response = await apiClient.post<RegisterForEventResponseDto>(REGISTRATION_ENDPOINTS.REGISTER, {
    eventId,
  });
  return response.data;
}

// ── Download receipt ─────────────────────────────────────────────────────────

export async function downloadReceipt({
  receiptId,
  receiptNumber,
}: {
  receiptId: number;
  receiptNumber?: string | null;
}): Promise<void> {
  const response = await apiClient.get(REGISTRATION_ENDPOINTS.DOWNLOAD_RECEIPT(receiptId), {
    responseType: "blob",
  });
  
  const url = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = receiptNumber ? `receipt-${receiptNumber}.pdf` : `receipt-${receiptId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Ticket Verification (Organizer) ──────────────────────────────────────────

export async function verifyTicket(rawData: String): Promise<TicketVerificationResponse> {
  const response = await apiClient.post<TicketVerificationResponse>("/registrations/organizer/verify-ticket", {
    rawData,
  });
  return response.data;
}
