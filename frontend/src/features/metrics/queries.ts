import { apiFetch } from "@/lib/api";
import type {
  Overview,
  ServiceHealth,
  TimeRange,
} from "@/features/metrics/types";

export function getOverview(
  projectId: string,
  range: TimeRange,
  service?: string,
) {
  const query = new URLSearchParams({ range });
  if (service) query.set("service", service);
  return apiFetch<Overview>(`/projects/${projectId}/metrics/overview?${query}`);
}

export function listServiceHealth(projectId: string, range: TimeRange) {
  const query = new URLSearchParams({ range });
  return apiFetch<ServiceHealth[]>(
    `/projects/${projectId}/metrics/services?${query}`,
  );
}
