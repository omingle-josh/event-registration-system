import apiClient from "../../../api/axios";
import { EVENT_ENDPOINTS } from "../../events/api/endpoints";
import type { EventStatus, EventCreateRequestDto, PageResponse } from "../../events/api/eventsApi";

export type { PageResponse };

export interface OrganizerEventRequestDto extends EventCreateRequestDto {}

// ── Organizer event API ───────────────────────────────────────────────────────

export async function getMyOrganizerEvents({
  status,
  page = 0,
  size = 10,
}: {
  status?: EventStatus;
  page?: number;
  size?: number;
}): Promise<PageResponse<import("../../events/api/eventsApi").EventDto>> {
  const response = await apiClient.get<PageResponse<import("../../events/api/eventsApi").EventDto>>(EVENT_ENDPOINTS.ORGANIZER_EVENTS_MY, {
    params: { status, page, size },
  });
  return response.data;
}

export async function countMyOrganizerEvents({
  status,
}: {
  status?: EventStatus;
}): Promise<number> {
  const response = await apiClient.get<number>(EVENT_ENDPOINTS.ORGANIZER_EVENTS_MY_COUNT, {
    params: { status },
  });
  return response.data;
}

export async function createOrganizerEvent({
  request,
}: {
  request: OrganizerEventRequestDto;
}): Promise<import("../../events/api/eventsApi").EventDto> {
  const response = await apiClient.post<import("../../events/api/eventsApi").EventDto>(EVENT_ENDPOINTS.ORGANIZER_EVENTS, request);
  return response.data;
}

export async function updateOrganizerEvent({
  eventId,
  request,
}: {
  eventId: number;
  request: OrganizerEventRequestDto;
}): Promise<import("../../events/api/eventsApi").EventDto> {
  const response = await apiClient.put<import("../../events/api/eventsApi").EventDto>(EVENT_ENDPOINTS.ORGANIZER_EVENT_BY_ID(eventId), request);
  return response.data;
}

export async function changeOrganizerEventStatus({
  eventId,
  status,
}: {
  eventId: number;
  status: EventStatus;
}): Promise<import("../../events/api/eventsApi").EventDto> {
  const response = await apiClient.patch<import("../../events/api/eventsApi").EventDto>(EVENT_ENDPOINTS.ORGANIZER_CHANGE_STATUS(eventId), { status });
  return response.data;
}
