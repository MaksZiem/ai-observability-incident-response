import Link from "next/link";
import { formatDayTime } from "@/lib/format";
import { IncidentStatusBadge } from "@/features/incidents/components/incident-badges";
import { incidentPath } from "@/features/incidents/paths";
import type { SimilarIncident } from "@/features/incidents/types";

type SimilarIncidentsProps = {
  projectId: string;
  similar: SimilarIncident[];
};

export function SimilarIncidents({
  projectId,
  similar,
}: SimilarIncidentsProps) {
  if (similar.length === 0) {
    return (
      <p className="text-[13px] text-fg-muted">
        No similar incidents in this project yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col text-[13px]">
      {similar.map(({ incident, reasons }) => (
        <li
          key={incident.id}
          className="border-b border-border py-2.5 first:pt-0 last:border-b-0"
        >
          <Link
            href={incidentPath(projectId, incident.id)}
            className="flex flex-col gap-1 hover:underline"
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate font-medium">
                <span className="font-mono text-fg-muted">
                  #{incident.number}
                </span>{" "}
                {incident.title}
              </span>
              <IncidentStatusBadge status={incident.status} />
            </span>
            <span className="text-fg-muted">
              {formatDayTime(incident.startedAt)} · {reasons.join(", ")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
