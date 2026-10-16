import type { Deployment } from '../deployments/entities/deployment.entity.js';
import type { ErrorGroup } from '../errors/entities/error-group.entity.js';
import { Anomaly, AnomalyType } from '../metrics/anomalies.js';
import type { ResolvedTimeRange } from '../metrics/time-range.js';
import type { IncidentNote } from './entities/incident-note.entity.js';
import type { Incident } from './entities/incident.entity.js';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const LOOKBACK_MS = HOUR_MS;

export const BASELINE_GAP_MS = 10 * MINUTE_MS;

export enum TimelineEntryType {
  DEPLOYMENT = 'deployment',
  LATENCY_SPIKE = 'latency_spike',
  ERROR_RATE_SPIKE = 'error_rate_spike',
  ERROR_FIRST_SEEN = 'error_first_seen',
  INCIDENT_CREATED = 'incident_created',
  NOTE = 'note',
  INCIDENT_RESOLVED = 'incident_resolved',
}

export interface TimelineEntry {
  at: Date;
  type: TimelineEntryType;
  title: string;
  detail: string | null;
  refId: string | null;
}

export interface TimelineSources {
  incident: Incident;
  deployments: Deployment[];
  errorGroups: ErrorGroup[];
  notes: IncidentNote[];
  anomalies: Anomaly[];
}

export function incidentWindow(
  startedAt: Date,
  resolvedAt: Date | null,
  now: Date,
): ResolvedTimeRange {
  const start = startedAt.getTime() - LOOKBACK_MS;
  const end = (resolvedAt ?? now).getTime();
  const duration = end - start;
  const stepMs =
    duration <= 3 * HOUR_MS
      ? MINUTE_MS
      : duration <= 24 * HOUR_MS
        ? 5 * MINUTE_MS
        : 30 * MINUTE_MS;

  return {
    from: new Date(Math.floor(start / stepMs) * stepMs),
    to: new Date(Math.ceil(end / stepMs) * stepMs),
    stepMs,
  };
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function anomalyEntry(anomaly: Anomaly): TimelineEntry {
  if (anomaly.type === AnomalyType.LATENCY) {
    return {
      at: anomaly.at,
      type: TimelineEntryType.LATENCY_SPIKE,
      title: `P95 latency increased to ${Math.round(anomaly.value)}ms`,
      detail: `Baseline ${Math.round(anomaly.baseline)}ms`,
      refId: null,
    };
  }

  return {
    at: anomaly.at,
    type: TimelineEntryType.ERROR_RATE_SPIKE,
    title: `Error rate increased to ${formatPercent(anomaly.value)}`,
    detail: `Baseline ${formatPercent(anomaly.baseline)}`,
    refId: null,
  };
}

export function buildTimeline({
  incident,
  deployments,
  errorGroups,
  notes,
  anomalies,
}: TimelineSources): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...deployments.map((deployment) => ({
      at: deployment.deployedAt,
      type: TimelineEntryType.DEPLOYMENT,
      title: `Deployment ${deployment.version}`,
      detail: deployment.service,
      refId: deployment.id,
    })),
    ...anomalies.map(anomalyEntry),
    ...errorGroups.map((group) => ({
      at: group.firstSeen,
      type: TimelineEntryType.ERROR_FIRST_SEEN,
      title: `First ${group.type}`,
      detail: group.service,
      refId: group.id,
    })),
    {
      at: incident.createdAt,
      type: TimelineEntryType.INCIDENT_CREATED,
      title: `Incident #${incident.number} created`,
      detail: incident.title,
      refId: incident.id,
    },
    ...notes.map((note) => ({
      at: note.createdAt,
      type: TimelineEntryType.NOTE,
      title: `Note by ${note.author.name}`,
      detail: note.body,
      refId: note.id,
    })),
  ];

  if (incident.resolvedAt) {
    entries.push({
      at: incident.resolvedAt,
      type: TimelineEntryType.INCIDENT_RESOLVED,
      title: `Incident #${incident.number} resolved`,
      detail: null,
      refId: incident.id,
    });
  }

  return entries.sort((a, b) => a.at.getTime() - b.at.getTime());
}
