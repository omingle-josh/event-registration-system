import type { PaymentStatus, RegistrationStatus } from "./registrationTypes";

// These types mirror the backend DTO used for the admin transactions table.
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

