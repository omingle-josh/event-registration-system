import apiClient from "../../../api/axios";
import { REGISTRATION_ENDPOINTS } from "../../registrations/api/endpoints";
import { OrganizerRegistrantDto, RegistrationStatus } from "../../registrations/types";
import { PageResponse } from "../../../shared/types";

export type OrganizerRegistrationStatus = RegistrationStatus;
export type { OrganizerRegistrantDto, PageResponse };

export async function getOrganizerEventRegistrants({
  eventId,
  status,
  page = 0,
  size = 10,
}: {
  eventId: number;
  status?: OrganizerRegistrationStatus;
  page?: number;
  size?: number;
}): Promise<PageResponse<OrganizerRegistrantDto>> {
  const response = await apiClient.get<PageResponse<OrganizerRegistrantDto>>(REGISTRATION_ENDPOINTS.ORGANIZER_EVENT_REGISTRANTS(eventId), {
    params: { status, page, size },
  });
  return response.data;
}
