import { apiFetch } from "@/lib/api";
import type { Deployment } from "@/features/deployments/types";

type DeploymentsFilter = {
  from?: string;
  to?: string;
  service?: string;
};

export function listDeployments(projectId: string, filter: DeploymentsFilter) {
  const query = new URLSearchParams(
    Object.entries(filter).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
  return apiFetch<Deployment[]>(`/projects/${projectId}/deployments?${query}`);
}
