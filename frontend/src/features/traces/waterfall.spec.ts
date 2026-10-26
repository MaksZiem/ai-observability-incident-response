import { describe, expect, it } from "vitest";
import type { Span } from "@/features/traces/types";
import { buildWaterfall, findBottleneck } from "@/features/traces/waterfall";

const START = "2026-10-18T14:00:00.000Z";

function span(
  spanId: string,
  parentSpanId: string | null,
  offsetMs: number,
  durationMs: number,
): Span {
  return {
    id: `id-${spanId}`,
    projectId: "project",
    traceId: "trace",
    spanId,
    parentSpanId,
    service: "api",
    name: spanId,
    kind: "internal",
    status: "ok",
    startTime: new Date(Date.parse(START) + offsetMs).toISOString(),
    durationMs,
    attributes: {},
    receivedAt: START,
  };
}

describe("buildWaterfall", () => {
  const spans = [
    span("db", "payment", 100, 1210),
    span("root", null, 0, 1420),
    span("auth", "root", 12, 8),
    span("payment", "root", 20, 1300),
  ];

  it("orders spans depth-first by start time", () => {
    const rows = buildWaterfall(spans, START);

    expect(rows.map((row) => [row.span.spanId, row.depth])).toEqual([
      ["root", 0],
      ["auth", 1],
      ["payment", 1],
      ["db", 2],
    ]);
  });

  it("computes the offset from the trace start", () => {
    const rows = buildWaterfall(spans, START);

    expect(rows.find((row) => row.span.spanId === "db")?.offsetMs).toBe(100);
  });

  it("subtracts child time to get self time", () => {
    const rows = buildWaterfall(spans, START);
    const selfTime = Object.fromEntries(
      rows.map((row) => [row.span.spanId, row.selfMs]),
    );

    expect(selfTime).toEqual({ root: 112, auth: 8, payment: 90, db: 1210 });
  });

  it("never reports negative self time for overlapping children", () => {
    const rows = buildWaterfall(
      [
        span("root", null, 0, 100),
        span("a", "root", 0, 80),
        span("b", "root", 0, 80),
      ],
      START,
    );

    expect(rows[0].selfMs).toBe(0);
  });

  it("keeps spans whose parent is missing at the top level", () => {
    const rows = buildWaterfall(
      [span("root", null, 0, 100), span("orphan", "lost", 10, 20)],
      START,
    );

    expect(rows.map((row) => [row.span.spanId, row.depth])).toEqual([
      ["root", 0],
      ["orphan", 0],
    ]);
  });
});

describe("findBottleneck", () => {
  it("picks the span with the most self time", () => {
    const rows = buildWaterfall(
      [span("root", null, 0, 1420), span("db", "root", 100, 1210)],
      START,
    );

    expect(findBottleneck(rows)?.span.spanId).toBe("db");
  });

  it("returns null for an empty trace", () => {
    expect(findBottleneck([])).toBeNull();
  });
});
