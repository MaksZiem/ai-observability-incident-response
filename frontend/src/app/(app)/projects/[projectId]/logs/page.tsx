import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { LogFilters } from "@/features/logs/components/log-filters";
import { LogStream } from "@/features/logs/components/log-stream";
import { readLogFilters } from "@/features/logs/filters";
import { listLogs } from "@/features/logs/queries";
import { TimeRangePicker } from "@/features/metrics/components/time-range-picker";
import { parseTimeRange, rangeStart } from "@/features/metrics/time-range";
import { getProject } from "@/features/projects/queries";

export const metadata: Metadata = {
  title: "Logs",
};

export default async function LogsPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/logs">) {
  const { projectId } = await params;
  const query = await searchParams;
  const range = parseTimeRange(query.range);
  const filters = readLogFilters(query);
  const filter = { ...filters, from: rangeStart(range) };

  await getProject(projectId);
  const page = await listLogs(projectId, filter);

  return (
    <div>
      <PageHeader
        title="Logs"
        description="Newest first. Click a line to see its metadata."
        actions={<TimeRangePicker value={range} />}
      />

      <div className="flex flex-col gap-4 p-6">
        <LogFilters projectId={projectId} range={range} filters={filters} />

        {page.items.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No logs match these filters"
            description="Widen the time range or clear some filters. Logs arrive through /api/ingest/logs."
          />
        ) : (
          <LogStream
            key={JSON.stringify({ ...filters, range })}
            projectId={projectId}
            filter={filter}
            initialPage={page}
          />
        )}
      </div>
    </div>
  );
}
