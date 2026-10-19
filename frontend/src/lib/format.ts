const COMPACT = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const TIME: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

const DAY: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

export function formatCount(value: number) {
  return value < 1000 ? value.toLocaleString("en-US") : COMPACT.format(value);
}

export function formatPercent(ratio: number) {
  return `${(ratio * 100).toFixed(1)}%`;
}

export function formatLatency(ms: number | null) {
  if (ms === null) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatDayTime(iso: string) {
  const date = new Date(iso);
  return `${date.toLocaleDateString("en-GB", DAY)}, ${date.toLocaleTimeString("en-GB", TIME)}`;
}

export function formatAxisTime(iso: string, spansDays: boolean) {
  const date = new Date(iso);
  return spansDays
    ? date.toLocaleDateString("en-GB", DAY)
    : date.toLocaleTimeString("en-GB", TIME);
}

export function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    ...TIME,
    second: "2-digit",
  });
}

export function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return `${Math.max(Math.round(ms / 1000), 0)}s`;
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;

  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}
