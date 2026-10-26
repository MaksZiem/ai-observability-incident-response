import { describe, expect, it } from "vitest";
import { logsHref, readLogFilters } from "@/features/logs/filters";

describe("readLogFilters", () => {
  it("drops empty and whitespace-only text filters", () => {
    expect(
      readLogFilters({ service: "  ", endpoint: "", traceId: undefined }),
    ).toEqual({
      level: undefined,
      service: undefined,
      endpoint: undefined,
      traceId: undefined,
      requestId: undefined,
    });
  });

  it("trims text filters and keeps the first value of a repeated one", () => {
    expect(readLogFilters({ service: [" api ", "worker"] }).service).toBe(
      "api",
    );
  });

  it("reads levels from repeated checkboxes", () => {
    expect(readLogFilters({ level: ["error", "fatal"] }).level).toEqual([
      "error",
      "fatal",
    ]);
  });

  it("reads levels from a comma-separated link", () => {
    expect(readLogFilters({ level: "warn,error" }).level).toEqual([
      "warn",
      "error",
    ]);
  });

  it("ignores unknown levels", () => {
    expect(readLogFilters({ level: "error,verbose" }).level).toEqual(["error"]);
    expect(readLogFilters({ level: "verbose" }).level).toBeUndefined();
  });
});

describe("logsHref", () => {
  it("links to plain logs without filters", () => {
    expect(logsHref("p1", {})).toBe("/projects/p1/logs");
  });

  it("encodes filters into the query string", () => {
    expect(
      logsHref("p1", { traceId: "abc 123", level: ["error", "fatal"] }),
    ).toBe("/projects/p1/logs?traceId=abc+123&level=error%2Cfatal");
  });

  it("round-trips through readLogFilters", () => {
    const href = logsHref("p1", { service: "api", level: ["warn"] });
    const params = Object.fromEntries(new URL(href, "http://x").searchParams);

    expect(readLogFilters(params)).toMatchObject({
      service: "api",
      level: ["warn"],
    });
  });
});
