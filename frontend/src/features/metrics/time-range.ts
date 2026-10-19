import type { TimeRange } from "@/features/metrics/types";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "15m": "Last 15 minutes",
  "1h": "Last hour",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
};

export const TIME_RANGES = Object.keys(TIME_RANGE_LABELS) as TimeRange[];

export const DEFAULT_TIME_RANGE: TimeRange = "1h";

export function parseTimeRange(value: string | string[] | undefined) {
  return TIME_RANGES.find((range) => range === value) ?? DEFAULT_TIME_RANGE;
}

const MINUTE_MS = 60_000;

const TIME_RANGE_MS: Record<TimeRange, number> = {
  "15m": 15 * MINUTE_MS,
  "1h": 60 * MINUTE_MS,
  "24h": 24 * 60 * MINUTE_MS,
  "7d": 7 * 24 * 60 * MINUTE_MS,
};

export function rangeStart(range: TimeRange, now = new Date()) {
  return new Date(now.getTime() - TIME_RANGE_MS[range]).toISOString();
}
