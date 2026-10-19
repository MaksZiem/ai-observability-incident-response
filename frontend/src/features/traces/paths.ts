export function tracePath(projectId: string, traceId: string) {
  return `/projects/${projectId}/traces/${encodeURIComponent(traceId)}`;
}
