import Link from "next/link";
import type { TimeRange } from "@/features/metrics/types";
import type { SpanStatus } from "@/features/traces/types";

const FILTERS: { status: SpanStatus | null; label: string }[] = [
  { status: null, label: "All" },
  { status: "error", label: "Errors" },
  { status: "ok", label: "OK" },
];

type TraceStatusFilterProps = {
  projectId: string;
  range: TimeRange;
  active: SpanStatus | null;
};

export function TraceStatusFilter({
  projectId,
  range,
  active,
}: TraceStatusFilterProps) {
  return (
    <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
      {FILTERS.map(({ status, label }) => {
        const query = new URLSearchParams({ range });
        if (status) query.set("status", status);
        const isActive = status === active;

        return (
          <Link
            key={label}
            href={`/projects/${projectId}/traces?${query}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-2.5 py-1 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              isActive
                ? "bg-surface-2 text-fg"
                : "text-fg-muted hover:bg-surface-hover hover:text-fg"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
