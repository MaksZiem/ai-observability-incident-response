import type { Span } from "@/features/traces/types";

export type WaterfallRow = {
  span: Span;
  depth: number;
  offsetMs: number;
  selfMs: number;
};

export function buildWaterfall(spans: Span[], traceStart: string) {
  const start = new Date(traceStart).getTime();
  const ids = new Set(spans.map((span) => span.spanId));
  const children = new Map<string | null, Span[]>();

  for (const span of spans) {
    const parent =
      span.parentSpanId && ids.has(span.parentSpanId)
        ? span.parentSpanId
        : null;
    children.set(parent, [...(children.get(parent) ?? []), span]);
  }

  const rows: WaterfallRow[] = [];

  function visit(parent: string | null, depth: number) {
    const siblings = [...(children.get(parent) ?? [])].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    for (const span of siblings) {
      const childTime = (children.get(span.spanId) ?? []).reduce(
        (total, child) => total + child.durationMs,
        0,
      );

      rows.push({
        span,
        depth,
        offsetMs: new Date(span.startTime).getTime() - start,
        selfMs: Math.max(span.durationMs - childTime, 0),
      });
      visit(span.spanId, depth + 1);
    }
  }

  visit(null, 0);
  return rows;
}

export function findBottleneck(rows: WaterfallRow[]) {
  return rows.reduce<WaterfallRow | null>(
    (slowest, row) => (!slowest || row.selfMs > slowest.selfMs ? row : slowest),
    null,
  );
}
