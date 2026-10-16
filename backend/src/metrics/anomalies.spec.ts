import { describe, expect, it } from 'vitest';
import { AnomalyType, detectAnomalies } from './anomalies.js';
import type { SeriesPoint } from './metrics.service.js';

function point(minute: number, data: Partial<SeriesPoint>): SeriesPoint {
  return {
    bucket: new Date(Date.UTC(2026, 9, 14, 14, minute)),
    requests: 10,
    errors: 0,
    errorRate: 0,
    p95LatencyMs: 100,
    ...data,
  };
}

const baselineEnd = new Date(Date.UTC(2026, 9, 14, 14, 3));

describe('detectAnomalies', () => {
  it('finds the first latency and error rate spikes after the baseline', () => {
    const series = [
      point(0, {}),
      point(1, { p95LatencyMs: 120 }),
      point(2, {}),
      point(3, {}),
      point(4, { p95LatencyMs: 1250 }),
      point(5, { p95LatencyMs: 1300, errorRate: 0.3 }),
    ];

    expect(detectAnomalies(series, baselineEnd)).toEqual([
      {
        type: AnomalyType.LATENCY,
        at: series[4].bucket,
        value: 1250,
        baseline: 100,
      },
      {
        type: AnomalyType.ERROR_RATE,
        at: series[5].bucket,
        value: 0.3,
        baseline: 0,
      },
    ]);
  });

  it('ignores small fluctuations', () => {
    const series = [
      point(0, {}),
      point(4, { p95LatencyMs: 250, errorRate: 0.02 }),
    ];

    expect(detectAnomalies(series, baselineEnd)).toEqual([]);
  });

  it('returns nothing without baseline traffic', () => {
    const series = [
      point(0, { requests: 0 }),
      point(4, { p95LatencyMs: 5000 }),
    ];

    expect(detectAnomalies(series, baselineEnd)).toEqual([]);
  });
});
