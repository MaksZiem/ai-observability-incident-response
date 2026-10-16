import { describe, expect, it } from 'vitest';
import { IncidentStatus } from './entities/incident.entity.js';
import { applyStatus } from './incident-status.js';

const now = new Date('2026-10-14T15:00:00.000Z');

describe('applyStatus', () => {
  it('sets resolvedAt when the incident is resolved', () => {
    const incident = { status: IncidentStatus.INVESTIGATING, resolvedAt: null };

    applyStatus(incident, IncidentStatus.RESOLVED, now);

    expect(incident).toEqual({
      status: IncidentStatus.RESOLVED,
      resolvedAt: now,
    });
  });

  it('clears resolvedAt when a resolved incident is reopened', () => {
    const incident = {
      status: IncidentStatus.RESOLVED,
      resolvedAt: new Date('2026-10-14T14:30:00.000Z'),
    };

    applyStatus(incident, IncidentStatus.OPEN, now);

    expect(incident).toEqual({ status: IncidentStatus.OPEN, resolvedAt: null });
  });

  it('keeps the original resolvedAt when resolving twice', () => {
    const resolvedAt = new Date('2026-10-14T14:30:00.000Z');
    const incident = { status: IncidentStatus.RESOLVED, resolvedAt };

    applyStatus(incident, IncidentStatus.RESOLVED, now);

    expect(incident.resolvedAt).toBe(resolvedAt);
  });
});
