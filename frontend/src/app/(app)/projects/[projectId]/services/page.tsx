import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TimeRangePicker } from "@/features/metrics/components/time-range-picker";
import { listServiceHealth } from "@/features/metrics/queries";
import { parseTimeRange } from "@/features/metrics/time-range";
import { getProject } from "@/features/projects/queries";
import { ServiceTable } from "@/features/services/components/service-table";

export const metadata: Metadata = {
  title: "Services",
};

export default async function ServicesPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/services">) {
  const { projectId } = await params;
  const range = parseTimeRange((await searchParams).range);

  await getProject(projectId);
  const services = await listServiceHealth(projectId, range);

  return (
    <div>
      <PageHeader
        title="Services"
        description="Health of every service that handled requests in this time range."
        actions={<TimeRangePicker value={range} />}
      />

      <div className="p-6">
        {services.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No services in this time range"
            description="Services appear once they send server spans to /api/ingest/spans. Try a longer time range."
          />
        ) : (
          <ServiceTable
            projectId={projectId}
            range={range}
            services={services}
          />
        )}
      </div>
    </div>
  );
}
