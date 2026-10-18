import { ENVIRONMENT_LABELS } from "@/features/projects/labels";
import type { ProjectEnvironment } from "@/features/projects/types";

type EnvironmentBadgeProps = {
  environment: ProjectEnvironment;
};

export function EnvironmentBadge({ environment }: EnvironmentBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium text-fg-muted">
      {ENVIRONMENT_LABELS[environment]}
    </span>
  );
}
