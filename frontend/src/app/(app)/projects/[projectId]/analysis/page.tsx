import type { Metadata } from "next";
import Link from "next/link";
import { FileSearch } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { formatDayTime } from "@/lib/format";
import { AnalysisStatusBadge } from "@/features/analysis/components/analysis-status-badge";
import { listAnalyses } from "@/features/analysis/queries";
import {
  IncidentSeverityBadge,
  IncidentStatusBadge,
} from "@/features/incidents/components/incident-badges";
import { incidentPath } from "@/features/incidents/paths";
import { listIncidents } from "@/features/incidents/queries";
import { getProject } from "@/features/projects/queries";

const RECENT_INCIDENTS = 20;
const COLUMNS =
  "grid grid-cols-[64px_minmax(220px,1fr)_110px_130px_minmax(200px,auto)] items-center gap-4 px-4";

export const metadata: Metadata = {
  title: "AI Analysis",
};

export default async function AnalysisPage({
  params,
}: PageProps<"/projects/[projectId]/analysis">) {
  const { projectId } = await params;

  await getProject(projectId);
  const incidents = (await listIncidents(projectId)).slice(0, RECENT_INCIDENTS);
  const latestAnalyses = await Promise.all(
    incidents.map(async (incident) => {
      const [latest] = await listAnalyses(projectId, incident.id);
      return latest;
    }),
  );

  return (
    <div>
      <PageHeader
        title="AI Analysis"
        description="Structured analyses of recent incidents: observed facts, hypotheses and next steps."
      />

      <div className="p-6">
        {incidents.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No incidents to analyze"
            description="Create an incident and link its evidence; the analysis runs on top of it."
            action={
              <Link
                href={`/projects/${projectId}/incidents/new`}
                className={buttonClasses("primary")}
              >
                New incident
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <div className="min-w-[760px] text-[13px]">
              <div
                className={`${COLUMNS} border-b border-border py-2 text-xs font-medium text-fg-muted`}
              >
                <span>#</span>
                <span>Incident</span>
                <span>Severity</span>
                <span>Status</span>
                <span>Latest analysis</span>
              </div>
              <ul>
                {incidents.map((incident, index) => {
                  const analysis = latestAnalyses[index];

                  return (
                    <li
                      key={incident.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <Link
                        href={incidentPath(projectId, incident.id)}
                        className={`${COLUMNS} py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
                      >
                        <span className="font-mono text-fg-muted tabular-nums">
                          #{incident.number}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">
                            {incident.title}
                          </span>
                          {analysis?.result && (
                            <span className="truncate text-fg-muted">
                              {analysis.result.summary}
                            </span>
                          )}
                        </span>
                        <span>
                          <IncidentSeverityBadge severity={incident.severity} />
                        </span>
                        <span>
                          <IncidentStatusBadge status={incident.status} />
                        </span>
                        {analysis ? (
                          <span className="flex items-center gap-2">
                            <AnalysisStatusBadge status={analysis.status} />
                            <span className="font-mono text-xs text-fg-muted tabular-nums">
                              {formatDayTime(analysis.createdAt)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-fg-muted">Not analyzed</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
