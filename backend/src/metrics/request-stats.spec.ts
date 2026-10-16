import { describe, expect, it } from 'vitest';
import {
  getServiceStatus,
  ServiceStatus,
  toRequestStats,
} from './request-stats.js';

describe('toRequestStats', () => {
  it('parses raw counts and computes the error rate', () => {
    expect(toRequestStats({ requests: '200', errors: '8', p95: 921 })).toEqual({
      requests: 200,
      errors: 8,
      errorRate: 0.04,
      p95LatencyMs: 921,
    });
  });

  it('returns zeros when there were no requests', () => {
    expect(toRequestStats(undefined)).toEqual({
      requests: 0,
      errors: 0,
      errorRate: 0,
      p95LatencyMs: null,
    });
  });
});

describe('getServiceStatus', () => {
  const healthy = {
    requests: 100,
    errors: 0,
    errorRate: 0,
    p95LatencyMs: 120,
  };

  it('is healthy below every threshold', () => {
    expect(getServiceStatus(healthy)).toBe(ServiceStatus.HEALTHY);
  });

  it('is degraded on an elevated error rate or slow p95', () => {
    expect(getServiceStatus({ ...healthy, errorRate: 0.038 })).toBe(
      ServiceStatus.DEGRADED,
    );
    expect(getServiceStatus({ ...healthy, p95LatencyMs: 1200 })).toBe(
      ServiceStatus.DEGRADED,
    );
  });

  it('is critical when a quarter of requests fail', () => {
    expect(getServiceStatus({ ...healthy, errorRate: 0.3 })).toBe(
      ServiceStatus.CRITICAL,
    );
  });
});
