import axios from "axios";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function parseErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;

  const data = payload as Record<string, unknown>;
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.error === "string" && data.error.trim()) return data.error;

  // Some endpoints return field->message maps for validation.
  const fieldMessages = Object.values(data).filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0
  );
  if (fieldMessages.length > 0) return fieldMessages.join(", ");

  return fallback;
}

export function transformAxiosError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      throw new ApiError(`Request timed out.`, 0);
    }

    if (error.response) {
      const payload = error.response.data;
      const statusText = error.response.statusText ? ` ${error.response.statusText}` : "";
      const fallback = `Request failed with status ${error.response.status}${statusText}`;
      throw new ApiError(parseErrorMessage(payload, fallback), error.response.status);
    }
    
    // Network errors or no response
    throw new ApiError("Unable to connect to the server. Please check your connection.", 0);
  }
  
  throw error;
}
