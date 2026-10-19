import Form from "next/form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOG_LEVEL_CLASSES, LOG_LEVELS } from "@/features/logs/labels";
import type { LogFilters as Filters } from "@/features/logs/filters";
import type { TimeRange } from "@/features/metrics/types";

type LogFiltersProps = {
  projectId: string;
  range: TimeRange;
  filters: Filters;
};

const TEXT_FIELDS = [
  { name: "service", label: "Service", placeholder: "payment-service" },
  { name: "endpoint", label: "Endpoint", placeholder: "POST /payments" },
  { name: "traceId", label: "Trace ID", placeholder: "abc123" },
  { name: "requestId", label: "Request ID", placeholder: "req_…" },
] as const;

export function LogFilters({ projectId, range, filters }: LogFiltersProps) {
  const path = `/projects/${projectId}/logs`;
  const hasFilters = Object.values(filters).some(
    (value) => value !== undefined,
  );

  return (
    <Form
      action={path}
      key={JSON.stringify(filters)}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-[18px]"
    >
      <input type="hidden" name="range" value={range} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TEXT_FIELDS.map(({ name, label, placeholder }) => (
          <label key={name} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-fg-muted">{label}</span>
            <Input
              name={name}
              placeholder={placeholder}
              defaultValue={filters[name]}
              className="font-mono"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex flex-wrap items-center gap-1">
          <legend className="sr-only">Level</legend>
          {LOG_LEVELS.map((level) => (
            <label key={level}>
              <input
                type="checkbox"
                name="level"
                value={level}
                defaultChecked={filters.level?.includes(level)}
                className="peer sr-only"
              />
              <span
                className={`inline-flex h-7 cursor-pointer items-center rounded-md border border-border px-2.5 font-mono text-xs font-medium uppercase transition-colors peer-checked:border-border-strong peer-checked:bg-surface-2 peer-focus-visible:outline-2 peer-focus-visible:outline-accent hover:bg-surface-hover ${LOG_LEVEL_CLASSES[level]}`}
              >
                {level}
              </span>
            </label>
          ))}
        </fieldset>

        <div className="flex items-center gap-2">
          {hasFilters && (
            <Link
              href={`${path}?range=${range}`}
              className="text-[13px] text-fg-muted hover:text-fg"
            >
              Clear
            </Link>
          )}
          <Button type="submit" variant="primary">
            Apply filters
          </Button>
        </div>
      </div>
    </Form>
  );
}
