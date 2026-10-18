type StatTone = "default" | "warning" | "danger" | "critical";

const TONE_CLASSES: Record<StatTone, string> = {
  default: "text-fg",
  warning: "text-warning",
  danger: "text-danger",
  critical: "text-critical",
};

type StatCardProps = {
  label: string;
  value: string;
  tone?: StatTone;
};

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface px-3 py-2.5">
      <span className="text-xs text-fg-muted">{label}</span>
      <span
        className={`font-mono text-2xl font-medium tabular-nums ${TONE_CLASSES[tone]}`}
      >
        {value}
      </span>
    </div>
  );
}
