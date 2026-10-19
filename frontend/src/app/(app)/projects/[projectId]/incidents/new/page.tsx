import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CreateIncidentForm } from "@/features/incidents/components/create-incident-form";
import { getProject } from "@/features/projects/queries";

export const metadata: Metadata = {
  title: "New incident",
};

export default async function NewIncidentPage({
  params,
}: PageProps<"/projects/[projectId]/incidents/new">) {
  const { projectId } = await params;
  await getProject(projectId);

  return (
    <div>
      <PageHeader
        back={{ href: `/projects/${projectId}/incidents`, label: "Incidents" }}
        title="New incident"
        description="The incident starts now. Link evidence after it is created."
      />
      <div className="p-6">
        <div className="max-w-[720px] rounded-xl border border-border bg-surface p-[18px]">
          <CreateIncidentForm projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
