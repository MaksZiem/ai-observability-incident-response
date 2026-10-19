import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { formatCount, formatDayTime } from "@/lib/format";
import { ErrorEventList } from "@/features/errors/components/error-event-list";
import { ErrorStatusBadge } from "@/features/errors/components/error-status-badge";
import { ErrorStatusSelect } from "@/features/errors/components/error-status-select";
import { getErrorGroup, listErrorEvents } from "@/features/errors/queries";
import { AddToIncidentForm } from "@/features/incidents/components/add-to-incident-form";
import { listIncidents } from "@/features/incidents/queries";
import { getProject } from "@/features/projects/queries";
import { servicePath } from "@/features/services/paths";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[projectId]/errors/[errorId]">): Promise<Metadata> {
  const { projectId, errorId } = await params;
  const group = await getErrorGroup(projectId, errorId);
  return { title: group.type };
}

type DetailProps = {
  label: string;
  children: ReactNode;
};

function Detail({ label, children }: DetailProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="truncate font-mono text-[13px] tabular-nums">
        {children}
      </dd>
    </div>
  );
}

export default async function ErrorPage({
  params,
}: PageProps<"/projects/[projectId]/errors/[errorId]">) {
  const { projectId, errorId } = await params;

  await getProject(projectId);
  const [group, events, openIncidents, investigatingIncidents] =
    await Promise.all([
      getErrorGroup(projectId, errorId),
      listErrorEvents(projectId, errorId),
      listIncidents(projectId, "open"),
      listIncidents(projectId, "investigating"),
    ]);
  const activeIncidents = [...openIncidents, ...investigatingIncidents];

  return (
    <div>
      <PageHeader
        back={{ href: `/projects/${projectId}/errors`, label: "Errors" }}
        title={<span className="font-mono">{group.type}</span>}
        description={group.message}
        actions={
          <>
            <ErrorStatusBadge status={group.status} />
            <ErrorStatusSelect
              projectId={projectId}
              errorId={group.id}
              status={group.status}
            />
          </>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-surface p-[18px] lg:grid-cols-5">
          <Detail label="Service">
            <Link
              href={servicePath(projectId, group.service)}
              className="text-accent hover:underline"
            >
              {group.service}
            </Link>
          </Detail>
          <Detail label="Endpoint">{group.endpoint ?? "—"}</Detail>
          <Detail label="Occurrences">{formatCount(group.occurrences)}</Detail>
          <Detail label="First seen">{formatDayTime(group.firstSeen)}</Detail>
          <Detail label="Last seen">{formatDayTime(group.lastSeen)}</Detail>
        </dl>

        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-[18px]">
          <h2 className="text-base font-semibold">Add to incident</h2>
          <AddToIncidentForm
            projectId={projectId}
            kind="error_group"
            targetId={group.id}
            incidents={activeIncidents}
          />
        </section>

        <section className="rounded-xl border border-border bg-surface p-[18px]">
          <h2 className="mb-4 text-base font-semibold">Recent events</h2>
          {events.length === 0 ? (
            <p className="text-[13px] text-fg-muted">No events recorded.</p>
          ) : (
            <ErrorEventList projectId={projectId} events={events} />
          )}
        </section>
      </div>
    </div>
  );
}
