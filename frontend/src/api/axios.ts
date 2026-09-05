import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { store } from "../store";
import { clearSession, setAccessToken, setSession } from "../store/slices/authSlice";
import { transformAxiosError } from "./errors";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];
let refreshPromise: Promise<string | null> | null = null;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function isNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response || error.response.status >= 500 || error.code === 'ECONNABORTED';
  }
  return false;
}

async function attemptRefreshRequest(refreshToken: string, isRetry: boolean = false): Promise<any> {
  try {
    return await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    }, { timeout: 10000 });
  } catch (error) {
    if (!isRetry && isNetworkError(error)) {
      // Retry once on network/server errors
      return await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      }, { timeout: 10000 });
    }
    throw error;
  }
}

export const performRefresh = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem("event-registration.refresh-token");
  
  if (!refreshToken) {
    store.dispatch(clearSession());
    return null;
  }

  refreshPromise = new Promise<string | null>(async (resolve, reject) => {
    try {
      const response = await attemptRefreshRequest(refreshToken);
      const { accessToken, refreshToken: newRefreshToken, role, email } = response.data;
      
      store.dispatch(setAccessToken(accessToken));
      if (role) {
        store.dispatch(setSession({ accessToken, role, email }));
      }
      
      localStorage.setItem("event-registration.refresh-token", newRefreshToken);
      
      processQueue(null, accessToken);
      resolve(accessToken);
    } catch (error) {
      processQueue(error, null);
      
      // Only clear session and redirect if it's NOT a network error
      // meaning backend actively rejected the refresh token (e.g. 401/403)
      if (!isNetworkError(error)) {
        store.dispatch(clearSession());
        if (window.location.pathname !== "/login" && window.location.pathname !== "/sign-in") {
          window.location.href = "/sign-in";
        }
      }
      reject(error);
    } finally {
      refreshPromise = null;
    }
  });

  return refreshPromise;
};

// Request Interceptor: Attach access token from Redux store
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized errors and refresh tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    // Prevent infinite loops if calling refresh or login
    if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login")) {
      return transformAxiosError(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Queue the original request
      const retryOriginalRequest = new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      }).catch((err) => {
        return Promise.reject(err);
      });

      // Start refresh if not already doing so
      if (!refreshPromise) {
        performRefresh().catch(() => {
           // Queue rejects automatically on failure, nothing to do here
        });
      }

      return retryOriginalRequest;
    }

    return transformAxiosError(error);
  }
);

export default apiClient;
