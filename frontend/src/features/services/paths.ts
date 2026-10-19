export function servicePath(projectId: string, service: string) {
  return `/projects/${projectId}/services/${encodeURIComponent(service)}`;
}
