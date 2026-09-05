import apiClient from "../../../api/axios";
import { USER_ENDPOINTS } from "../../users/api/endpoints";
import { AdminUserRole, CreateUserRequestDto, UserSummaryDto } from "../../users/types";

export type { AdminUserRole, CreateUserRequestDto, UserSummaryDto };


export async function getAdminOrganizers(): Promise<UserSummaryDto[]> {
  const response = await apiClient.get<UserSummaryDto[]>(USER_ENDPOINTS.ADMIN_ORGANIZERS);
  return response.data;
}

export async function getAdminRegistrants(): Promise<UserSummaryDto[]> {
  const response = await apiClient.get<UserSummaryDto[]>(USER_ENDPOINTS.ADMIN_REGISTRANTS);
  return response.data;
}

export async function createAdminUser({
  request,
}: {
  request: CreateUserRequestDto;
}): Promise<UserSummaryDto> {
  const endpoint = request.role === "ORGANIZER" 
    ? USER_ENDPOINTS.ADMIN_ORGANIZERS 
    : USER_ENDPOINTS.ADMIN_REGISTRANTS;
    
  const response = await apiClient.post<UserSummaryDto>(endpoint, request);
  return response.data;
}
