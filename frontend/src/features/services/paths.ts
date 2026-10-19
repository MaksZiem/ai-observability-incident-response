export function servicePath(projectId: string, service: string) {
  return `/projects/${projectId}/services/${encodeURIComponent(service)}`;
}

export function decodeServiceParam(param: string) {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}
