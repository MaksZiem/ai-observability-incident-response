import { StatusBadge } from "@/components/ui/status-badge";
import { ERROR_STATUS } from "@/features/errors/labels";
import type { ErrorStatus } from "@/features/errors/types";

type ErrorStatusBadgeProps = {
  status: ErrorStatus;
};

export function ErrorStatusBadge({ status }: ErrorStatusBadgeProps) {
  return <StatusBadge {...ERROR_STATUS[status]} />;
}
