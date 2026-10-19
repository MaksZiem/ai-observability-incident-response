export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export type Log = {
  id: string;
  projectId: string;
  service: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  traceId: string | null;
  spanId: string | null;
  requestId: string | null;
  endpoint: string | null;
  attributes: Record<string, unknown>;
  receivedAt: string;
};

export type LogPage = {
  items: Log[];
  nextCursor: string | null;
};
