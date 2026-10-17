export const TELEMETRY_TYPES = [
  'logs',
  'spans',
  'errors',
  'deployments',
] as const;

export type TelemetryType = (typeof TELEMETRY_TYPES)[number];

const BATCH_KEYS = ['logs', 'spans', 'errors'] as const;

export function telemetryTypeOf(path: string): TelemetryType | null {
  const segment = path.split('/').filter(Boolean).pop() ?? '';
  return (TELEMETRY_TYPES as readonly string[]).includes(segment)
    ? (segment as TelemetryType)
    : null;
}

export function ingestedItems(body: unknown): unknown[] {
  if (!body || typeof body !== 'object') {
    return [];
  }

  const record = body as Record<string, unknown>;

  for (const key of BATCH_KEYS) {
    const items = record[key];

    if (Array.isArray(items)) {
      return items;
    }
  }

  return [body];
}

export function telemetryLagsMs(
  items: unknown[],
  receivedAt: number,
): number[] {
  return items.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const { timestamp, startTime } = item as Record<string, unknown>;
    const sentAt = Date.parse(String(timestamp ?? startTime ?? ''));

    return Number.isFinite(sentAt) ? [receivedAt - sentAt] : [];
  });
}
