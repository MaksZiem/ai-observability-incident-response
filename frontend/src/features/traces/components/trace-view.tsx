"use client";

import { useState } from "react";
import { formatLatency } from "@/lib/format";
import type { Log } from "@/features/logs/types";
import { SpanDetails } from "@/features/traces/components/span-details";
import type { TraceDetail } from "@/features/traces/types";
import { buildWaterfall, findBottleneck } from "@/features/traces/waterfall";

const AXIS_STEPS = [0, 0.25, 0.5, 0.75, 1];
const MIN_BAR_PERCENT = 0.5;
const INDENT_PX = 12;
const ROW_COLUMNS = "grid grid-cols-[220px_1fr_64px] items-center gap-3";

type TraceViewProps = {
  projectId: string;
  trace: TraceDetail;
  logs: Log[];
};

export function TraceView({ projectId, trace, logs }: TraceViewProps) {
  const rows = buildWaterfall(trace.spans, trace.startTime);
  const bottleneck = findBottleneck(rows);
  const [selectedId, setSelectedId] = useState(bottleneck?.span.spanId);
  const selected = rows.find((row) => row.span.spanId === selectedId);
  const total = Math.max(trace.durationMs, 1);

  return (
    <div className="flex flex-col lg:flex-row">
      <section
        aria-label="Spans"
        className="min-w-0 flex-1 overflow-x-auto p-6"
      >
        <div className="min-w-[640px]">
          <div
            className={`${ROW_COLUMNS} border-b border-border pb-2 text-xs text-fg-muted`}
          >
            <span className="font-medium">Span</span>
            <div className="relative h-4 font-mono text-[11px]">
              {AXIS_STEPS.map((step) => (
                <span
                  key={step}
                  className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
                  style={{ left: `${step * 100}%` }}
                >
                  {formatLatency(trace.durationMs * step)}
                </span>
              ))}
            </div>
            <span className="text-right font-medium">Duration</span>
          </div>

          <ul>
            {rows.map((row) => {
              const { span } = row;
              const isSelected = span.spanId === selectedId;
              const isBottleneck = span.spanId === bottleneck?.span.spanId;

              return (
                <li key={span.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(span.spanId)}
                    aria-pressed={isSelected}
                    className={`${ROW_COLUMNS} w-full rounded-md py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                      isSelected ? "bg-surface-hover" : "hover:bg-surface-hover"
                    }`}
                  >
                    <span
                      className="flex min-w-0 flex-col"
                      style={{ paddingLeft: row.depth * INDENT_PX }}
                    >
                      <span className="truncate font-mono text-xs text-fg-muted">
                        {span.service}
                      </span>
                      <span className="truncate font-mono text-[13px]">
                        {span.name}
                      </span>
                    </span>
                    <span className="relative h-2">
                      <span
                        className={`absolute inset-y-0 rounded-sm ${
                          span.status === "error" ? "bg-danger" : "bg-accent"
                        } ${isBottleneck ? "" : "opacity-70"}`}
                        style={{
                          left: `${(row.offsetMs / total) * 100}%`,
                          width: `${Math.max((span.durationMs / total) * 100, MIN_BAR_PERCENT)}%`,
                        }}
                      />
                    </span>
                    <span className="text-right font-mono text-xs tabular-nums">
                      {formatLatency(span.durationMs)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <aside
        aria-label="Span details"
        className="shrink-0 border-t border-border p-6 lg:w-[400px] lg:border-l lg:border-t-0"
      >
        {selected ? (
          <SpanDetails
            projectId={projectId}
            row={selected}
            traceStart={trace.startTime}
            logs={logs.filter((log) => log.spanId === selected.span.spanId)}
          />
        ) : (
          <p className="text-[13px] text-fg-muted">
            Select a span to see its details.
          </p>
        )}
      </aside>
    </div>
  );
}
