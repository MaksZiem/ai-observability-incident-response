"use client";

import { formatCount, formatLatency, formatPercent } from "@/lib/format";
import { ChartCard } from "@/features/metrics/components/chart-card";
import {
  TimeSeriesChart,
  type ChartMarker,
} from "@/features/metrics/components/time-series-chart";
import type { Deployment } from "@/features/deployments/types";
import type { Overview } from "@/features/metrics/types";

type RequestChartsProps = {
  overview: Overview;
  deployments: Deployment[];
};

export function RequestCharts({ overview, deployments }: RequestChartsProps) {
  const { from, to, series, summary } = overview;

  const markers: ChartMarker[] = deployments.map((deployment) => ({
    at: deployment.deployedAt,
    label: deployment.version,
  }));

  const chartProps = { from, to, markers };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <ChartCard title="Request volume" value={formatCount(summary.requests)}>
        <TimeSeriesChart
          {...chartProps}
          label="Requests per interval"
          color="accent"
          formatValue={formatCount}
          points={series.map((point) => ({
            at: point.bucket,
            value: point.requests,
          }))}
        />
      </ChartCard>
      <ChartCard title="Error rate" value={formatPercent(summary.errorRate)}>
        <TimeSeriesChart
          {...chartProps}
          label="Error rate per interval"
          color="danger"
          formatValue={formatPercent}
          points={series.map((point) => ({
            at: point.bucket,
            value: point.requests > 0 ? point.errorRate : null,
          }))}
        />
      </ChartCard>
      <ChartCard
        title="P95 latency"
        value={formatLatency(summary.p95LatencyMs)}
      >
        <TimeSeriesChart
          {...chartProps}
          label="P95 latency per interval"
          color="accent"
          formatValue={formatLatency}
          points={series.map((point) => ({
            at: point.bucket,
            value: point.p95LatencyMs,
          }))}
        />
      </ChartCard>
    </div>
  );
}
