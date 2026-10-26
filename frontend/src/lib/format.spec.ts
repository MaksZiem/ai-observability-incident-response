import { describe, expect, it } from "vitest";
import {
  formatCount,
  formatDuration,
  formatLatency,
  formatPercent,
} from "@/lib/format";

describe("formatCount", () => {
  it("keeps small numbers exact", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
  });

  it("abbreviates from a thousand up", () => {
    expect(formatCount(1500)).toBe("1.5K");
    expect(formatCount(1_240_000)).toBe("1.24M");
  });
});

describe("formatPercent", () => {
  it("turns a ratio into a percentage with one decimal", () => {
    expect(formatPercent(0)).toBe("0.0%");
    expect(formatPercent(0.028)).toBe("2.8%");
    expect(formatPercent(1)).toBe("100.0%");
  });
});

describe("formatLatency", () => {
  it("shows a dash when there is no value", () => {
    expect(formatLatency(null)).toBe("—");
  });

  it("uses milliseconds below one second", () => {
    expect(formatLatency(842.4)).toBe("842ms");
  });

  it("uses seconds from one second up", () => {
    expect(formatLatency(1420)).toBe("1.42s");
  });
});

describe("formatDuration", () => {
  it.each([
    [45_000, "45s"],
    [38 * 60_000, "38m"],
    [(2 * 60 + 14) * 60_000, "2h 14m"],
    [(3 * 24 + 4) * 60 * 60_000, "3d 4h"],
  ])("formats %i ms as %s", (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});
