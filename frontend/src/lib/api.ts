import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function messageOf(body: unknown, fallback: string) {
  if (typeof body !== "object" || body === null || !("message" in body)) {
    return fallback;
  }
  const { message } = body;
  if (Array.isArray(message)) return message.join(", ");
  return typeof message === "string" ? message : fallback;
}

async function toApiError(response: Response) {
  const fallback = response.statusText || "Request failed";

  try {
    const body: unknown = await response.json();
    return new ApiError(response.status, messageOf(body, fallback), body);
  } catch {
    return new ApiError(response.status, fallback);
  }
}

type ApiFetchOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, headers, auth = true, ...init } = options;
  const token = auth ? await getAccessToken() : null;

  if (auth && !token) redirect("/login");

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (auth && response.status === 401) redirect("/login");

  if (!response.ok) throw await toApiError(response);

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
