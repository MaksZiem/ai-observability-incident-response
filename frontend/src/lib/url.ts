export function decodeParam(param: string) {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}
