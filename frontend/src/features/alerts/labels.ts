import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import { formatCount, formatLatency, formatPercent } from "@/lib/format";
import type {
  AlertComparator,
  AlertMetric,
  AlertRule,
} from "@/features/alerts/types";

export const METRICS: Record<
  AlertMetric,
  { label: string; unit: string; format: (value: number) => string }
> = {
  error_rate: { label: "Error rate", unit: "%", format: formatPercent },
  p95_latency: { label: "P95 latency", unit: "ms", format: formatLatency },
  request_count: {
    label: "Request count",
    unit: "requests",
    format: formatCount,
  },
};

export const METRIC_KEYS = Object.keys(METRICS) as AlertMetric[];

export const COMPARATORS: Record<AlertComparator, string> = {
  gt: ">",
  lt: "<",
};

export const COMPARATOR_KEYS = Object.keys(COMPARATORS) as AlertComparator[];

type BadgeStyle = {
  label: string;
  tone: StatusTone;
  indicator: StatusIndicator;
};

export function alertBadge(
  rule: Pick<AlertRule, "enabled" | "status">,
): BadgeStyle {
  if (!rule.enabled) {
    return { label: "Paused", tone: "neutral", indicator: "hollow" };
  }
  return rule.status === "firing"
    ? { label: "Firing", tone: "danger", indicator: "pulse" }
    : { label: "OK", tone: "success", indicator: "dot" };
}

export function describeCondition(rule: AlertRule) {
  const { label, format } = METRICS[rule.metric];
  return `${label} ${COMPARATORS[rule.comparator]} ${format(rule.threshold)} over ${rule.windowMinutes} min`;
}
