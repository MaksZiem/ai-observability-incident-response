import { Incident, IncidentStatus } from './entities/incident.entity.js';

export function applyStatus(
  incident: Pick<Incident, 'status' | 'resolvedAt'>,
  status: IncidentStatus,
  now: Date,
): void {
  if (incident.status === status) {
    return;
  }

  incident.status = status;
  incident.resolvedAt = status === IncidentStatus.RESOLVED ? now : null;
}
