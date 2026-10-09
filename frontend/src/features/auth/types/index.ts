export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  role: "ADMIN" | "ORGANIZER" | "REGISTRANT";
  email: string | null;
}

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
  role: "ADMIN" | "ORGANIZER" | "REGISTRANT";
  email: string | null;
}
