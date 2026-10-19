"use client";

import { useOptimistic, useTransition } from "react";
import { Select } from "@/components/ui/select";
import { updateErrorStatus } from "@/features/errors/actions";
import { ERROR_STATUS, ERROR_STATUSES } from "@/features/errors/labels";
import type { ErrorStatus } from "@/features/errors/types";

type ErrorStatusSelectProps = {
  projectId: string;
  errorId: string;
  status: ErrorStatus;
};

export function ErrorStatusSelect({
  projectId,
  errorId,
  status,
}: ErrorStatusSelectProps) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useOptimistic(status);

  function change(next: ErrorStatus) {
    startTransition(async () => {
      setSelected(next);
      await updateErrorStatus(projectId, errorId, next);
    });
  }

  return (
    <Select
      aria-label="Error status"
      value={selected}
      disabled={pending}
      onChange={(event) => change(event.target.value as ErrorStatus)}
    >
      {ERROR_STATUSES.map((option) => (
        <option key={option} value={option}>
          {ERROR_STATUS[option].label}
        </option>
      ))}
    </Select>
  );
}
