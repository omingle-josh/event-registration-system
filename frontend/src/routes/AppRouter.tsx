import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { lazy, Suspense } from "react";
import { AppNavbar } from "../components/layout/AppNavbar";
import { ProtectedRoute } from "./ProtectedRoute";

// Lazy-loaded pages (code splitting)
const HomePage = lazy(() => import("../pages/HomePage").then(m => ({ default: m.HomePage })));
const ProfilePage = lazy(() => import("../pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const EventListPage = lazy(() => import("../features/events/pages/EventListPage").then(m => ({ default: m.EventListPage })));
const SignInPage = lazy(() => import("../features/auth/pages/SignInPage").then(m => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import("../features/auth/pages/SignUpPage").then(m => ({ default: m.SignUpPage })));
const ForgotPasswordPage = lazy(() => import("../features/auth/pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const OAuth2RedirectHandler = lazy(() => import("../features/auth/pages/OAuth2RedirectHandler").then(m => ({ default: m.OAuth2RedirectHandler })));

// Admin Pages
const AdminDashboardPage = lazy(() => import("../features/admin/pages/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const AdminEventsPage = lazy(() => import("../features/admin/pages/AdminEventsPage").then(m => ({ default: m.AdminEventsPage })));
const AdminRegistrantsPage = lazy(() => import("../features/admin/pages/AdminRegistrantsPage").then(m => ({ default: m.AdminRegistrantsPage })));
const AdminOrganizersPage = lazy(() => import("../features/admin/pages/AdminOrganizersPage").then(m => ({ default: m.AdminOrganizersPage })));
const AdminTransactionsPage = lazy(() => import("../features/admin/pages/AdminTransactionsPage").then(m => ({ default: m.AdminTransactionsPage })));

// Organizer Pages
const OrganizerDashboardPage = lazy(() => import("../features/organizer/pages/OrganizerDashboardPage").then(m => ({ default: m.OrganizerDashboardPage })));
const OrganizerEventsPage = lazy(() => import("../features/organizer/pages/OrganizerEventsPage").then(m => ({ default: m.OrganizerEventsPage })));
const OrganizerRegistrantsPage = lazy(() => import("../features/organizer/pages/OrganizerRegistrantsPage").then(m => ({ default: m.OrganizerRegistrantsPage })));
const CheckInPage = lazy(() => import("../features/registrations/pages/CheckInPage").then(m => ({ default: m.CheckInPage })));

// Registrant Pages
const MyBookingsPage = lazy(() => import("../features/registrations/pages/MyBookingsPage").then(m => ({ default: m.MyBookingsPage })));
const MyUpcomingEventsPage = lazy(() => import("../features/registrations/pages/MyUpcomingEventsPage").then(m => ({ default: m.MyUpcomingEventsPage })));

// Fallback Loader
const FallbackLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-brand-400" />
      <p className="text-sm text-slate-400">Loading page...</p>
    </div>
  </div>
);

const AppLayout = () => {
  return (
    <>
      <AppNavbar />
      <Suspense fallback={<FallbackLoader />}>
        <Outlet />
      </Suspense>
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "events",
        element: <EventListPage />,
      },
      {
        path: "sign-in",
        element: <SignInPage />,
      },
      {
        path: "sign-up",
        element: <SignUpPage />,
      },
      {
        path: "auth/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "auth/oauth2/redirect",
        element: <OAuth2RedirectHandler />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      // ADMIN
      {
        path: "admin",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/events",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminEventsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/transactions",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminTransactionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/registrants",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminRegistrantsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/organizers",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminOrganizersPage />
          </ProtectedRoute>
        ),
      },
      // ORGANIZER
      {
        path: "organizer",
        element: (
          <ProtectedRoute allowedRoles={["ORGANIZER"]}>
            <OrganizerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "organizer/events",
        element: (
          <ProtectedRoute allowedRoles={["ORGANIZER"]}>
            <OrganizerEventsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "organizer/events/:eventId/registrants",
        element: (
          <ProtectedRoute allowedRoles={["ORGANIZER"]}>
            <OrganizerRegistrantsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "organizer/check-in",
        element: (
          <ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]}>
            <CheckInPage />
          </ProtectedRoute>
        ),
      },
      // REGISTRANT
      {
        path: "bookings",
        element: (
          <ProtectedRoute allowedRoles={["REGISTRANT"]}>
            <MyBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookings/upcoming",
        element: (
          <ProtectedRoute allowedRoles={["REGISTRANT"]}>
            <MyUpcomingEventsPage />
          </ProtectedRoute>
        ),
      },
      // Fallback
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
