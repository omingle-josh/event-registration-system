import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../../auth/api/userApi";
import { getAdminOrganizers, getAdminRegistrants } from "../../admin/api/adminUsersApi";
import apiClient from "../../../api/axios";
import { USER_ENDPOINTS } from "./endpoints";
import type { AdminStatsDto } from "../types/index";

export function useGetMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
    staleTime: 60_000,
  });
}

export function useGetAdminOrganizers() {
  return useQuery({
    queryKey: ["admin-organizers"],
    queryFn: () => getAdminOrganizers(),
  });
}

export function useGetAdminRegistrants() {
  return useQuery({
    queryKey: ["admin-registrants"],
    queryFn: () => getAdminRegistrants(),
  });
}

export function useGetAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await apiClient.get<AdminStatsDto>(USER_ENDPOINTS.ADMIN_STATS);
      return response.data;
    },
    staleTime: 60_000,
  });
}
