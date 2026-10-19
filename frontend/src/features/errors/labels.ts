import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import type { ErrorStatus } from "@/features/errors/types";

export const ERROR_STATUS: Record<
  ErrorStatus,
  { label: string; tone: StatusTone; indicator: StatusIndicator }
> = {
  open: { label: "Open", tone: "danger", indicator: "dot" },
  investigating: { label: "Investigating", tone: "warning", indicator: "dot" },
  resolved: { label: "Resolved", tone: "success", indicator: "check" },
};

export const ERROR_STATUSES = Object.keys(ERROR_STATUS) as ErrorStatus[];

export function parseErrorStatus(value: string | string[] | undefined) {
  return ERROR_STATUSES.find((status) => status === value) ?? null;
}
