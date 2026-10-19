import { LOG_LEVEL_CLASSES } from "@/features/logs/labels";
import type { LogLevel as Level } from "@/features/logs/types";

type LogLevelProps = {
  level: Level;
};

export function LogLevel({ level }: LogLevelProps) {
  return (
    <span
      className={`font-mono text-xs font-medium uppercase ${LOG_LEVEL_CLASSES[level]}`}
    >
      {level}
    </span>
  );
}
