import type { Metadata } from "next";
import { ChartLine } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listDeployments } from "@/features/deployments/queries";
import { RequestCharts } from "@/features/metrics/components/request-charts";
import { RequestStatsGrid } from "@/features/metrics/components/request-stats-grid";
import { ServiceSelect } from "@/features/metrics/components/service-select";
import { TimeRangePicker } from "@/features/metrics/components/time-range-picker";
import { getOverview, listServiceHealth } from "@/features/metrics/queries";
import { parseTimeRange } from "@/features/metrics/time-range";
import { getProject } from "@/features/projects/queries";

export const metadata: Metadata = {
  title: "Metrics",
};

function readService(value: string | string[] | undefined) {
  const service = (Array.isArray(value) ? value[0] : value)?.trim();
  return service ? service : undefined;
}

export default async function MetricsPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/metrics">) {
  const { projectId } = await params;
  const query = await searchParams;
  const range = parseTimeRange(query.range);
  const service = readService(query.service);

  await getProject(projectId);
  const [overview, services] = await Promise.all([
    getOverview(projectId, range, service),
    listServiceHealth(projectId, range),
  ]);
  const deployments = await listDeployments(projectId, {
    service,
    from: overview.from,
    to: overview.to,
  });

  const serviceNames = services.map((health) => health.service);
  if (service && !serviceNames.includes(service)) serviceNames.push(service);

  return (
    <div>
      <PageHeader
        title="Metrics"
        description="Request volume, error rate and latency over time."
        actions={
          <>
            <ServiceSelect services={serviceNames} value={service} />
            <TimeRangePicker value={range} />
          </>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        {overview.summary.requests === 0 ? (
          <EmptyState
            icon={ChartLine}
            title="No requests in this time range"
            description="Pick a longer time range or another service."
          />
        ) : (
          <>
            <RequestStatsGrid summary={overview.summary} />
            <RequestCharts overview={overview} deployments={deployments} />
          </>
        )}
      </div>
    </div>
  );
}
