import type { Metadata } from "next";
import { Waypoints } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TimeRangePicker } from "@/features/metrics/components/time-range-picker";
import { parseTimeRange, rangeStart } from "@/features/metrics/time-range";
import { getProject } from "@/features/projects/queries";
import { TraceStatusFilter } from "@/features/traces/components/trace-status-filter";
import { TraceTable } from "@/features/traces/components/trace-table";
import { parseSpanStatus } from "@/features/traces/labels";
import { listTraces } from "@/features/traces/queries";

export const metadata: Metadata = {
  title: "Traces",
};

export default async function TracesPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/traces">) {
  const { projectId } = await params;
  const query = await searchParams;
  const range = parseTimeRange(query.range);
  const status = parseSpanStatus(query.status);

  await getProject(projectId);
  const traces = await listTraces(projectId, {
    from: rangeStart(range),
    status: status ?? undefined,
  });

  return (
    <div>
      <PageHeader
        title="Traces"
        description="The latest requests, from the entry span down to every downstream call."
        actions={<TimeRangePicker value={range} />}
      />

      <div className="flex flex-col gap-4 p-6">
        <TraceStatusFilter
          projectId={projectId}
          range={range}
          active={status}
        />

        {traces.length === 0 ? (
          <EmptyState
            icon={Waypoints}
            title="No traces in this time range"
            description="Traces appear once your services send spans to /api/ingest/spans. Try a longer time range."
          />
        ) : (
          <TraceTable projectId={projectId} traces={traces} />
        )}
      </div>
    </div>
  );
}
