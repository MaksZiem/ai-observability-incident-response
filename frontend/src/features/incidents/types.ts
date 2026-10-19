import type { User } from "@/features/auth/types";
import type { Deployment } from "@/features/deployments/types";
import type { ErrorGroup } from "@/features/errors/types";
import type { Log } from "@/features/logs/types";
import type { TraceDetail } from "@/features/traces/types";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export type IncidentStatus = "open" | "investigating" | "resolved";

export type Incident = {
  id: string;
  projectId: string;
  number: number;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdById: string;
  startedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IncidentNote = {
  id: string;
  incidentId: string;
  authorId: string;
  author: User;
  body: string;
  createdAt: string;
};

export type IncidentLinkKind = "error_group" | "trace" | "deployment" | "log";

export type IncidentLink = {
  id: string;
  incidentId: string;
  kind: IncidentLinkKind;
  targetId: string;
  createdAt: string;
};

export type TimelineEntryType =
  | "deployment"
  | "latency_spike"
  | "error_rate_spike"
  | "error_first_seen"
  | "incident_created"
  | "note"
  | "incident_resolved";

export type TimelineEntry = {
  at: string;
  type: TimelineEntryType;
  title: string;
  detail: string | null;
  refId: string | null;
};

export type IncidentEvidence = {
  errorGroups: ErrorGroup[];
  traces: TraceDetail[];
  deployments: Deployment[];
  logs: Log[];
};

export type SimilarIncident = {
  incident: Incident;
  score: number;
  reasons: string[];
};
