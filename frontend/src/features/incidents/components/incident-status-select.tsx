"use client";

import { useOptimistic, useTransition } from "react";
import { Select } from "@/components/ui/select";
import { updateIncidentStatus } from "@/features/incidents/actions";
import {
  INCIDENT_STATUS,
  INCIDENT_STATUSES,
} from "@/features/incidents/labels";
import type { IncidentStatus } from "@/features/incidents/types";

type IncidentStatusSelectProps = {
  projectId: string;
  incidentId: string;
  status: IncidentStatus;
};

export function IncidentStatusSelect({
  projectId,
  incidentId,
  status,
}: IncidentStatusSelectProps) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useOptimistic(status);

  function change(next: IncidentStatus) {
    startTransition(async () => {
      setSelected(next);
      await updateIncidentStatus(projectId, incidentId, next);
    });
  }

  return (
    <Select
      aria-label="Incident status"
      value={selected}
      disabled={pending}
      onChange={(event) => change(event.target.value as IncidentStatus)}
    >
      {INCIDENT_STATUSES.map((option) => (
        <option key={option} value={option}>
          {INCIDENT_STATUS[option].label}
        </option>
      ))}
    </Select>
  );
}
