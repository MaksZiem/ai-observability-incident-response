"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { requestAnalysis } from "@/features/analysis/actions";

type RequestAnalysisButtonProps = {
  projectId: string;
  incidentId: string;
  disabled: boolean;
  label: string;
};

export function RequestAnalysisButton({
  projectId,
  incidentId,
  disabled,
  label,
}: RequestAnalysisButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="primary"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(() => requestAnalysis(projectId, incidentId))
      }
    >
      {pending ? "Requesting…" : label}
    </Button>
  );
}
