const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export enum TimeRange {
  FIFTEEN_MINUTES = '15m',
  ONE_HOUR = '1h',
  ONE_DAY = '24h',
  SEVEN_DAYS = '7d',
}

const RANGE_CONFIG: Record<TimeRange, { durationMs: number; stepMs: number }> =
  {
    [TimeRange.FIFTEEN_MINUTES]: {
      durationMs: 15 * MINUTE_MS,
      stepMs: MINUTE_MS,
    },
    [TimeRange.ONE_HOUR]: { durationMs: HOUR_MS, stepMs: MINUTE_MS },
    [TimeRange.ONE_DAY]: { durationMs: DAY_MS, stepMs: 15 * MINUTE_MS },
    [TimeRange.SEVEN_DAYS]: { durationMs: 7 * DAY_MS, stepMs: 2 * HOUR_MS },
  };

export interface ResolvedTimeRange {
  from: Date;
  to: Date;
  stepMs: number;
}

export function resolveTimeRange(
  range: TimeRange,
  now: Date = new Date(),
): ResolvedTimeRange {
  const { durationMs, stepMs } = RANGE_CONFIG[range];
  const to = new Date(Math.ceil(now.getTime() / stepMs) * stepMs);

  return { from: new Date(to.getTime() - durationMs), to, stepMs };
}

export function bucketStarts({ from, to, stepMs }: ResolvedTimeRange): Date[] {
  const starts: Date[] = [];

  for (let time = from.getTime(); time < to.getTime(); time += stepMs) {
    starts.push(new Date(time));
  }

  return starts;
}
