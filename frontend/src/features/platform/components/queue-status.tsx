import { formatCount, formatLatency } from "@/lib/format";
import type { PlatformStats } from "@/features/platform/types";

type QueueStatusProps = {
  stats: PlatformStats;
};

export function QueueStatus({ stats }: QueueStatusProps) {
  const { queue, queueLagMs, ingest } = stats;

  if (!queue) {
    return (
      <p role="alert" className="text-[13px] text-danger">
        Queue depth is unavailable. Redis may be unreachable.
      </p>
    );
  }

  const retried = Object.values(ingest).reduce(
    (total, counters) => total + counters.retried,
    0,
  );

  const rows = [
    { label: "Waiting", value: formatCount(queue.waiting) },
    { label: "Processing", value: formatCount(queue.active) },
    {
      label: "Waiting to retry",
      value: formatCount(queue.delayed),
      tone: queue.delayed > 0 ? "text-warning" : "",
    },
    {
      label: "Dead-lettered",
      value: formatCount(queue.deadLettered),
      tone: queue.deadLettered > 0 ? "text-danger" : "",
    },
    { label: "Retries since start", value: formatCount(retried) },
    {
      label: "Queue lag P50 / P95",
      value: `${formatLatency(queueLagMs.p50)} / ${formatLatency(queueLagMs.p95)}`,
    },
  ];

  return (
    <dl className="flex flex-col text-[13px]">
      {rows.map(({ label, value, tone = "" }) => (
        <div
          key={label}
          className="flex items-baseline justify-between gap-3 border-b border-border py-2 first:pt-0 last:border-b-0 last:pb-0"
        >
          <dt className="text-fg-muted">{label}</dt>
          <dd className={`font-mono tabular-nums ${tone}`}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
