import { Check, X } from "lucide-react";

export type StatusTone =
  "neutral" | "accent" | "success" | "warning" | "danger" | "critical";

export type StatusIndicator = "dot" | "hollow" | "pulse" | "check" | "cross";

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "border-fg-muted/30 bg-fg-muted/10 text-fg-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
  critical: "border-critical/30 bg-critical/10 text-critical",
};

type StatusBadgeProps = {
  tone: StatusTone;
  indicator: StatusIndicator;
  label: string;
};

function Indicator({ indicator }: { indicator: StatusIndicator }) {
  if (indicator === "check") {
    return <Check className="size-3" strokeWidth={2.5} aria-hidden />;
  }
  if (indicator === "cross") {
    return <X className="size-3" strokeWidth={2.5} aria-hidden />;
  }
  if (indicator === "hollow") {
    return (
      <span
        className="size-1.5 rounded-full border border-current"
        aria-hidden
      />
    );
  }
  return (
    <span
      className={`size-1.5 rounded-full bg-current ${
        indicator === "pulse" ? "animate-pulse motion-reduce:animate-none" : ""
      }`}
      aria-hidden
    />
  );
}

export function StatusBadge({ tone, indicator, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      <Indicator indicator={indicator} />
      {label}
    </span>
  );
}
