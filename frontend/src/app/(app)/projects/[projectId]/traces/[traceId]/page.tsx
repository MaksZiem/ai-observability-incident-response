import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { formatDayTime, formatLatency } from "@/lib/format";
import { decodeParam } from "@/lib/url";
import { listLogs } from "@/features/logs/queries";
import { getProject } from "@/features/projects/queries";
import { SpanStatusBadge } from "@/features/traces/components/span-status-badge";
import { TraceView } from "@/features/traces/components/trace-view";
import { getTrace } from "@/features/traces/queries";

const TRACE_LOGS_LIMIT = 200;

export const metadata: Metadata = {
  title: "Trace",
};

export default async function TracePage({
  params,
}: PageProps<"/projects/[projectId]/traces/[traceId]">) {
  const { projectId, traceId: traceParam } = await params;
  const traceId = decodeParam(traceParam);

  await getProject(projectId);
  const [trace, logs] = await Promise.all([
    getTrace(projectId, traceId),
    listLogs(projectId, { traceId, limit: TRACE_LOGS_LIMIT }),
  ]);

  const summary = [
    formatDayTime(trace.startTime),
    formatLatency(trace.durationMs),
    `${trace.spanCount} spans`,
    trace.services.join(", "),
  ].join(" · ");

  return (
    <div>
      <PageHeader
        back={{ href: `/projects/${projectId}/traces`, label: "Traces" }}
        title={
          <span className="font-mono">{trace.rootSpan?.name ?? traceId}</span>
        }
        description={summary}
        actions={<SpanStatusBadge status={trace.hasError ? "error" : "ok"} />}
      />
      <p className="border-b border-border px-6 py-2 font-mono text-xs text-fg-muted">
        Trace {trace.traceId}
      </p>

      <TraceView projectId={projectId} trace={trace} logs={logs.items} />
    </div>
  );
}
