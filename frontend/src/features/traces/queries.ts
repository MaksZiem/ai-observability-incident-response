import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { Span, SpanStatus, TraceDetail } from "@/features/traces/types";

type TracesFilter = {
  from?: string;
  to?: string;
  service?: string;
  status?: SpanStatus;
};

export function listTraces(projectId: string, filter: TracesFilter) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined) query.set(key, value);
  }
  return apiFetch<Span[]>(`/projects/${projectId}/traces?${query}`);
}

export async function getTrace(projectId: string, traceId: string) {
  try {
    return await apiFetch<TraceDetail>(
      `/projects/${projectId}/traces/${encodeURIComponent(traceId)}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
