import apiClient from "../../../api/axios";

export interface AdminStatsDto {
  totalEvents: number;
  openEvents: number;
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  registrantsCount: number;
  organizersCount: number;
}


export async function getAdminStats(): Promise<AdminStatsDto> {
  const response = await apiClient.get<AdminStatsDto>("/admin/stats");
  return response.data;
}
