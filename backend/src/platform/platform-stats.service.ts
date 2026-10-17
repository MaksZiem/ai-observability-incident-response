import { Injectable } from '@nestjs/common';
import { TELEMETRY_TYPES, TelemetryType } from './ingest-items.js';
import { Percentiles, SampleWindow } from './sample-window.js';

const SAMPLE_CAPACITY = 1000;

export type OutcomeKind = 'analyses' | 'chat' | 'webhooks';

interface IngestCounters {
  requests: number;
  items: number;
  rejected: number;
  failed: number;
}

interface OutcomeCounters {
  succeeded: number;
  failed: number;
}

export interface PlatformStats {
  startedAt: Date;
  uptimeSeconds: number;
  ingest: Record<TelemetryType, IngestCounters>;
  ingestDurationMs: Percentiles;
  telemetryLagMs: Percentiles;
  outcomes: Record<OutcomeKind, OutcomeCounters>;
  alerts: { runs: number; failedEvaluations: number; lastRunAt: Date | null };
}

@Injectable()
export class PlatformStatsService {
  readonly startedAt = new Date();

  private readonly ingest = Object.fromEntries(
    TELEMETRY_TYPES.map((type) => [
      type,
      { requests: 0, items: 0, rejected: 0, failed: 0 },
    ]),
  ) as Record<TelemetryType, IngestCounters>;

  private readonly outcomes: Record<OutcomeKind, OutcomeCounters> = {
    analyses: { succeeded: 0, failed: 0 },
    chat: { succeeded: 0, failed: 0 },
    webhooks: { succeeded: 0, failed: 0 },
  };

  private readonly ingestDuration = new SampleWindow(SAMPLE_CAPACITY);
  private readonly telemetryLag = new SampleWindow(SAMPLE_CAPACITY);
  private alertRuns = 0;
  private failedEvaluations = 0;
  private lastAlertRun: Date | null = null;

  recordIngestAccepted(
    type: TelemetryType,
    items: number,
    durationMs: number,
    lagsMs: number[],
  ): void {
    this.ingest[type].requests += 1;
    this.ingest[type].items += items;
    this.ingestDuration.add(durationMs);
    lagsMs.forEach((lag) => this.telemetryLag.add(lag));
  }

  recordIngestRejected(type: TelemetryType, status: number): void {
    this.ingest[type].requests += 1;

    if (status >= 500) {
      this.ingest[type].failed += 1;
    } else {
      this.ingest[type].rejected += 1;
    }
  }

  recordOutcome(kind: OutcomeKind, succeeded: boolean): void {
    this.outcomes[kind][succeeded ? 'succeeded' : 'failed'] += 1;
  }

  recordAlertRun(failedEvaluations: number, at: Date = new Date()): void {
    this.alertRuns += 1;
    this.failedEvaluations += failedEvaluations;
    this.lastAlertRun = at;
  }

  lastAlertRunAt(): Date | null {
    return this.lastAlertRun;
  }

  snapshot(now: Date = new Date()): PlatformStats {
    return {
      startedAt: this.startedAt,
      uptimeSeconds: Math.round(
        (now.getTime() - this.startedAt.getTime()) / 1000,
      ),
      ingest: this.ingest,
      ingestDurationMs: this.ingestDuration.percentiles(),
      telemetryLagMs: this.telemetryLag.percentiles(),
      outcomes: this.outcomes,
      alerts: {
        runs: this.alertRuns,
        failedEvaluations: this.failedEvaluations,
        lastRunAt: this.lastAlertRun,
      },
    };
  }
}
