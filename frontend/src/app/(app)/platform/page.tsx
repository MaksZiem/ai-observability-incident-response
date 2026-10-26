import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { StatCard } from "@/components/ui/stat-card";
import {
  formatCount,
  formatDayTime,
  formatDuration,
  formatLatency,
} from "@/lib/format";
import { HealthChecks } from "@/features/platform/components/health-checks";
import { IngestTable } from "@/features/platform/components/ingest-table";
import { OutcomeList } from "@/features/platform/components/outcome-list";
import { QueueStatus } from "@/features/platform/components/queue-status";
import { getHealth, getPlatformStats } from "@/features/platform/queries";

export const metadata: Metadata = {
  title: "Platform health",
};

type PanelProps = {
  title: string;
  children: ReactNode;
};

function Panel({ title, children }: PanelProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-[18px]">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default async function PlatformPage() {
  const [stats, health] = await Promise.all([getPlatformStats(), getHealth()]);
  const { ingestDurationMs, telemetryLagMs, queueLagMs, alerts } = stats;
  const deadLettered = stats.queue?.deadLettered ?? 0;

  return (
    <div>
      <PageHeader
        title="Platform health"
        description={`How the observability platform itself is doing. Counters reset on restart; up for ${formatDuration(stats.uptimeSeconds * 1000)}.`}
        actions={<RefreshButton />}
      />

      <div className="flex flex-col gap-6 p-6">
        <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <StatCard
            label="Ingest P95"
            value={formatLatency(ingestDurationMs.p95)}
          />
          <StatCard
            label="Queue lag P95"
            value={formatLatency(queueLagMs.p95)}
            tone={(queueLagMs.p95 ?? 0) > 60_000 ? "warning" : "default"}
          />
          <StatCard
            label="Telemetry lag P95"
            value={formatLatency(telemetryLagMs.p95)}
            tone={(telemetryLagMs.p95 ?? 0) > 60_000 ? "warning" : "default"}
          />
          <StatCard
            label="Dead-lettered jobs"
            value={formatCount(deadLettered)}
            tone={deadLettered > 0 ? "danger" : "default"}
          />
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Ingestion</h2>
            <IngestTable ingest={stats.ingest} />
            <p className="text-xs text-fg-muted">
              Accepted telemetry is queued and stored by a worker. Rejected
              requests failed validation or authentication; failed requests
              could not be queued. Jobs that keep failing are retried with
              backoff, then dead-lettered so nothing is dropped silently.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <Panel title="Ingest queue">
              <QueueStatus stats={stats} />
            </Panel>

            <Panel title="Dependencies">
              <HealthChecks report={health} />
            </Panel>

            <Panel title="Background work">
              <OutcomeList outcomes={stats.outcomes} />
              <p className="border-t border-border pt-3 font-mono text-xs text-fg-muted">
                {formatCount(alerts.runs)} alert runs ·{" "}
                {formatCount(alerts.failedEvaluations)} failed evaluations ·
                last{" "}
                {alerts.lastRunAt ? formatDayTime(alerts.lastRunAt) : "never"}
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
