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
