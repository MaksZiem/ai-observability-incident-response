export interface RawRequestStats {
  requests: string;
  errors: string;
  p95: number | null;
}

export interface RequestStats {
  requests: number;
  errors: number;
  errorRate: number;
  p95LatencyMs: number | null;
}

export enum ServiceStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  CRITICAL = 'critical',
}

const DEGRADED_ERROR_RATE = 0.02;
const CRITICAL_ERROR_RATE = 0.25;
const DEGRADED_P95_MS = 1000;

export function toRequestStats(raw: RawRequestStats | undefined): RequestStats {
  const requests = Number(raw?.requests ?? 0);
  const errors = Number(raw?.errors ?? 0);

  return {
    requests,
    errors,
    errorRate: requests > 0 ? errors / requests : 0,
    p95LatencyMs: raw?.p95 ?? null,
  };
}

export function getServiceStatus(stats: RequestStats): ServiceStatus {
  if (stats.errorRate >= CRITICAL_ERROR_RATE) {
    return ServiceStatus.CRITICAL;
  }

  if (
    stats.errorRate >= DEGRADED_ERROR_RATE ||
    (stats.p95LatencyMs ?? 0) >= DEGRADED_P95_MS
  ) {
    return ServiceStatus.DEGRADED;
  }

  return ServiceStatus.HEALTHY;
}
