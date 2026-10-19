import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import type {
  IncidentLinkKind,
  IncidentSeverity,
  IncidentStatus,
} from "@/features/incidents/types";

type BadgeStyle = {
  label: string;
  tone: StatusTone;
  indicator: StatusIndicator;
};

export const INCIDENT_STATUS: Record<IncidentStatus, BadgeStyle> = {
  open: { label: "Open", tone: "danger", indicator: "dot" },
  investigating: { label: "Investigating", tone: "warning", indicator: "dot" },
  resolved: { label: "Resolved", tone: "success", indicator: "check" },
};

export const INCIDENT_SEVERITY: Record<IncidentSeverity, BadgeStyle> = {
  low: { label: "Low", tone: "neutral", indicator: "hollow" },
  medium: { label: "Medium", tone: "warning", indicator: "dot" },
  high: { label: "High", tone: "danger", indicator: "dot" },
  critical: { label: "Critical", tone: "critical", indicator: "dot" },
};

export const INCIDENT_STATUSES = Object.keys(
  INCIDENT_STATUS,
) as IncidentStatus[];

export const INCIDENT_SEVERITIES = Object.keys(
  INCIDENT_SEVERITY,
) as IncidentSeverity[];

export const LINK_KIND_LABELS: Record<IncidentLinkKind, string> = {
  error_group: "Error group",
  trace: "Trace",
  deployment: "Deployment",
  log: "Log",
};

export const LINK_KINDS = Object.keys(LINK_KIND_LABELS) as IncidentLinkKind[];

export function parseIncidentStatus(value: string | string[] | undefined) {
  return INCIDENT_STATUSES.find((status) => status === value) ?? null;
}
