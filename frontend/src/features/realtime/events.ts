import type { ProjectEventType } from "@/features/realtime/types";

export const PROJECT_EVENT_TYPES: ProjectEventType[] = [
  "logs.ingested",
  "spans.ingested",
  "errors.ingested",
  "deployment.created",
  "incident.changed",
  "analysis.finished",
  "alert.changed",
];

const SECTIONS_BY_EVENT: Record<ProjectEventType, string[]> = {
  "logs.ingested": ["logs", "traces"],
  "spans.ingested": ["", "services", "traces", "metrics"],
  "errors.ingested": ["errors", "incidents"],
  "deployment.created": ["", "services", "metrics", "deployments", "incidents"],
  "incident.changed": ["incidents", "analysis"],
  "analysis.finished": ["incidents", "analysis"],
  "alert.changed": ["alerts", "incidents"],
};

const COUNT_EVENTS = new Set<ProjectEventType>([
  "errors.ingested",
  "incident.changed",
  "alert.changed",
]);

export function affectsSection(type: ProjectEventType, section: string) {
  return SECTIONS_BY_EVENT[type].includes(section);
}

export function affectsCounts(type: ProjectEventType) {
  return COUNT_EVENTS.has(type);
}
