import type { SeriesPoint } from './metrics.service.js';

export enum AnomalyType {
  LATENCY = 'latency',
  ERROR_RATE = 'error_rate',
}

export interface Anomaly {
  type: AnomalyType;
  at: Date;
  value: number;
  baseline: number;
}

const LATENCY_FACTOR = 2;
const LATENCY_MIN_INCREASE_MS = 200;
const ERROR_RATE_FACTOR = 2;
const ERROR_RATE_MIN_INCREASE = 0.05;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function detectAnomalies(
  series: SeriesPoint[],
  baselineEnd: Date,
): Anomaly[] {
  const active = series.filter((point) => point.requests > 0);
  const baseline = active.filter((point) => point.bucket < baselineEnd);
  const candidates = active.filter((point) => point.bucket >= baselineEnd);

  if (baseline.length === 0) {
    return [];
  }

  const baselineP95 = median(baseline.map((point) => point.p95LatencyMs ?? 0));
  const baselineErrorRate = median(baseline.map((point) => point.errorRate));
  const anomalies: Anomaly[] = [];

  const latencySpike = candidates.find(
    (point) =>
      (point.p95LatencyMs ?? 0) >=
      Math.max(
        baselineP95 * LATENCY_FACTOR,
        baselineP95 + LATENCY_MIN_INCREASE_MS,
      ),
  );

  if (latencySpike) {
    anomalies.push({
      type: AnomalyType.LATENCY,
      at: latencySpike.bucket,
      value: latencySpike.p95LatencyMs ?? 0,
      baseline: baselineP95,
    });
  }

  const errorSpike = candidates.find(
    (point) =>
      point.errorRate >=
      Math.max(
        baselineErrorRate * ERROR_RATE_FACTOR,
        baselineErrorRate + ERROR_RATE_MIN_INCREASE,
      ),
  );

  if (errorSpike) {
    anomalies.push({
      type: AnomalyType.ERROR_RATE,
      at: errorSpike.bucket,
      value: errorSpike.errorRate,
      baseline: baselineErrorRate,
    });
  }

  return anomalies;
}
