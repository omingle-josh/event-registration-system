export const REGISTRATION_ENDPOINTS = {
  MY_BOOKINGS: "/registrations/me",
  MY_CONFIRMED: "/registrations/me/confirmed",
  REGISTER: "/registrations",
  DOWNLOAD_RECEIPT: (receiptId: number) => `/receipts/${receiptId}/download` as const,
  ORGANIZER_EVENT_REGISTRANTS: (eventId: number) => `/registrations/organizer/events/${eventId}/registrants` as const,
  ADMIN_TRANSACTIONS: "/registrations/admin/transactions",
};
