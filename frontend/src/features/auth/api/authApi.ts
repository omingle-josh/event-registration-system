import apiClient from "../../../api/axios";
import { AUTH_ENDPOINTS } from "./endpoints";
import { LoginRequestDto, RegisterRequestDto, AuthResponseDto, RefreshResponseDto } from "../types";

export type { LoginRequestDto, RegisterRequestDto, AuthResponseDto, RefreshResponseDto };

export async function login(request: LoginRequestDto): Promise<AuthResponseDto> {
  const response = await apiClient.post<AuthResponseDto>(AUTH_ENDPOINTS.LOGIN, request);
  return response.data;
}

export async function register(request: RegisterRequestDto): Promise<void> {
  const response = await apiClient.post<void>(AUTH_ENDPOINTS.REGISTER, request);
  return response.data;
}

export async function refreshToken(token: string): Promise<RefreshResponseDto> {
  const response = await apiClient.post<RefreshResponseDto>("/auth/refresh", { refreshToken: token });
  return response.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post("/auth/logout", { refreshToken });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
  return response.data;
}

export async function resetPassword(data: { email: string; otpCode: string; newPassword: string }): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(AUTH_ENDPOINTS.RESET_PASSWORD, data);
  return response.data;
}
