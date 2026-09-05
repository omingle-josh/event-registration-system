import apiClient from "../../../api/axios";
import { EVENT_ENDPOINTS } from "../../events/api/endpoints";
import { EventStatus, EventDto, EventCreateRequestDto } from "../../events/types";
import { PageResponse } from "../../../shared/types";

// ── Admin events API ──────────────────────────────────────────────────────────

export async function getAdminEventsByStatus({
  status,
  page = 0,
  size = 10,
}: {
  status?: EventStatus;
  page?: number;
  size?: number;
}): Promise<PageResponse<EventDto>> {
  const response = await apiClient.get<PageResponse<EventDto>>(EVENT_ENDPOINTS.ADMIN_EVENTS, {
    params: { status, page, size },
  });
  return response.data;
}

export async function countAdminEventsByStatus({
  status,
}: {
  status?: EventStatus;
}): Promise<number> {
  const response = await apiClient.get<number>(EVENT_ENDPOINTS.ADMIN_EVENTS_COUNT, {
    params: { status },
  });
  return response.data;
}

export async function createAdminEvent({
  request,
}: {
  request: EventCreateRequestDto;
}): Promise<EventDto> {
  const response = await apiClient.post<EventDto>(EVENT_ENDPOINTS.GET_EVENTS, request);
  return response.data;
}

export async function updateAdminEvent({
  eventId,
  request,
}: {
  eventId: number;
  request: EventCreateRequestDto;
}): Promise<EventDto> {
  const response = await apiClient.put<EventDto>(EVENT_ENDPOINTS.ADMIN_EVENT_BY_ID(eventId), request);
  return response.data;
}

export async function changeAdminEventStatus({
  eventId,
  status,
}: {
  eventId: number;
  status: EventStatus;
}): Promise<EventDto> {
  const response = await apiClient.patch<EventDto>(EVENT_ENDPOINTS.ADMIN_CHANGE_STATUS(eventId), { status });
  return response.data;
}
