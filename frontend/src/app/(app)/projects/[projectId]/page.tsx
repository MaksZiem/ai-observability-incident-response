import type { Metadata } from "next";
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listDeployments } from "@/features/deployments/queries";
import { TimeRangePicker } from "@/features/metrics/components/time-range-picker";
import { getOverview } from "@/features/metrics/queries";
import { parseTimeRange } from "@/features/metrics/time-range";
import { OverviewCharts } from "@/features/overview/components/overview-charts";
import { OverviewStats } from "@/features/overview/components/overview-stats";
import { EnvironmentBadge } from "@/features/projects/components/environment-badge";
import { getProject } from "@/features/projects/queries";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function OverviewPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]">) {
  const { projectId } = await params;
  const range = parseTimeRange((await searchParams).range);

  const project = await getProject(projectId);
  const overview = await getOverview(projectId, range);
  const deployments = await listDeployments(projectId, {
    from: overview.from,
    to: overview.to,
  });

  return (
    <div>
      <PageHeader
        title="Overview"
        description={project.name}
        actions={
          <>
            <EnvironmentBadge environment={project.environment} />
            <TimeRangePicker value={range} />
          </>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        {overview.summary.requests === 0 ? (
          <EmptyState
            icon={Activity}
            title="No requests in this time range"
            description="Send spans to /api/ingest/spans with your project API key, or pick a longer time range."
          />
        ) : (
          <>
            <OverviewStats summary={overview.summary} />
            <OverviewCharts overview={overview} deployments={deployments} />
          </>
        )}
      </div>
    </div>
  );
}
