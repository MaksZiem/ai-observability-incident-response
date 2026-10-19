import { StatusBadge } from "@/components/ui/status-badge";
import { SPAN_STATUS } from "@/features/traces/labels";
import type { SpanStatus } from "@/features/traces/types";

type SpanStatusBadgeProps = {
  status: SpanStatus;
};

export function SpanStatusBadge({ status }: SpanStatusBadgeProps) {
  return <StatusBadge {...SPAN_STATUS[status]} />;
}
