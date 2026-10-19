"use server";

import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api";
import { ERROR_STATUSES } from "@/features/errors/labels";
import type { ErrorGroup, ErrorStatus } from "@/features/errors/types";

export async function updateErrorStatus(
  projectId: string,
  errorId: string,
  status: ErrorStatus,
) {
  if (!ERROR_STATUSES.includes(status)) {
    throw new Error(`Unknown error status: ${status}`);
  }

  await apiFetch<ErrorGroup>(`/projects/${projectId}/errors/${errorId}`, {
    method: "PATCH",
    body: { status },
  });
  refresh();
}
