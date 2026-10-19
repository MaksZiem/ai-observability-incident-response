import Link from "next/link";
import { ERROR_STATUS, ERROR_STATUSES } from "@/features/errors/labels";
import type { ErrorStatus } from "@/features/errors/types";

type ErrorStatusFilterProps = {
  projectId: string;
  active: ErrorStatus | null;
};

export function ErrorStatusFilter({
  projectId,
  active,
}: ErrorStatusFilterProps) {
  const basePath = `/projects/${projectId}/errors`;
  const filters: (ErrorStatus | null)[] = [null, ...ERROR_STATUSES];

  return (
    <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
      {filters.map((status) => {
        const isActive = status === active;

        return (
          <Link
            key={status ?? "all"}
            href={status ? `${basePath}?status=${status}` : basePath}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-2.5 py-1 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              isActive
                ? "bg-surface-2 text-fg"
                : "text-fg-muted hover:bg-surface-hover hover:text-fg"
            }`}
          >
            {status ? ERROR_STATUS[status].label : "All"}
          </Link>
        );
      })}
    </nav>
  );
}
