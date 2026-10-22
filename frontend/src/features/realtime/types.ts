export type ProjectEventType =
  | "logs.ingested"
  | "spans.ingested"
  | "errors.ingested"
  | "deployment.created"
  | "incident.changed"
  | "analysis.finished"
  | "alert.changed";

export type StreamStatus = "connecting" | "live" | "offline";

export type OpenCounts = {
  errors: number;
  incidents: number;
};
