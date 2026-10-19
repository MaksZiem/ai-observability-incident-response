import { StatusBadge } from "@/components/ui/status-badge";
import {
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
} from "@/features/incidents/labels";
import type {
  IncidentSeverity,
  IncidentStatus,
} from "@/features/incidents/types";

type IncidentStatusBadgeProps = {
  status: IncidentStatus;
};

export function IncidentStatusBadge({ status }: IncidentStatusBadgeProps) {
  return <StatusBadge {...INCIDENT_STATUS[status]} />;
}

type IncidentSeverityBadgeProps = {
  severity: IncidentSeverity;
};

export function IncidentSeverityBadge({
  severity,
}: IncidentSeverityBadgeProps) {
  return <StatusBadge {...INCIDENT_SEVERITY[severity]} />;
}
