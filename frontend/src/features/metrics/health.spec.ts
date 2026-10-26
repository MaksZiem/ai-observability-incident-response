import { describe, expect, it } from "vitest";
import { getServiceStatus } from "@/features/metrics/health";
import { parseTimeRange } from "@/features/metrics/time-range";
import type { RequestStats } from "@/features/metrics/types";

function stats(overrides: Partial<RequestStats>): RequestStats {
  return {
    requests: 100,
    errors: 0,
    errorRate: 0,
    p95LatencyMs: 200,
    ...overrides,
  };
}

describe("getServiceStatus", () => {
  it("is healthy below every threshold", () => {
    expect(getServiceStatus(stats({}))).toBe("healthy");
  });

  it("is degraded from a 2% error rate", () => {
    expect(getServiceStatus(stats({ errorRate: 0.02 }))).toBe("degraded");
  });

  it("is degraded when P95 latency reaches one second", () => {
    expect(getServiceStatus(stats({ p95LatencyMs: 1000 }))).toBe("degraded");
  });

  it("is critical from a 25% error rate", () => {
    expect(getServiceStatus(stats({ errorRate: 0.25 }))).toBe("critical");
  });
});

describe("parseTimeRange", () => {
  it("accepts a known range", () => {
    expect(parseTimeRange("24h")).toBe("24h");
  });

  it("falls back to the last hour for anything else", () => {
    expect(parseTimeRange(undefined)).toBe("1h");
    expect(parseTimeRange("30d")).toBe("1h");
    expect(parseTimeRange(["7d", "24h"])).toBe("1h");
  });
});
