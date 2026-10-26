import { describe, expect, it } from "vitest";
import { decodeParam } from "@/lib/url";

describe("decodeParam", () => {
  it("decodes an encoded route segment", () => {
    expect(decodeParam("payment%20service")).toBe("payment service");
  });

  it("returns the input when it is not valid percent-encoding", () => {
    expect(decodeParam("100%")).toBe("100%");
  });
});
