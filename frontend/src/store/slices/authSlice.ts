import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type UserRole = "ADMIN" | "ORGANIZER" | "REGISTRANT" | null;

export type AuthState = {
  accessToken: string | null;
  role: UserRole;
  email: string | null;
};

const STORAGE_KEY = "event-registration.auth";

function loadInitialState(): AuthState {
  if (typeof window === "undefined") {
    return { accessToken: null, role: null, email: null };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { accessToken: null, role: null, email: null };

  try {
    const parsed = JSON.parse(raw);
    return {
      accessToken: null, // In-memory only
      role: parsed.role ?? null,
      email: parsed.email ?? null,
    };
  } catch {
    return { accessToken: null, role: null, email: null };
  }
}

function persistState(state: AuthState) {
  if (typeof window === "undefined") return;
  const toPersist = {
    role: state.role,
    email: state.email,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
}

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{ accessToken: string; role: UserRole; email: string | null }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.role;
      state.email = action.payload.email;
      persistState(state);
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      // No persistState needed for accessToken
    },
    clearSession(state) {
      state.accessToken = null;
      state.role = null;
      state.email = null;
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem("event-registration.refresh-token");
    },
  },
});

export const { setSession, setAccessToken, clearSession } = authSlice.actions;
export default authSlice.reducer;
