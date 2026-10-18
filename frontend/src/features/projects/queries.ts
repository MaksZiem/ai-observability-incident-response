import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { Project } from "@/features/projects/types";

export function listProjects() {
  return apiFetch<Project[]>("/projects");
}

export async function getProject(id: string) {
  try {
    return await apiFetch<Project>(`/projects/${id}`);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 400)
    ) {
      notFound();
    }
    throw error;
  }
}
