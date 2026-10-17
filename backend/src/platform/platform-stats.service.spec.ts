import { describe, expect, it } from 'vitest';
import { PlatformStatsService } from './platform-stats.service.js';

describe('PlatformStatsService', () => {
  it('separates accepted, rejected and failed ingest requests', () => {
    const stats = new PlatformStatsService();

    stats.recordIngestAccepted('logs', 100, 12, [500, 1500]);
    stats.recordIngestRejected('logs', 400);
    stats.recordIngestRejected('logs', 429);
    stats.recordIngestRejected('logs', 500);

    const snapshot = stats.snapshot();

    expect(snapshot.ingest.logs).toEqual({
      requests: 4,
      items: 100,
      rejected: 2,
      failed: 1,
    });
    expect(snapshot.telemetryLagMs).toEqual({
      count: 2,
      p50: 500,
      p95: 1500,
    });
  });

  it('counts outcomes and alert runs', () => {
    const stats = new PlatformStatsService();
    const runAt = new Date('2026-10-14T14:00:00.000Z');

    stats.recordOutcome('analyses', true);
    stats.recordOutcome('analyses', false);
    stats.recordAlertRun(1, runAt);

    const snapshot = stats.snapshot();

    expect(snapshot.outcomes.analyses).toEqual({ succeeded: 1, failed: 1 });
    expect(snapshot.alerts).toEqual({
      runs: 1,
      failedEvaluations: 1,
      lastRunAt: runAt,
    });
  });
});
