export type SpanStatus = "ok" | "error";

export type SpanKind = "server" | "client" | "internal";

export type Span = {
  id: string;
  projectId: string;
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  service: string;
  name: string;
  kind: SpanKind;
  status: SpanStatus;
  startTime: string;
  durationMs: number;
  attributes: Record<string, unknown>;
  receivedAt: string;
};

export type TraceDetail = {
  traceId: string;
  rootSpan: Span | null;
  startTime: string;
  durationMs: number;
  spanCount: number;
  services: string[];
  hasError: boolean;
  spans: Span[];
};
