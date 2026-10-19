import Link from "next/link";
import {
  INCIDENT_STATUS,
  INCIDENT_STATUSES,
} from "@/features/incidents/labels";
import type { IncidentStatus } from "@/features/incidents/types";

type IncidentStatusFilterProps = {
  projectId: string;
  active: IncidentStatus | null;
};

export function IncidentStatusFilter({
  projectId,
  active,
}: IncidentStatusFilterProps) {
  const basePath = `/projects/${projectId}/incidents`;
  const filters: (IncidentStatus | null)[] = [null, ...INCIDENT_STATUSES];

  return (
    <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
      {filters.map((status) => {
        const isActive = status === active;

        return (
          <Link
            key={status ?? "all"}
            href={status ? `${basePath}?status=${status}` : basePath}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-2.5 py-1 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              isActive
                ? "bg-surface-2 text-fg"
                : "text-fg-muted hover:bg-surface-hover hover:text-fg"
            }`}
          >
            {status ? INCIDENT_STATUS[status].label : "All"}
          </Link>
        );
      })}
    </nav>
  );
}
