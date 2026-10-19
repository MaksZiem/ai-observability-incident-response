import Link from "next/link";
import {
  Bug,
  CircleCheck,
  MessageSquare,
  Rocket,
  Siren,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { formatDayTime } from "@/lib/format";
import type {
  TimelineEntry,
  TimelineEntryType,
} from "@/features/incidents/types";

const ENTRY_STYLE: Record<
  TimelineEntryType,
  { icon: LucideIcon; tone: string }
> = {
  deployment: { icon: Rocket, tone: "text-fg-muted" },
  latency_spike: { icon: TrendingUp, tone: "text-warning" },
  error_rate_spike: { icon: TrendingUp, tone: "text-danger" },
  error_first_seen: { icon: Bug, tone: "text-danger" },
  incident_created: { icon: Siren, tone: "text-accent" },
  note: { icon: MessageSquare, tone: "text-fg-muted" },
  incident_resolved: { icon: CircleCheck, tone: "text-success" },
};

type IncidentTimelineProps = {
  projectId: string;
  entries: TimelineEntry[];
};

function entryHref(projectId: string, entry: TimelineEntry) {
  if (!entry.refId) return null;
  if (entry.type === "error_first_seen") {
    return `/projects/${projectId}/errors/${entry.refId}`;
  }
  if (entry.type === "deployment") {
    return `/projects/${projectId}/deployments`;
  }
  return null;
}

export function IncidentTimeline({
  projectId,
  entries,
}: IncidentTimelineProps) {
  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => {
        const { icon: Icon, tone } = ENTRY_STYLE[entry.type];
        const href = entryHref(projectId, entry);
        const isLast = index === entries.length - 1;

        return (
          <li
            key={`${entry.type}-${entry.refId ?? index}-${entry.at}`}
            className="grid grid-cols-[24px_1fr] gap-3"
          >
            <div className="flex flex-col items-center">
              <span
                className={`flex size-6 items-center justify-center rounded-full border border-border bg-surface-2 ${tone}`}
              >
                <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
              </span>
              {!isLast && <span className="w-px flex-1 bg-border" />}
            </div>

            <div
              className={`flex min-w-0 flex-col gap-0.5 ${isLast ? "" : "pb-4"}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                {href ? (
                  <Link
                    href={href}
                    className="text-sm font-medium hover:underline"
                  >
                    {entry.title}
                  </Link>
                ) : (
                  <span className="text-sm font-medium">{entry.title}</span>
                )}
                <time
                  dateTime={entry.at}
                  className="font-mono text-xs text-fg-muted tabular-nums"
                >
                  {formatDayTime(entry.at)}
                </time>
              </div>
              {entry.detail && (
                <p
                  className={`text-[13px] text-fg-muted ${
                    entry.type === "note" ? "whitespace-pre-wrap" : "font-mono"
                  }`}
                >
                  {entry.detail}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
