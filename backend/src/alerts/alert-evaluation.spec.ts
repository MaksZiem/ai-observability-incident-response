import { describe, expect, it } from 'vitest';
import {
  AlertTransition,
  describeCondition,
  isBreached,
  metricValue,
  nextTransition,
} from './alert-evaluation.js';
import {
  AlertComparator,
  AlertMetric,
  AlertStatus,
} from './entities/alert-rule.entity.js';

const stats = { requests: 200, errors: 8, errorRate: 0.04, p95LatencyMs: 921 };
const noTraffic = { requests: 0, errors: 0, errorRate: 0, p95LatencyMs: null };

describe('metricValue', () => {
  it('reads the requested metric', () => {
    expect(metricValue(AlertMetric.ERROR_RATE, stats)).toBe(0.04);
    expect(metricValue(AlertMetric.P95_LATENCY, stats)).toBe(921);
    expect(metricValue(AlertMetric.REQUEST_COUNT, stats)).toBe(200);
  });

  it('has no error rate or latency without traffic, but counts zero requests', () => {
    expect(metricValue(AlertMetric.ERROR_RATE, noTraffic)).toBeNull();
    expect(metricValue(AlertMetric.P95_LATENCY, noTraffic)).toBeNull();
    expect(metricValue(AlertMetric.REQUEST_COUNT, noTraffic)).toBe(0);
  });
});

describe('isBreached', () => {
  it('compares against the threshold', () => {
    expect(isBreached(AlertComparator.GREATER_THAN, 0.07, 0.05)).toBe(true);
    expect(isBreached(AlertComparator.GREATER_THAN, 0.05, 0.05)).toBe(false);
    expect(isBreached(AlertComparator.LESS_THAN, 3, 10)).toBe(true);
  });

  it('never fires without data', () => {
    expect(isBreached(AlertComparator.LESS_THAN, null, 10)).toBe(false);
  });
});

describe('nextTransition', () => {
  it('fires once and recovers once', () => {
    expect(nextTransition(AlertStatus.OK, true)).toBe(AlertTransition.FIRE);
    expect(nextTransition(AlertStatus.FIRING, true)).toBeNull();
    expect(nextTransition(AlertStatus.FIRING, false)).toBe(
      AlertTransition.RECOVER,
    );
    expect(nextTransition(AlertStatus.OK, false)).toBeNull();
  });
});

describe('describeCondition', () => {
  it('formats the value for the metric', () => {
    expect(
      describeCondition(
        {
          metric: AlertMetric.ERROR_RATE,
          comparator: AlertComparator.GREATER_THAN,
          threshold: 0.05,
          windowMinutes: 5,
          service: 'payment-service',
        },
        0.072,
      ),
    ).toBe('error_rate 7.20% > 5.00% over 5 min (payment-service)');
  });
});
