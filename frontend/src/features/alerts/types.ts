import type { IncidentSeverity } from "@/features/incidents/types";

export type AlertMetric = "error_rate" | "p95_latency" | "request_count";

export type AlertComparator = "gt" | "lt";

export type AlertStatus = "ok" | "firing";

export type AlertRule = {
  id: string;
  projectId: string;
  name: string;
  metric: AlertMetric;
  comparator: AlertComparator;
  threshold: number;
  windowMinutes: number;
  service: string | null;
  createIncident: boolean;
  incidentSeverity: IncidentSeverity;
  webhookUrl: string | null;
  enabled: boolean;
  status: AlertStatus;
  lastValue: number | null;
  lastEvaluatedAt: string | null;
  lastTriggeredAt: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};
