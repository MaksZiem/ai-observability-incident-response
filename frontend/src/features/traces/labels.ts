import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import type { SpanKind, SpanStatus } from "@/features/traces/types";

export const SPAN_STATUS: Record<
  SpanStatus,
  { label: string; tone: StatusTone; indicator: StatusIndicator }
> = {
  ok: { label: "OK", tone: "neutral", indicator: "check" },
  error: { label: "Error", tone: "danger", indicator: "cross" },
};

export const SPAN_KIND_LABELS: Record<SpanKind, string> = {
  server: "Server",
  client: "Client",
  internal: "Internal",
};

export function parseSpanStatus(value: string | string[] | undefined) {
  return value === "error" || value === "ok" ? value : null;
}
