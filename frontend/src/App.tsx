import { useEffect, useState } from "react";
import { useAppSelector } from "./store/hooks";
import { RouterProvider } from "react-router";
import { router } from "./routes/AppRouter";
import { performRefresh } from "./api/axios";

export default function App() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      const storedRefreshToken = localStorage.getItem("event-registration.refresh-token");

      if (storedRefreshToken && !accessToken) {
        try {
          await performRefresh();
        } catch (error) {
          console.error("Auto-refresh initialization failed:", error);
        }
      }
      setIsInitializing(false);
    }

    initializeAuth();
  }, [accessToken]);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
