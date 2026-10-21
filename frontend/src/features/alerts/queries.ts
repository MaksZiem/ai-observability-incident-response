import { apiFetch } from "@/lib/api";
import type { AlertRule } from "@/features/alerts/types";

export function listAlertRules(projectId: string) {
  return apiFetch<AlertRule[]>(`/projects/${projectId}/alerts`);
}
