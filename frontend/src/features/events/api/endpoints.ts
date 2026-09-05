export const EVENT_ENDPOINTS = {
  GET_EVENTS: "/events",
  GET_EVENTS_BY_IDS: "/events/bulk",
  ADMIN_EVENTS: "/events/admin/events",
  ADMIN_EVENTS_COUNT: "/events/admin/events/count",
  ADMIN_EVENT_BY_ID: (id: number) => `/events/${id}` as const,
  ADMIN_CHANGE_STATUS: (id: number) => `/events/${id}/status` as const,
  ORGANIZER_EVENTS_MY: "/events/organizer/me",
  ORGANIZER_EVENTS_MY_COUNT: "/events/organizer/me/count",
  ORGANIZER_EVENTS: "/events",
  ORGANIZER_EVENT_BY_ID: (id: number) => `/events/${id}` as const,
  ORGANIZER_CHANGE_STATUS: (id: number) => `/events/${id}/status` as const,
  AI_MAGIC_DESCRIPTION: "/events/ai/magic-description",
};
