import { describe, expect, it } from "vitest";
import {
  EMPTY_ALERT_VALUES,
  validateAlertForm,
  type AlertFormValues,
} from "@/features/alerts/form";

function values(overrides: Partial<AlertFormValues>): AlertFormValues {
  return {
    ...EMPTY_ALERT_VALUES,
    name: "Payment errors",
    threshold: "5",
    ...overrides,
  };
}

describe("validateAlertForm", () => {
  it("converts an error-rate percentage to a ratio", () => {
    const { payload } = validateAlertForm(values({ metric: "error_rate" }));

    expect(payload?.threshold).toBe(0.05);
  });

  it("keeps latency thresholds in milliseconds", () => {
    const { payload } = validateAlertForm(
      values({ metric: "p95_latency", threshold: "1000" }),
    );

    expect(payload?.threshold).toBe(1000);
  });

  it("omits empty optional fields", () => {
    const { payload } = validateAlertForm(values({}));

    expect(payload).toMatchObject({
      service: undefined,
      webhookUrl: undefined,
    });
  });

  it.each([
    [{ name: "" }, "Name the alert."],
    [{ metric: "cpu" }, "Choose a metric, condition and severity."],
    [{ threshold: "" }, "The threshold must be a number of 0 or more."],
    [{ threshold: "-1" }, "The threshold must be a number of 0 or more."],
    [{ threshold: "abc" }, "The threshold must be a number of 0 or more."],
    [{ windowMinutes: "0" }, "The window must be 1 to 1440 whole minutes."],
    [{ windowMinutes: "1441" }, "The window must be 1 to 1440 whole minutes."],
    [{ windowMinutes: "2.5" }, "The window must be 1 to 1440 whole minutes."],
  ])("rejects %o", (overrides, error) => {
    expect(validateAlertForm(values(overrides))).toEqual({
      payload: null,
      error,
    });
  });
});
