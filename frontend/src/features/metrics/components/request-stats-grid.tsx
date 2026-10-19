import { StatCard } from "@/components/ui/stat-card";
import { formatCount, formatLatency, formatPercent } from "@/lib/format";
import { errorRateTone, latencyTone } from "@/features/metrics/health";
import type { RequestStats } from "@/features/metrics/types";

type RequestStatsGridProps = {
  summary: RequestStats;
};

export function RequestStatsGrid({ summary }: RequestStatsGridProps) {
  return (
    <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      <StatCard label="Requests" value={formatCount(summary.requests)} />
      <StatCard
        label="Error rate"
        value={formatPercent(summary.errorRate)}
        tone={errorRateTone(summary)}
      />
      <StatCard
        label="P95 latency"
        value={formatLatency(summary.p95LatencyMs)}
        tone={latencyTone(summary)}
      />
      <StatCard
        label="Errors"
        value={formatCount(summary.errors)}
        tone={summary.errors > 0 ? "danger" : "default"}
      />
    </section>
  );
}
