import { COMPARATOR_KEYS, METRIC_KEYS } from "@/features/alerts/labels";
import type { AlertComparator, AlertMetric } from "@/features/alerts/types";
import { INCIDENT_SEVERITIES } from "@/features/incidents/labels";
import type { IncidentSeverity } from "@/features/incidents/types";

const MAX_WINDOW_MINUTES = 1440;

export type AlertFormValues = {
  name: string;
  metric: string;
  comparator: string;
  threshold: string;
  windowMinutes: string;
  service: string;
  createIncident: boolean;
  incidentSeverity: string;
  webhookUrl: string;
};

export type AlertPayload = {
  name: string;
  metric: AlertMetric;
  comparator: AlertComparator;
  threshold: number;
  windowMinutes: number;
  service?: string;
  createIncident: boolean;
  incidentSeverity: IncidentSeverity;
  webhookUrl?: string;
};

export const EMPTY_ALERT_VALUES: AlertFormValues = {
  name: "",
  metric: "error_rate",
  comparator: "gt",
  threshold: "",
  windowMinutes: "5",
  service: "",
  createIncident: true,
  incidentSeverity: "high",
  webhookUrl: "",
};

export function readAlertForm(formData: FormData): AlertFormValues {
  const read = (key: string) => String(formData.get(key) ?? "").trim();

  return {
    name: read("name"),
    metric: read("metric"),
    comparator: read("comparator"),
    threshold: read("threshold"),
    windowMinutes: read("windowMinutes"),
    service: read("service"),
    createIncident: formData.get("createIncident") === "on",
    incidentSeverity: read("incidentSeverity"),
    webhookUrl: read("webhookUrl"),
  };
}

export function validateAlertForm(
  values: AlertFormValues,
): { payload: AlertPayload; error: null } | { payload: null; error: string } {
  const metric = METRIC_KEYS.find((key) => key === values.metric);
  const comparator = COMPARATOR_KEYS.find((key) => key === values.comparator);
  const severity = INCIDENT_SEVERITIES.find(
    (key) => key === values.incidentSeverity,
  );
  const threshold = Number(values.threshold);
  const windowMinutes = Number(values.windowMinutes);

  if (!values.name) return { payload: null, error: "Name the alert." };
  if (!metric || !comparator || !severity) {
    return {
      payload: null,
      error: "Choose a metric, condition and severity.",
    };
  }
  if (values.threshold === "" || !Number.isFinite(threshold) || threshold < 0) {
    return {
      payload: null,
      error: "The threshold must be a number of 0 or more.",
    };
  }
  if (
    !Number.isInteger(windowMinutes) ||
    windowMinutes < 1 ||
    windowMinutes > MAX_WINDOW_MINUTES
  ) {
    return {
      payload: null,
      error: `The window must be 1 to ${MAX_WINDOW_MINUTES} whole minutes.`,
    };
  }

  return {
    error: null,
    payload: {
      name: values.name,
      metric,
      comparator,
      threshold: metric === "error_rate" ? threshold / 100 : threshold,
      windowMinutes,
      service: values.service || undefined,
      createIncident: values.createIncident,
      incidentSeverity: severity,
      webhookUrl: values.webhookUrl || undefined,
    },
  };
}
