import { LOG_LEVELS } from "@/features/logs/labels";
import type { LogLevel } from "@/features/logs/types";

export type LogFilters = {
  service?: string;
  level?: LogLevel[];
  endpoint?: string;
  traceId?: string;
  requestId?: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

const TEXT_FILTERS = ["service", "endpoint", "traceId", "requestId"] as const;

function readText(value: string | string[] | undefined) {
  const text = (Array.isArray(value) ? value[0] : value)?.trim();
  return text ? text : undefined;
}

function readLevels(value: string | string[] | undefined) {
  const raw = (Array.isArray(value) ? value : [value ?? ""]).flatMap((item) =>
    item.split(","),
  );
  const levels = LOG_LEVELS.filter((level) => raw.includes(level));
  return levels.length > 0 ? levels : undefined;
}

export function readLogFilters(params: SearchParams): LogFilters {
  const filters: LogFilters = { level: readLevels(params.level) };
  for (const key of TEXT_FILTERS) {
    filters[key] = readText(params[key]);
  }
  return filters;
}

export function logsHref(projectId: string, filters: LogFilters) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined) continue;
    query.set(key, Array.isArray(value) ? value.join(",") : value);
  }
  const search = query.toString();
  return `/projects/${projectId}/logs${search ? `?${search}` : ""}`;
}
