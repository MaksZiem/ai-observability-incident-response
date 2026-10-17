import type { RequestStats } from '../metrics/request-stats.js';
import {
  AlertComparator,
  AlertMetric,
  AlertRule,
  AlertStatus,
} from './entities/alert-rule.entity.js';

export enum AlertTransition {
  FIRE = 'fire',
  RECOVER = 'recover',
}

export function metricValue(
  metric: AlertMetric,
  stats: RequestStats,
): number | null {
  switch (metric) {
    case AlertMetric.ERROR_RATE:
      return stats.requests > 0 ? stats.errorRate : null;
    case AlertMetric.P95_LATENCY:
      return stats.p95LatencyMs;
    case AlertMetric.REQUEST_COUNT:
      return stats.requests;
  }
}

export function isBreached(
  comparator: AlertComparator,
  value: number | null,
  threshold: number,
): boolean {
  if (value === null) {
    return false;
  }

  return comparator === AlertComparator.GREATER_THAN
    ? value > threshold
    : value < threshold;
}

export function nextTransition(
  status: AlertStatus,
  breached: boolean,
): AlertTransition | null {
  if (breached && status === AlertStatus.OK) {
    return AlertTransition.FIRE;
  }

  if (!breached && status === AlertStatus.FIRING) {
    return AlertTransition.RECOVER;
  }

  return null;
}

function formatValue(metric: AlertMetric, value: number): string {
  switch (metric) {
    case AlertMetric.ERROR_RATE:
      return `${(value * 100).toFixed(2)}%`;
    case AlertMetric.P95_LATENCY:
      return `${Math.round(value)}ms`;
    case AlertMetric.REQUEST_COUNT:
      return String(Math.round(value));
  }
}

export function describeCondition(
  rule: Pick<
    AlertRule,
    'metric' | 'comparator' | 'threshold' | 'windowMinutes' | 'service'
  >,
  value: number | null,
): string {
  const operator = rule.comparator === AlertComparator.GREATER_THAN ? '>' : '<';
  const current = value === null ? 'no data' : formatValue(rule.metric, value);

  return (
    `${rule.metric} ${current} ${operator} ${formatValue(rule.metric, rule.threshold)} ` +
    `over ${rule.windowMinutes} min${rule.service ? ` (${rule.service})` : ''}`
  );
}
