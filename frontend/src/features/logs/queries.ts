import { apiFetch } from "@/lib/api";
import type { LogLevel, LogPage } from "@/features/logs/types";

export type LogsFilter = {
  from?: string;
  to?: string;
  service?: string;
  level?: LogLevel[];
  endpoint?: string;
  traceId?: string;
  requestId?: string;
  cursor?: string;
  limit?: number;
};

export function listLogs(projectId: string, filter: LogsFilter) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined) continue;
    query.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  return apiFetch<LogPage>(`/projects/${projectId}/logs?${query}`);
}
