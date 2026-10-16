import { describe, expect, it } from 'vitest';
import type { Deployment } from '../deployments/entities/deployment.entity.js';
import type { ErrorGroup } from '../errors/entities/error-group.entity.js';
import { AnomalyType } from '../metrics/anomalies.js';
import type { IncidentNote } from './entities/incident-note.entity.js';
import type { Incident } from './entities/incident.entity.js';
import {
  buildTimeline,
  incidentWindow,
  TimelineEntryType,
} from './incident-timeline.js';

const at = (time: string) => new Date(`2026-10-14T${time}:00.000Z`);

describe('incidentWindow', () => {
  it('starts an hour before the incident and uses minute buckets', () => {
    expect(incidentWindow(at('14:04'), at('14:40'), at('15:00'))).toEqual({
      from: at('13:04'),
      to: at('14:40'),
      stepMs: 60_000,
    });
  });

  it('extends an open incident until now with larger buckets', () => {
    const window = incidentWindow(at('02:00'), null, at('14:02'));

    expect(window.stepMs).toBe(5 * 60_000);
    expect(window.to).toEqual(at('14:05'));
  });
});

describe('buildTimeline', () => {
  it('merges every source in chronological order', () => {
    const timeline = buildTimeline({
      incident: {
        id: 'i1',
        number: 382,
        title: 'Payment API degraded',
        createdAt: at('14:10'),
        resolvedAt: at('14:40'),
      } as Incident,
      deployments: [
        {
          id: 'd1',
          version: 'v1.42.3',
          service: null,
          deployedAt: at('14:00'),
        } as Deployment,
      ],
      errorGroups: [
        {
          id: 'e1',
          type: 'DatabaseConnectionTimeout',
          service: 'payment-service',
          firstSeen: at('14:05'),
        } as ErrorGroup,
      ],
      notes: [
        {
          id: 'n1',
          body: 'Pool exhausted',
          author: { name: 'Alice' },
          createdAt: at('14:20'),
        } as IncidentNote,
      ],
      anomalies: [
        {
          type: AnomalyType.LATENCY,
          at: at('14:04'),
          value: 1250,
          baseline: 100,
        },
      ],
    });

    expect(timeline.map((entry) => [entry.type, entry.title])).toEqual([
      [TimelineEntryType.DEPLOYMENT, 'Deployment v1.42.3'],
      [TimelineEntryType.LATENCY_SPIKE, 'P95 latency increased to 1250ms'],
      [TimelineEntryType.ERROR_FIRST_SEEN, 'First DatabaseConnectionTimeout'],
      [TimelineEntryType.INCIDENT_CREATED, 'Incident #382 created'],
      [TimelineEntryType.NOTE, 'Note by Alice'],
      [TimelineEntryType.INCIDENT_RESOLVED, 'Incident #382 resolved'],
    ]);
  });
});
