import { formatCount } from "@/lib/format";
import { TELEMETRY_LABELS } from "@/features/platform/labels";
import type {
  IngestCounters,
  PlatformStats,
  TelemetryType,
} from "@/features/platform/types";

const COLUMNS =
  "grid grid-cols-[minmax(110px,1fr)_repeat(6,88px)] items-center gap-3 px-4";

type Column = {
  key: keyof IngestCounters;
  label: string;
  problem?: "warning" | "danger";
};

const NUMBER_COLUMNS: Column[] = [
  { key: "requests", label: "Requests" },
  { key: "items", label: "Accepted" },
  { key: "stored", label: "Stored" },
  { key: "rejected", label: "Rejected", problem: "warning" },
  { key: "failed", label: "Failed", problem: "danger" },
  { key: "deadLettered", label: "Dead-lettered", problem: "danger" },
];

const PROBLEM_CLASSES = {
  warning: "text-warning",
  danger: "text-danger",
};

type IngestTableProps = {
  ingest: PlatformStats["ingest"];
};

function valueClass(column: Column, value: number) {
  if (!column.problem) return "";
  return value > 0 ? PROBLEM_CLASSES[column.problem] : "text-fg-muted";
}

export function IngestTable({ ingest }: IngestTableProps) {
  const types = Object.keys(ingest) as TelemetryType[];

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <div className="min-w-[720px] text-[13px]">
        <div
          className={`${COLUMNS} border-b border-border py-2 text-xs font-medium text-fg-muted`}
        >
          <span>Telemetry</span>
          {NUMBER_COLUMNS.map((column) => (
            <span key={column.key} className="text-right">
              {column.label}
            </span>
          ))}
        </div>
        <ul>
          {types.map((type) => {
            const counters = ingest[type];

            return (
              <li
                key={type}
                className={`${COLUMNS} border-b border-border py-2.5 last:border-b-0`}
              >
                <span>{TELEMETRY_LABELS[type]}</span>
                {NUMBER_COLUMNS.map((column) => (
                  <span
                    key={column.key}
                    className={`text-right font-mono tabular-nums ${valueClass(column, counters[column.key])}`}
                  >
                    {formatCount(counters[column.key])}
                  </span>
                ))}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
