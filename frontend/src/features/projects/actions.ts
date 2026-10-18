"use server";

import { refresh } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";
import { ENVIRONMENTS } from "@/features/projects/labels";
import type {
  ProjectEnvironment,
  ProjectWithApiKey,
} from "@/features/projects/types";

export type CreateProjectState = {
  error: string | null;
  name: string;
  environment: ProjectEnvironment;
  created: { projectId: string; apiKey: string } | null;
};

function readEnvironment(value: FormDataEntryValue | null) {
  return ENVIRONMENTS.find((environment) => environment === value) ?? null;
}

export async function createProject(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const name = String(formData.get("name") ?? "").trim();
  const environment = readEnvironment(formData.get("environment"));

  const entered = {
    name,
    environment: environment ?? "production",
    created: null,
  };

  if (!name) {
    return { ...entered, error: "Enter a project name." };
  }
  if (name.length > 100) {
    return { ...entered, error: "Name must be at most 100 characters." };
  }
  if (!environment) {
    return { ...entered, error: "Choose an environment." };
  }

  try {
    const { project, apiKey } = await apiFetch<ProjectWithApiKey>("/projects", {
      method: "POST",
      body: { name, environment },
    });
    refresh();
    return {
      ...entered,
      error: null,
      created: { projectId: project.id, apiKey },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { ...entered, error: error.message };
    }
    return { ...entered, error: "Could not create the project. Try again." };
  }
}
