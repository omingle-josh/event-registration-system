import apiClient from "../../../api/axios";
import { USER_ENDPOINTS } from "../../users/api/endpoints";
import { UserProfileDto, UpdateProfileRequestDto } from "../../users/types";

export type { UserProfileDto, UpdateProfileRequestDto };

export async function getMyProfile(): Promise<UserProfileDto> {
  const response = await apiClient.get<UserProfileDto>(USER_ENDPOINTS.PROFILE);
  return response.data;
}

export async function updateMyProfile({
  request,
}: {
  request: UpdateProfileRequestDto;
}): Promise<UserProfileDto> {
  const response = await apiClient.put<UserProfileDto>(USER_ENDPOINTS.PROFILE, request);
  return response.data;
}
