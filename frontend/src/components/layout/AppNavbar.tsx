import { CircleUserRound, Home, LogOut, LogIn, UserPlus, Sparkles } from "lucide-react";
import { Link, NavLink } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearSession } from "../../store/slices/authSlice";

export function AppNavbar() {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const isAdmin = auth.accessToken && auth.role === "ADMIN";
  const isOrganizer = auth.accessToken && auth.role === "ORGANIZER";
  const hidePublicNav = auth.accessToken && (isAdmin || isOrganizer);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2 text-xl font-bold text-white transition hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-pink shadow-lg shadow-brand-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Josh</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {!hidePublicNav ? (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                  }`
                }
              >
                <Home className="h-4 w-4" />
                Home
              </NavLink>
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm transition ${
                    isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                  }`
                }
              >
                Events
              </NavLink>
            </>
          ) : null}
          {auth.accessToken ? (
            <>
              {isAdmin ? (
                <>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                      }`
                    }
                  >
                    Admin Dashboard
                  </NavLink>
                <NavLink
                    to="/admin/registrants"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                      isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                    }`
                  }
                >
                    Registrants
                </NavLink>
                  <NavLink
                    to="/admin/organizers"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                      }`
                    }
                  >
                    Organizers
                  </NavLink>
                  <NavLink
                    to="/admin/events"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                      }`
                    }
                  >
                    Events
                  </NavLink>
                  <NavLink
                    to="/admin/transactions"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                      }`
                    }
                  >
                    Transactions
                  </NavLink>
                  <NavLink
                    to="/organizer/check-in"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                      }`
                    }
                  >
                    Check-in
                  </NavLink>
                </>
              ) : null}

              {isOrganizer ? (
                <>
                  <NavLink
                    to="/organizer"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                      }`
                    }
                  >
                    Organizer
                  </NavLink>
                  <NavLink
                    to="/organizer/events"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                      }`
                    }
                  >
                    My Events
                  </NavLink>
                  <NavLink
                    to="/organizer/check-in"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                      }`
                    }
                  >
                    Check-in
                  </NavLink>
                </>
              ) : null}

              {auth.role === "REGISTRANT" ? (
                <NavLink
                  to="/bookings"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                      isActive ? "bg-brand-600/30 text-white" : "text-slate-200 hover:bg-white/10"
                    }`
                  }
                >
                  My Bookings
                </NavLink>
              ) : null}

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-brand-600/30 text-white"
                      : "text-slate-200 hover:bg-white/10"
                  }`
                }
              >
                <CircleUserRound className="h-4 w-4" />
                Profile
              </NavLink>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10"
                onClick={() => dispatch(clearSession())}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/sign-in"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    isActive ? "bg-white/15 text-white" : "text-slate-200 hover:bg-white/10"
                  }`
                }
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </NavLink>
              <NavLink
                to="/sign-up"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg bg-gradient-to-r px-3 py-2 text-sm font-semibold text-white transition ${
                    isActive
                      ? "from-brand-500 to-accent-pink"
                      : "from-amber-400 to-brand-500 hover:from-amber-300 hover:to-brand-400"
                  }`
                }
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
