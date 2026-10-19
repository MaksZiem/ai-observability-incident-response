import type { Metadata } from "next";
import Link from "next/link";
import { Siren } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { IncidentStatusFilter } from "@/features/incidents/components/incident-status-filter";
import { IncidentTable } from "@/features/incidents/components/incident-table";
import { parseIncidentStatus } from "@/features/incidents/labels";
import { listIncidents } from "@/features/incidents/queries";
import { getProject } from "@/features/projects/queries";

export const metadata: Metadata = {
  title: "Incidents",
};

export default async function IncidentsPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/incidents">) {
  const { projectId } = await params;
  const status = parseIncidentStatus((await searchParams).status);

  await getProject(projectId);
  const incidents = await listIncidents(projectId, status ?? undefined);

  const newIncident = (
    <Link
      href={`/projects/${projectId}/incidents/new`}
      className={buttonClasses("primary")}
    >
      New incident
    </Link>
  );

  return (
    <div>
      <PageHeader
        title="Incidents"
        description="Every incident in this project, newest first."
        actions={newIncident}
      />

      <div className="flex flex-col gap-4 p-6">
        <IncidentStatusFilter projectId={projectId} active={status} />

        {incidents.length === 0 ? (
          <EmptyState
            icon={Siren}
            title={
              status ? "No incidents with this status" : "No incidents yet"
            }
            description="Open an incident when something is wrong in production. Its timeline is built from deployments, anomalies and errors."
          />
        ) : (
          <IncidentTable projectId={projectId} incidents={incidents} />
        )}
      </div>
    </div>
  );
}
