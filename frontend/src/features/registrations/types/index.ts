export type RegistrationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN";

export interface MyBookingDto {
  id: number;
  eventId: number;
  status: RegistrationStatus;
  receiptId?: number | null;
  receiptNumber?: string | null;
  qrCode?: string | null;
  createdAt: string;
}

export interface RegisterForEventResponseDto {
  id: number;
  status: RegistrationStatus;
  razorpayOrderId?: string | null;
  razorpayKeyId?: string | null;
  amount?: number | null;
  currency?: string | null;
}

export interface OrganizerRegistrantDto {
  registrationId: number;
  userEmail: string;
  registrationStatus: RegistrationStatus;
  paymentStatus?: string | null;
  receiptNumber?: string | null;
  createdAt: string;
}
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type AdminTransactionDto = {
  registrationId: number;
  eventId: number;

  eventName: string | null;
  eventDate: string | null;
  eventVenue: string | null;

  userEmail: string;

  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus | null;

  receiptId: number | null;
  receiptNumber: string | null;

  createdAt: string;
};
