import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../../store/hooks";
import { setSession } from "../../../store/slices/authSlice";

type UserRole = "ADMIN" | "ORGANIZER" | "REGISTRANT";

const ROLE_REDIRECTS: Record<UserRole, string> = {
  ADMIN: "/admin",
  ORGANIZER: "/organizer",
  REGISTRANT: "/events",
};

export function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const role = params.get("role") as UserRole | null;
    const email = params.get("email");

    if (token && refreshToken && role) {
      processed.current = true;
      localStorage.setItem("event-registration.refresh-token", refreshToken);
      dispatch(setSession({ accessToken: token, role, email }));

      const redirectTo = ROLE_REDIRECTS[role] ?? "/events";
      navigate(redirectTo, { replace: true });
    } else {
      // Something went wrong - send them to sign-in
      navigate("/sign-in?error=oauth2_failed", { replace: true });
    }
  }, [dispatch, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Completing sign-in...</p>
      </div>
    </div>
  );
}
