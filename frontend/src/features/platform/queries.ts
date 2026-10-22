import { ApiError, apiFetch } from "@/lib/api";
import type { HealthReport, PlatformStats } from "@/features/platform/types";

function isHealthReport(body: unknown): body is HealthReport {
  return typeof body === "object" && body !== null && "details" in body;
}

export function getPlatformStats() {
  return apiFetch<PlatformStats>("/platform/stats");
}

export async function getHealth(): Promise<HealthReport | null> {
  try {
    return await apiFetch<HealthReport>("/health", { auth: false });
  } catch (error) {
    if (error instanceof ApiError && isHealthReport(error.body)) {
      return error.body;
    }
    return null;
  }
}
