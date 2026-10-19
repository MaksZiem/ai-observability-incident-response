import type { Metadata } from "next";
import { Bug } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorGroupTable } from "@/features/errors/components/error-group-table";
import { ErrorStatusFilter } from "@/features/errors/components/error-status-filter";
import { parseErrorStatus } from "@/features/errors/labels";
import { listErrorGroups } from "@/features/errors/queries";
import { getProject } from "@/features/projects/queries";

export const metadata: Metadata = {
  title: "Errors",
};

export default async function ErrorsPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/errors">) {
  const { projectId } = await params;
  const status = parseErrorStatus((await searchParams).status);

  await getProject(projectId);
  const groups = await listErrorGroups(projectId, {
    status: status ?? undefined,
  });

  return (
    <div>
      <PageHeader
        title="Errors"
        description="Similar errors grouped by type, message and service."
      />

      <div className="flex flex-col gap-4 p-6">
        <ErrorStatusFilter projectId={projectId} active={status} />

        {groups.length === 0 ? (
          <EmptyState
            icon={Bug}
            title={status ? "No errors with this status" : "No errors yet"}
            description="Errors appear once your services send them to /api/ingest/errors."
          />
        ) : (
          <ErrorGroupTable projectId={projectId} groups={groups} />
        )}
      </div>
    </div>
  );
}
