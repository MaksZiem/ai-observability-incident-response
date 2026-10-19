"use server";

import { refresh } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";
import type { Deployment } from "@/features/deployments/types";

type DeploymentValues = {
  version: string;
  service: string;
  commitSha: string;
  description: string;
};

export type CreateDeploymentState = {
  error: string | null;
  values: DeploymentValues;
  createdVersion: string | null;
};

const EMPTY_VALUES: DeploymentValues = {
  version: "",
  service: "",
  commitSha: "",
  description: "",
};

const FIELDS: Record<keyof DeploymentValues, { label: string; max: number }> = {
  version: { label: "Version", max: 100 },
  service: { label: "Service", max: 100 },
  commitSha: { label: "Commit SHA", max: 64 },
  description: { label: "Description", max: 2000 },
};

function readValues(formData: FormData): DeploymentValues {
  const read = (key: keyof DeploymentValues) =>
    String(formData.get(key) ?? "").trim();

  return {
    version: read("version"),
    service: read("service"),
    commitSha: read("commitSha"),
    description: read("description"),
  };
}

function validate(values: DeploymentValues) {
  if (!values.version) return "Enter the deployed version.";

  const tooLong = (Object.keys(FIELDS) as (keyof DeploymentValues)[]).find(
    (key) => values[key].length > FIELDS[key].max,
  );
  if (!tooLong) return null;

  const { label, max } = FIELDS[tooLong];
  return `${label} must be at most ${max} characters.`;
}

export async function createDeployment(
  projectId: string,
  _prevState: CreateDeploymentState,
  formData: FormData,
): Promise<CreateDeploymentState> {
  const values = readValues(formData);
  const error = validate(values);

  if (error) return { error, values, createdVersion: null };

  try {
    const deployment = await apiFetch<Deployment>(
      `/projects/${projectId}/deployments`,
      {
        method: "POST",
        body: {
          version: values.version,
          service: values.service || undefined,
          commitSha: values.commitSha || undefined,
          description: values.description || undefined,
        },
      },
    );
    refresh();
    return {
      error: null,
      values: EMPTY_VALUES,
      createdVersion: deployment.version,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { error: error.message, values, createdVersion: null };
    }
    return {
      error: "Could not register the deployment. Try again.",
      values,
      createdVersion: null,
    };
  }
}
