import { formatCount } from "@/lib/format";
import { TELEMETRY_LABELS } from "@/features/platform/labels";
import type { PlatformStats, TelemetryType } from "@/features/platform/types";

const COLUMNS =
  "grid grid-cols-[minmax(120px,1fr)_100px_100px_100px_100px] items-center gap-4 px-4";

type IngestTableProps = {
  ingest: PlatformStats["ingest"];
};

export function IngestTable({ ingest }: IngestTableProps) {
  const types = Object.keys(ingest) as TelemetryType[];

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <div className="min-w-[560px] text-[13px]">
        <div
          className={`${COLUMNS} border-b border-border py-2 text-xs font-medium text-fg-muted`}
        >
          <span>Telemetry</span>
          <span className="text-right">Requests</span>
          <span className="text-right">Items stored</span>
          <span className="text-right">Rejected</span>
          <span className="text-right">Failed</span>
        </div>
        <ul>
          {types.map((type) => {
            const counters = ingest[type];

            return (
              <li
                key={type}
                className={`${COLUMNS} border-b border-border py-2.5 last:border-b-0`}
              >
                <span>{TELEMETRY_LABELS[type]}</span>
                <span className="text-right font-mono tabular-nums">
                  {formatCount(counters.requests)}
                </span>
                <span className="text-right font-mono tabular-nums">
                  {formatCount(counters.items)}
                </span>
                <span
                  className={`text-right font-mono tabular-nums ${counters.rejected > 0 ? "text-warning" : "text-fg-muted"}`}
                >
                  {formatCount(counters.rejected)}
                </span>
                <span
                  className={`text-right font-mono tabular-nums ${counters.failed > 0 ? "text-danger" : "text-fg-muted"}`}
                >
                  {formatCount(counters.failed)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
