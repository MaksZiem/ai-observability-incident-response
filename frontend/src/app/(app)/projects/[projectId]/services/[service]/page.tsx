import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { decodeParam } from "@/lib/url";
import { DeploymentList } from "@/features/deployments/components/deployment-list";
import { listDeployments } from "@/features/deployments/queries";
import { logsHref } from "@/features/logs/filters";
import { RequestCharts } from "@/features/metrics/components/request-charts";
import { RequestStatsGrid } from "@/features/metrics/components/request-stats-grid";
import { TimeRangePicker } from "@/features/metrics/components/time-range-picker";
import { getServiceStatus } from "@/features/metrics/health";
import { getOverview } from "@/features/metrics/queries";
import { parseTimeRange } from "@/features/metrics/time-range";
import { getProject } from "@/features/projects/queries";
import { ServiceStatusBadge } from "@/features/services/components/service-status-badge";

const RECENT_DEPLOYMENTS = 5;

export async function generateMetadata({
  params,
}: PageProps<"/projects/[projectId]/services/[service]">): Promise<Metadata> {
  const { service } = await params;
  return { title: decodeParam(service) };
}

export default async function ServicePage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/services/[service]">) {
  const { projectId, service: serviceParam } = await params;
  const service = decodeParam(serviceParam);
  const range = parseTimeRange((await searchParams).range);

  await getProject(projectId);
  const overview = await getOverview(projectId, range, service);
  const [deploymentsInRange, recentDeployments] = await Promise.all([
    listDeployments(projectId, {
      service,
      from: overview.from,
      to: overview.to,
    }),
    listDeployments(projectId, { service, limit: RECENT_DEPLOYMENTS }),
  ]);

  const hasTraffic = overview.summary.requests > 0;

  return (
    <div>
      <PageHeader
        back={{
          href: `/projects/${projectId}/services?range=${range}`,
          label: "Services",
        }}
        title={<span className="font-mono">{service}</span>}
        actions={
          <>
            {hasTraffic && (
              <ServiceStatusBadge status={getServiceStatus(overview.summary)} />
            )}
            <Link
              href={logsHref(projectId, { service })}
              className={buttonClasses("secondary")}
            >
              View logs
            </Link>
            <TimeRangePicker value={range} />
          </>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        {hasTraffic ? (
          <>
            <RequestStatsGrid summary={overview.summary} />
            <RequestCharts
              overview={overview}
              deployments={deploymentsInRange}
            />
          </>
        ) : (
          <EmptyState
            icon={Activity}
            title="No requests in this time range"
            description="This service has not reported server spans recently. Pick a longer time range."
          />
        )}

        <section className="rounded-xl border border-border bg-surface p-[18px]">
          <h2 className="mb-2 text-base font-semibold">Recent deployments</h2>
          {recentDeployments.length === 0 ? (
            <p className="text-[13px] text-fg-muted">
              No deployments registered for this service.
            </p>
          ) : (
            <DeploymentList deployments={recentDeployments} />
          )}
        </section>
      </div>
    </div>
  );
}
