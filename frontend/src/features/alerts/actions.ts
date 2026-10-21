"use server";

import { refresh } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";
import {
  EMPTY_ALERT_VALUES,
  readAlertForm,
  validateAlertForm,
  type AlertFormValues,
} from "@/features/alerts/form";
import type { AlertRule } from "@/features/alerts/types";

export type CreateAlertState = {
  error: string | null;
  values: AlertFormValues;
  createdName: string | null;
};

function alertsPath(projectId: string) {
  return `/projects/${projectId}/alerts`;
}

export async function createAlertRule(
  projectId: string,
  _prevState: CreateAlertState,
  formData: FormData,
): Promise<CreateAlertState> {
  const values = readAlertForm(formData);
  const { payload, error } = validateAlertForm(values);

  if (!payload) return { error, values, createdName: null };

  try {
    await apiFetch<AlertRule>(alertsPath(projectId), {
      method: "POST",
      body: payload,
    });
  } catch (apiError) {
    return {
      error:
        apiError instanceof ApiError && apiError.status === 400
          ? apiError.message
          : "Could not create the alert. Try again.",
      values,
      createdName: null,
    };
  }

  refresh();
  return { error: null, values: EMPTY_ALERT_VALUES, createdName: payload.name };
}

export async function setAlertRuleEnabled(
  projectId: string,
  ruleId: string,
  enabled: boolean,
) {
  await apiFetch<AlertRule>(`${alertsPath(projectId)}/${ruleId}`, {
    method: "PATCH",
    body: { enabled },
  });
  refresh();
}

export async function evaluateAlertRule(projectId: string, ruleId: string) {
  await apiFetch<AlertRule>(`${alertsPath(projectId)}/${ruleId}/evaluate`, {
    method: "POST",
  });
  refresh();
}

export async function deleteAlertRule(projectId: string, ruleId: string) {
  await apiFetch(`${alertsPath(projectId)}/${ruleId}`, { method: "DELETE" });
  refresh();
}
