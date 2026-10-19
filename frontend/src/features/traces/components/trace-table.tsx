import Link from "next/link";
import { formatDayTime, formatLatency } from "@/lib/format";
import { SpanStatusBadge } from "@/features/traces/components/span-status-badge";
import { tracePath } from "@/features/traces/paths";
import type { Span } from "@/features/traces/types";

const COLUMNS =
  "grid grid-cols-[120px_minmax(220px,1fr)_140px_90px_minmax(120px,200px)] items-center gap-4 px-4";

type TraceTableProps = {
  projectId: string;
  traces: Span[];
};

export function TraceTable({ projectId, traces }: TraceTableProps) {
  const slowest = Math.max(...traces.map((trace) => trace.durationMs), 1);

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <div className="min-w-[760px] text-[13px]">
        <div
          className={`${COLUMNS} border-b border-border py-2 text-xs font-medium text-fg-muted`}
        >
          <span>Started</span>
          <span>Operation</span>
          <span>Service</span>
          <span>Status</span>
          <span className="text-right">Duration</span>
        </div>

        <ul>
          {traces.map((trace) => (
            <li
              key={trace.id}
              className="border-b border-border last:border-b-0"
            >
              <Link
                href={tracePath(projectId, trace.traceId)}
                className={`${COLUMNS} py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
              >
                <span className="font-mono text-fg-muted tabular-nums">
                  {formatDayTime(trace.startTime)}
                </span>
                <span className="truncate font-mono">{trace.name}</span>
                <span className="truncate font-mono text-fg-muted">
                  {trace.service}
                </span>
                <span>
                  <SpanStatusBadge status={trace.status} />
                </span>
                <span className="flex items-center justify-end gap-2">
                  <span
                    className={`h-1.5 rounded-sm ${
                      trace.status === "error" ? "bg-danger" : "bg-accent"
                    }`}
                    style={{ width: `${(trace.durationMs / slowest) * 100}%` }}
                    aria-hidden
                  />
                  <span className="w-16 shrink-0 text-right font-mono tabular-nums">
                    {formatLatency(trace.durationMs)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
