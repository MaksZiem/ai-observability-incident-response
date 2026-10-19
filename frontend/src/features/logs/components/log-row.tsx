import Link from "next/link";
import { JsonBlock } from "@/components/ui/json-block";
import { formatClock, formatDayTime } from "@/lib/format";
import { LogLevel } from "@/features/logs/components/log-level";
import type { Log, LogLevel as Level } from "@/features/logs/types";
import { servicePath } from "@/features/services/paths";
import { tracePath } from "@/features/traces/paths";

const ROW_COLUMNS =
  "grid grid-cols-[72px_48px_minmax(96px,140px)_1fr] items-baseline gap-3";

const BAR_CLASSES: Partial<Record<Level, string>> = {
  error: "before:bg-danger",
  fatal: "before:bg-critical",
};

type LogRowProps = {
  projectId: string;
  log: Log;
};

export function LogRow({ projectId, log }: LogRowProps) {
  const barColor = BAR_CLASSES[log.level];
  const bar = barColor
    ? `relative before:absolute before:inset-y-0 before:left-0 before:w-0.5 ${barColor}`
    : "";

  return (
    <details className={`group border-b border-border last:border-b-0 ${bar}`}>
      <summary
        className={`${ROW_COLUMNS} cursor-pointer list-none px-4 py-1.5 font-mono text-[13px] transition-colors hover:bg-surface-hover group-open:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden`}
      >
        <time
          dateTime={log.timestamp}
          title={formatDayTime(log.timestamp)}
          className="text-xs text-fg-muted tabular-nums"
          suppressHydrationWarning
        >
          {formatClock(log.timestamp)}
        </time>
        <LogLevel level={log.level} />
        <span className="truncate text-xs text-fg-muted">{log.service}</span>
        <span className="min-w-0 truncate group-open:whitespace-normal group-open:break-words">
          {log.message}
        </span>
      </summary>

      <div className="flex flex-col gap-3 px-4 pb-4 pt-2 text-[13px]">
        <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-1.5 sm:grid-cols-[88px_1fr_88px_1fr]">
          <dt className="text-fg-muted">Service</dt>
          <dd className="min-w-0 truncate font-mono">
            <Link
              href={servicePath(projectId, log.service)}
              className="text-accent hover:underline"
            >
              {log.service}
            </Link>
          </dd>
          <dt className="text-fg-muted">Timestamp</dt>
          <dd className="font-mono tabular-nums" suppressHydrationWarning>
            {formatDayTime(log.timestamp)}
          </dd>
          {log.endpoint && (
            <>
              <dt className="text-fg-muted">Endpoint</dt>
              <dd className="min-w-0 truncate font-mono">{log.endpoint}</dd>
            </>
          )}
          {log.traceId && (
            <>
              <dt className="text-fg-muted">Trace</dt>
              <dd className="min-w-0 truncate font-mono">
                <Link
                  href={tracePath(projectId, log.traceId)}
                  className="text-accent hover:underline"
                >
                  {log.traceId}
                </Link>
              </dd>
            </>
          )}
          {log.spanId && (
            <>
              <dt className="text-fg-muted">Span</dt>
              <dd className="min-w-0 truncate font-mono">{log.spanId}</dd>
            </>
          )}
          {log.requestId && (
            <>
              <dt className="text-fg-muted">Request</dt>
              <dd className="min-w-0 truncate font-mono">{log.requestId}</dd>
            </>
          )}
        </dl>

        {Object.keys(log.attributes).length > 0 && (
          <JsonBlock value={log.attributes} />
        )}
      </div>
    </details>
  );
}
