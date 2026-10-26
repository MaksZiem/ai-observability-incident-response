export type TelemetryType = "logs" | "spans" | "errors" | "deployments";

export type OutcomeKind = "analyses" | "chat" | "webhooks";

export type Percentiles = {
  count: number;
  p50: number | null;
  p95: number | null;
};

export type IngestCounters = {
  requests: number;
  items: number;
  stored: number;
  rejected: number;
  failed: number;
  retried: number;
  deadLettered: number;
};

export type QueueDepth = {
  waiting: number;
  active: number;
  delayed: number;
  deadLettered: number;
};

export type PlatformStats = {
  startedAt: string;
  uptimeSeconds: number;
  ingest: Record<TelemetryType, IngestCounters>;
  ingestDurationMs: Percentiles;
  telemetryLagMs: Percentiles;
  queueLagMs: Percentiles;
  queue: QueueDepth | null;
  outcomes: Record<OutcomeKind, { succeeded: number; failed: number }>;
  alerts: { runs: number; failedEvaluations: number; lastRunAt: string | null };
};

export type HealthCheck = {
  status: "up" | "down";
  message?: string;
  [detail: string]: unknown;
};

export type HealthReport = {
  status: "ok" | "error" | "shutting_down";
  details: Record<string, HealthCheck>;
};
