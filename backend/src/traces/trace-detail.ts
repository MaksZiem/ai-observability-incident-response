import { Span, SpanStatus } from './entities/span.entity.js';

export interface TraceDetail {
  traceId: string;
  rootSpan: Span | null;
  startTime: Date;
  durationMs: number;
  spanCount: number;
  services: string[];
  hasError: boolean;
  spans: Span[];
}

export function buildTraceDetail(traceId: string, spans: Span[]): TraceDetail {
  const start = Math.min(...spans.map((span) => span.startTime.getTime()));
  const end = Math.max(
    ...spans.map((span) => span.startTime.getTime() + span.durationMs),
  );

  return {
    traceId,
    rootSpan: spans.find((span) => span.parentSpanId === null) ?? null,
    startTime: new Date(start),
    durationMs: end - start,
    spanCount: spans.length,
    services: [...new Set(spans.map((span) => span.service))],
    hasError: spans.some((span) => span.status === SpanStatus.ERROR),
    spans,
  };
}
