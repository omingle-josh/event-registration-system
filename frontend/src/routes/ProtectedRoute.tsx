import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "../store/hooks";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Array<"ADMIN" | "ORGANIZER" | "REGISTRANT">;
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const auth = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!auth.accessToken) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles) {
    // Role may be restored asynchronously from the JWT; avoid redirect loops.
    if (!auth.role) {
      return null;
    }
    if (!allowedRoles.includes(auth.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
