"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { ENVIRONMENTS } from "@/features/projects/labels";
import type {
  Project,
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

export type UpdateProjectState = {
  error: string | null;
  saved: boolean;
};

export async function updateProject(
  projectId: string,
  _prevState: UpdateProjectState,
  formData: FormData,
): Promise<UpdateProjectState> {
  const name = String(formData.get("name") ?? "").trim();
  const environment = readEnvironment(formData.get("environment"));

  if (!name) return { error: "Enter a project name.", saved: false };
  if (name.length > 100) {
    return { error: "Name must be at most 100 characters.", saved: false };
  }
  if (!environment) return { error: "Choose an environment.", saved: false };

  try {
    await apiFetch<Project>(`/projects/${projectId}`, {
      method: "PATCH",
      body: { name, environment },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { error: error.message, saved: false };
    }
    return { error: "Could not save the project. Try again.", saved: false };
  }

  refresh();
  return { error: null, saved: true };
}

export async function rotateApiKey(projectId: string) {
  const { apiKey } = await apiFetch<ProjectWithApiKey>(
    `/projects/${projectId}/api-key/rotate`,
    { method: "POST" },
  );
  refresh();
  return apiKey;
}

export async function deleteProject(projectId: string) {
  await apiFetch(`/projects/${projectId}`, { method: "DELETE" });
  redirect("/");
}
