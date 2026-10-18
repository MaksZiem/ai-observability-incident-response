import { apiFetch } from "@/lib/api";
import type { Overview, TimeRange } from "@/features/metrics/types";

export function getOverview(projectId: string, range: TimeRange) {
  const query = new URLSearchParams({ range });
  return apiFetch<Overview>(`/projects/${projectId}/metrics/overview?${query}`);
}
