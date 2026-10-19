import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import type { ServiceStatus } from "@/features/metrics/types";

export const SERVICE_STATUS: Record<
  ServiceStatus,
  { label: string; tone: StatusTone; indicator: StatusIndicator }
> = {
  healthy: { label: "Healthy", tone: "success", indicator: "dot" },
  degraded: { label: "Degraded", tone: "warning", indicator: "dot" },
  critical: { label: "Critical", tone: "critical", indicator: "pulse" },
};

export const SERVICE_STATUS_ORDER: ServiceStatus[] = [
  "critical",
  "degraded",
  "healthy",
];
