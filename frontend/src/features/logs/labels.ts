import type { LogLevel } from "@/features/logs/types";

export const LOG_LEVEL_CLASSES: Record<LogLevel, string> = {
  debug: "text-fg-subtle",
  info: "text-fg-muted",
  warn: "text-warning",
  error: "text-danger",
  fatal: "text-critical",
};

export const LOG_LEVELS = Object.keys(LOG_LEVEL_CLASSES) as LogLevel[];
