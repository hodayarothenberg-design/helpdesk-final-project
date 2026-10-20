import { ApiRequestError, type ApiResponse } from "../types/api";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is not defined");
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  expectJson?: boolean;
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("success" in value)) {
    return false;
  }
  return typeof (value as { success: unknown }).success === "boolean";
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiRequestError("Unable to reach the server", 0);
  }

  if (options.expectJson === false) {
    if (!response.ok) {
      throw new ApiRequestError("The request failed", response.status);
    }
    return (await response.text()) as T;
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiRequestError("The server returned an unexpected response", response.status);
  }

  if (!isApiResponse<T>(payload)) {
    throw new ApiRequestError("The server returned an unexpected response", response.status);
  }

  if (!payload.success) {
    throw new ApiRequestError(payload.error, response.status);
  }

  return payload.data;
}

export function getApiBaseUrl(): string {
  return API_URL;
}
