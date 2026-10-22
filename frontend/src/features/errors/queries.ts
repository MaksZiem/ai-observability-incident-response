import { cache } from "react";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type {
  ErrorEvent,
  ErrorGroup,
  ErrorStatus,
} from "@/features/errors/types";

type ErrorGroupsFilter = {
  status?: ErrorStatus;
  service?: string;
  limit?: number;
};

export function listErrorGroups(projectId: string, filter: ErrorGroupsFilter) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined) query.set(key, String(value));
  }
  return apiFetch<ErrorGroup[]>(`/projects/${projectId}/errors?${query}`);
}

export const getErrorGroup = cache(
  async (projectId: string, errorId: string) => {
    try {
      return await apiFetch<ErrorGroup>(
        `/projects/${projectId}/errors/${errorId}`,
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 400)
      ) {
        notFound();
      }
      throw error;
    }
  },
);

export function listErrorEvents(projectId: string, errorId: string) {
  return apiFetch<ErrorEvent[]>(
    `/projects/${projectId}/errors/${errorId}/events`,
  );
}
