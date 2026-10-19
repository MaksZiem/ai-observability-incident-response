import Link from "next/link";
import { formatCount, formatLatency, formatPercent } from "@/lib/format";
import { ServiceStatusBadge } from "@/features/services/components/service-status-badge";
import { SERVICE_STATUS_ORDER } from "@/features/services/labels";
import { servicePath } from "@/features/services/paths";
import type { ServiceHealth, TimeRange } from "@/features/metrics/types";

const COLUMNS =
  "grid grid-cols-[minmax(160px,1fr)_120px_100px_100px_100px] items-center gap-4 px-4";

type ServiceTableProps = {
  projectId: string;
  range: TimeRange;
  services: ServiceHealth[];
};

function byStatusThenName(a: ServiceHealth, b: ServiceHealth) {
  const status =
    SERVICE_STATUS_ORDER.indexOf(a.status) -
    SERVICE_STATUS_ORDER.indexOf(b.status);
  return status !== 0 ? status : a.service.localeCompare(b.service);
}

export function ServiceTable({
  projectId,
  range,
  services,
}: ServiceTableProps) {
  const sorted = [...services].sort(byStatusThenName);

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <div className="min-w-[640px] text-[13px]">
        <div
          className={`${COLUMNS} border-b border-border py-2 text-xs font-medium text-fg-muted`}
        >
          <span>Service</span>
          <span>Status</span>
          <span className="text-right">Requests</span>
          <span className="text-right">Error rate</span>
          <span className="text-right">P95 latency</span>
        </div>

        <ul>
          {sorted.map((service) => (
            <li
              key={service.service}
              className="border-b border-border last:border-b-0"
            >
              <Link
                href={`${servicePath(projectId, service.service)}?range=${range}`}
                className={`${COLUMNS} py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
              >
                <span className="truncate font-mono">{service.service}</span>
                <span>
                  <ServiceStatusBadge status={service.status} />
                </span>
                <span className="text-right font-mono tabular-nums">
                  {formatCount(service.requests)}
                </span>
                <span className="text-right font-mono tabular-nums">
                  {formatPercent(service.errorRate)}
                </span>
                <span className="text-right font-mono tabular-nums">
                  {formatLatency(service.p95LatencyMs)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
