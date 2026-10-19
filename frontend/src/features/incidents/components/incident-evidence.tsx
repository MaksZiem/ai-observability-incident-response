import type { ReactNode } from "react";
import Link from "next/link";
import { formatCount, formatDayTime, formatLatency } from "@/lib/format";
import { LogLevel } from "@/features/logs/components/log-level";
import { UnlinkButton } from "@/features/incidents/components/unlink-button";
import type {
  IncidentEvidence as Evidence,
  IncidentLink,
  IncidentLinkKind,
} from "@/features/incidents/types";
import { tracePath } from "@/features/traces/paths";

type IncidentEvidenceProps = {
  projectId: string;
  incidentId: string;
  evidence: Evidence;
  links: IncidentLink[];
};

type EvidenceItem = {
  key: string;
  linkId: string | undefined;
  content: ReactNode;
};

export function IncidentEvidence({
  projectId,
  incidentId,
  evidence,
  links,
}: IncidentEvidenceProps) {
  const linkId = (kind: IncidentLinkKind, targetId: string) =>
    links.find((link) => link.kind === kind && link.targetId === targetId)?.id;

  const items: EvidenceItem[] = [
    ...evidence.errorGroups.map((group) => ({
      key: `error-${group.id}`,
      linkId: linkId("error_group", group.id),
      content: (
        <Link
          href={`/projects/${projectId}/errors/${group.id}`}
          className="flex min-w-0 flex-col hover:underline"
        >
          <span className="truncate font-mono font-medium">{group.type}</span>
          <span className="truncate text-fg-muted">
            {group.service} · {formatCount(group.occurrences)} occurrences
          </span>
        </Link>
      ),
    })),
    ...evidence.traces.map((trace) => ({
      key: `trace-${trace.traceId}`,
      linkId: linkId("trace", trace.traceId),
      content: (
        <Link
          href={tracePath(projectId, trace.traceId)}
          className="flex min-w-0 flex-col hover:underline"
        >
          <span className="truncate font-mono font-medium">
            {trace.rootSpan?.name ?? trace.traceId}
          </span>
          <span className="truncate text-fg-muted">
            Trace · {formatLatency(trace.durationMs)} · {trace.spanCount} spans
          </span>
        </Link>
      ),
    })),
    ...evidence.deployments.map((deployment) => ({
      key: `deployment-${deployment.id}`,
      linkId: linkId("deployment", deployment.id),
      content: (
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-mono font-medium">
            {deployment.version}
          </span>
          <span className="truncate text-fg-muted">
            Deployment · {deployment.service ?? "all services"} ·{" "}
            {formatDayTime(deployment.deployedAt)}
          </span>
        </span>
      ),
    })),
    ...evidence.logs.map((log) => ({
      key: `log-${log.id}`,
      linkId: linkId("log", log.id),
      content: (
        <span className="flex min-w-0 flex-col">
          <span className="flex items-baseline gap-2">
            <LogLevel level={log.level} />
            <span className="truncate font-mono">{log.message}</span>
          </span>
          <span className="truncate text-fg-muted">
            Log · {log.service} · {formatDayTime(log.timestamp)}
          </span>
        </span>
      ),
    })),
  ];

  if (items.length === 0) {
    return (
      <p className="text-[13px] text-fg-muted">
        Nothing linked yet. Add errors, traces, deployments or logs that explain
        this incident; AI analysis uses them as evidence.
      </p>
    );
  }

  return (
    <ul className="flex flex-col text-[13px]">
      {items.map((item) => (
        <li
          key={item.key}
          className="flex items-center gap-3 border-b border-border py-2.5 first:pt-0 last:border-b-0"
        >
          <div className="min-w-0 flex-1">{item.content}</div>
          {item.linkId && (
            <UnlinkButton
              projectId={projectId}
              incidentId={incidentId}
              linkId={item.linkId}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
