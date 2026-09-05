import axios from "axios";
import { ApiError } from "../../api/errors";

axios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem("event-registration.auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        // ignore
      }
    }
  }
  return config;
});

export function setAuthToken(token: string | null) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  timeoutMs?: number;
};

function resolveApiBaseUrls(): string[] {
  const configured = import.meta.env.VITE_API_BASE_URLS;
  if (configured) {
    const values = configured
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);
    if (values.length > 0) return values;
  }

  const base = import.meta.env.VITE_API_BASE_URL;
  if (base && base.trim()) {
    return [base.trim(), "/event-api"];
  }

  return ["/api", "/event-api"];
}

export const API_BASE_URLS = resolveApiBaseUrls();


export { ApiError } from "../../api/errors";

function parseErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;

  const data = payload as Record<string, unknown>;
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.error === "string" && data.error.trim()) return data.error;

  // Some endpoints return field->message maps for validation.
  const fieldMessages = Object.values(data)
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  if (fieldMessages.length > 0) return fieldMessages.join(", ");

  return fallback;
}

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? 15000;

  for (const baseUrl of API_BASE_URLS) {
    try {
      const headers: Record<string, string> = {};
      if (options.body) headers["Content-Type"] = "application/json";

      const response = await axios({
        url: `${baseUrl}${path}`,
        method,
        headers,
        params: options.query,
        data: options.body,
        timeout: timeoutMs,
      });

      if (response.status === 204) {
        return undefined as T;
      }

      return response.data as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          throw new ApiError(`Request timed out after ${timeoutMs}ms.`, 0);
        }

        if (error.response) {
          const payload = error.response.data;
          const statusText = error.response.statusText ? ` ${error.response.statusText}` : "";
          const fallback = `Request failed with status ${error.response.status}${statusText}`;
          throw new ApiError(parseErrorMessage(payload, fallback), error.response.status);
        }
      }
      // Continue to the next baseUrl for network errors
    }
  }

  throw new ApiError(
    "Could not connect to backend API. Start API gateway (8080) or event service (8082).",
    0
  );
}
