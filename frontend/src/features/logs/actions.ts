"use server";

import { listLogs, type LogsFilter } from "@/features/logs/queries";

export async function loadMoreLogs(
  projectId: string,
  filter: LogsFilter,
  cursor: string,
) {
  return listLogs(projectId, { ...filter, cursor });
}
