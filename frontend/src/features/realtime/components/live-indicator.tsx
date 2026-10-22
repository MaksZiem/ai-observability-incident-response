import type { StreamStatus } from "@/features/realtime/types";

const STATUS_STYLE: Record<StreamStatus, { label: string; dot: string }> = {
  connecting: { label: "Connecting…", dot: "border border-fg-muted" },
  live: { label: "Live", dot: "bg-success" },
  offline: { label: "Reconnecting…", dot: "bg-warning" },
};

type LiveIndicatorProps = {
  status: StreamStatus;
};

export function LiveIndicator({ status }: LiveIndicatorProps) {
  const { label, dot } = STATUS_STYLE[status];

  return (
    <p
      role="status"
      className="flex items-center gap-1.5 text-xs text-fg-muted"
      title="Pages refresh automatically when new telemetry arrives."
    >
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </p>
  );
}
