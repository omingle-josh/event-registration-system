export type AdminUserRole = "ORGANIZER" | "REGISTRANT" | "ADMIN";

export interface UserProfileDto {
  email: string;
  name: string;
  role: string | AdminUserRole;
}

export interface UpdateProfileRequestDto {
  name: string;
}

export interface CreateUserRequestDto {
  email: string;
  name: string;
  role: AdminUserRole;
  password?: string;
}

export interface UserSummaryDto {
  id: number;
  email: string;
  name: string;
  role: AdminUserRole;
  createdAt: string;
}

export interface AdminStatsDto {
  totalEvents: number;
  openEvents: number;
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  registrantsCount: number;
  organizersCount: number;
}
