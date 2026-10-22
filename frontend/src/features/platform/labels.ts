import type { OutcomeKind, TelemetryType } from "@/features/platform/types";

export const TELEMETRY_LABELS: Record<TelemetryType, string> = {
  logs: "Logs",
  spans: "Spans",
  errors: "Errors",
  deployments: "Deployments",
};

export const OUTCOME_LABELS: Record<OutcomeKind, string> = {
  analyses: "AI analyses",
  chat: "Assistant answers",
  webhooks: "Alert webhooks",
};

export const CHECK_LABELS: Record<string, string> = {
  database: "Database",
  alertScheduler: "Alert scheduler",
};
