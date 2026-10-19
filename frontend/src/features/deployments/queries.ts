import { apiFetch } from "@/lib/api";
import type { Deployment } from "@/features/deployments/types";

type DeploymentsFilter = {
  from?: string;
  to?: string;
  service?: string;
  limit?: number;
};

export function listDeployments(projectId: string, filter: DeploymentsFilter) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined) query.set(key, String(value));
  }
  return apiFetch<Deployment[]>(`/projects/${projectId}/deployments?${query}`);
}
