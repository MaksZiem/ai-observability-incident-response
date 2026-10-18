export type TimeRange = "15m" | "1h" | "24h" | "7d";

export type RequestStats = {
  requests: number;
  errors: number;
  errorRate: number;
  p95LatencyMs: number | null;
};

export type SeriesPoint = RequestStats & {
  bucket: string;
};

export type Overview = {
  from: string;
  to: string;
  stepMs: number;
  summary: RequestStats;
  series: SeriesPoint[];
};

export type ServiceStatus = "healthy" | "degraded" | "critical";

export type ServiceHealth = RequestStats & {
  service: string;
  status: ServiceStatus;
};
