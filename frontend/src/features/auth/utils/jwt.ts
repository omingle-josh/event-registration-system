import { jwtDecode } from "jwt-decode";
import type { AuthState } from "../../../store/slices/authSlice";

type JwtPayload = {
  sub?: string;
  role?: "ADMIN" | "ORGANIZER" | "REGISTRANT";
  exp?: number;
};

export function getSessionFromToken(token: string): Omit<AuthState, "accessToken"> {
  const decoded = jwtDecode<JwtPayload>(token);
  return {
    role: decoded.role ?? null,
    email: decoded.sub ?? null,
  };
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return true;
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
