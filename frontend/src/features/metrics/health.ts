import type { RequestStats } from "@/features/metrics/types";

const DEGRADED_ERROR_RATE = 0.02;
const CRITICAL_ERROR_RATE = 0.25;
const DEGRADED_P95_MS = 1000;

export function errorRateTone({ errorRate }: RequestStats) {
  if (errorRate >= CRITICAL_ERROR_RATE) return "critical";
  if (errorRate >= DEGRADED_ERROR_RATE) return "warning";
  return "default";
}

export function latencyTone({ p95LatencyMs }: RequestStats) {
  return (p95LatencyMs ?? 0) >= DEGRADED_P95_MS ? "warning" : "default";
}
