import Link from "next/link";
import { formatDayTime } from "@/lib/format";
import {
  IncidentSeverityBadge,
  IncidentStatusBadge,
} from "@/features/incidents/components/incident-badges";
import { incidentPath } from "@/features/incidents/paths";
import type { Incident } from "@/features/incidents/types";

const COLUMNS =
  "grid grid-cols-[64px_minmax(240px,1fr)_110px_130px_130px] items-center gap-4 px-4";

type IncidentTableProps = {
  projectId: string;
  incidents: Incident[];
};

export function IncidentTable({ projectId, incidents }: IncidentTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <div className="min-w-[720px] text-[13px]">
        <div
          className={`${COLUMNS} border-b border-border py-2 text-xs font-medium text-fg-muted`}
        >
          <span>#</span>
          <span>Title</span>
          <span>Severity</span>
          <span>Status</span>
          <span className="text-right">Started</span>
        </div>

        <ul>
          {incidents.map((incident) => (
            <li
              key={incident.id}
              className="border-b border-border last:border-b-0"
            >
              <Link
                href={incidentPath(projectId, incident.id)}
                className={`${COLUMNS} py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
              >
                <span className="font-mono text-fg-muted tabular-nums">
                  #{incident.number}
                </span>
                <span className="truncate font-medium">{incident.title}</span>
                <span>
                  <IncidentSeverityBadge severity={incident.severity} />
                </span>
                <span>
                  <IncidentStatusBadge status={incident.status} />
                </span>
                <span className="text-right font-mono text-fg-muted tabular-nums">
                  {formatDayTime(incident.startedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
