import { StatusBadge } from "@/components/ui/status-badge";
import { CHECK_LABELS } from "@/features/platform/labels";
import type { HealthReport } from "@/features/platform/types";

type HealthChecksProps = {
  report: HealthReport | null;
};

export function HealthChecks({ report }: HealthChecksProps) {
  if (!report) {
    return (
      <p role="alert" className="text-[13px] text-danger">
        The health endpoint did not respond. The API may be down.
      </p>
    );
  }

  return (
    <ul className="flex flex-col text-[13px]">
      {Object.entries(report.details).map(([key, check]) => (
        <li
          key={key}
          className="flex items-center justify-between gap-3 border-b border-border py-2.5 first:pt-0 last:border-b-0 last:pb-0"
        >
          <span className="flex min-w-0 flex-col">
            <span className="font-medium">{CHECK_LABELS[key] ?? key}</span>
            {check.message && (
              <span className="text-fg-muted">{check.message}</span>
            )}
          </span>
          <StatusBadge
            {...(check.status === "up"
              ? { label: "Up", tone: "success", indicator: "dot" }
              : { label: "Down", tone: "danger", indicator: "pulse" })}
          />
        </li>
      ))}
    </ul>
  );
}
