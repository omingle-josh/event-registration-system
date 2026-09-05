import apiClient from "../../../api/axios";
import { EVENT_ENDPOINTS } from "./endpoints";
import { EventDto, EventFilters, EventStatus, EventCreateRequestDto } from "../types";
import { PageResponse } from "../../../shared/types";

export type { EventDto, EventFilters, EventStatus, EventCreateRequestDto, PageResponse };

// ── Public / Registrant ──────────────────────────────────────────────────────

export async function getEvents(filters: EventFilters = {}): Promise<EventDto[]> {
  const response = await apiClient.get<EventDto[]>(EVENT_ENDPOINTS.GET_EVENTS, {
    params: {
      name: filters.name,
      venue: filters.venue,
      minFee: filters.minFee,
      maxFee: filters.maxFee,
    },
  });
  return response.data;
}

export async function getEventsByIds(ids: number[]): Promise<EventDto[]> {
  if (ids.length === 0) return [];
  const query = ids.map((id) => `ids=${id}`).join("&");
  const response = await apiClient.get<EventDto[]>(`${EVENT_ENDPOINTS.GET_EVENTS_BY_IDS}?${query}`);
  return response.data;
}

export async function generateAiDescription(title: string): Promise<string> {
  const response = await apiClient.post<{ description: string }>(
    EVENT_ENDPOINTS.AI_MAGIC_DESCRIPTION,
    { title }
  );
  return response.data.description;
}
