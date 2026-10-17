export enum ProjectEventType {
  LOGS_INGESTED = 'logs.ingested',
  SPANS_INGESTED = 'spans.ingested',
  ERRORS_INGESTED = 'errors.ingested',
  DEPLOYMENT_CREATED = 'deployment.created',
  INCIDENT_CHANGED = 'incident.changed',
  ANALYSIS_FINISHED = 'analysis.finished',
  ALERT_CHANGED = 'alert.changed',
}

export interface ProjectEvent {
  projectId: string;
  type: ProjectEventType;
  data: Record<string, unknown>;
}
