import { describe, expect, it } from 'vitest';
import {
  ingestedItems,
  telemetryLagsMs,
  telemetryTypeOf,
} from './ingest-items.js';

describe('telemetryTypeOf', () => {
  it('reads the telemetry type from the ingest path', () => {
    expect(telemetryTypeOf('/api/ingest/logs')).toBe('logs');
    expect(telemetryTypeOf('/api/ingest/deployments/')).toBe('deployments');
    expect(telemetryTypeOf('/api/projects')).toBeNull();
  });
});

describe('ingestedItems', () => {
  it('unwraps batches and treats single objects as one item', () => {
    expect(ingestedItems({ spans: [1, 2] })).toEqual([1, 2]);
    expect(ingestedItems({ version: 'v1' })).toEqual([{ version: 'v1' }]);
    expect(ingestedItems(undefined)).toEqual([]);
  });
});

describe('telemetryLagsMs', () => {
  it('measures how late each item arrived', () => {
    const receivedAt = Date.parse('2026-10-14T14:00:10.000Z');

    expect(
      telemetryLagsMs(
        [
          { timestamp: '2026-10-14T14:00:00.000Z' },
          { startTime: '2026-10-14T14:00:09.500Z' },
          { message: 'no timestamp' },
        ],
        receivedAt,
      ),
    ).toEqual([10_000, 500]);
  });
});
