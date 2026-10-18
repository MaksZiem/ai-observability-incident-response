import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { EnvironmentBadge } from "@/features/projects/components/environment-badge";
import { getProject } from "@/features/projects/queries";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function OverviewPage({
  params,
}: PageProps<"/projects/[projectId]">) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  return (
    <div>
      <PageHeader
        title="Overview"
        description={project.name}
        actions={<EnvironmentBadge environment={project.environment} />}
      />
    </div>
  );
}
