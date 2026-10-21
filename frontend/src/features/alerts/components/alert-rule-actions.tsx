"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  deleteAlertRule,
  evaluateAlertRule,
  setAlertRuleEnabled,
} from "@/features/alerts/actions";

type AlertRuleActionsProps = {
  projectId: string;
  ruleId: string;
  name: string;
  enabled: boolean;
};

export function AlertRuleActions({
  projectId,
  ruleId,
  name,
  enabled,
}: AlertRuleActionsProps) {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(action);
  }

  return (
    <div className="flex flex-wrap gap-2" aria-busy={pending}>
      <Button
        disabled={pending || !enabled}
        onClick={() => run(() => evaluateAlertRule(projectId, ruleId))}
      >
        Evaluate now
      </Button>
      <Button
        disabled={pending}
        onClick={() =>
          run(() => setAlertRuleEnabled(projectId, ruleId, !enabled))
        }
      >
        {enabled ? "Pause" : "Resume"}
      </Button>
      <Button
        variant="danger"
        disabled={pending}
        onClick={() => {
          if (window.confirm(`Delete the alert “${name}”?`)) {
            run(() => deleteAlertRule(projectId, ruleId));
          }
        }}
      >
        Delete
      </Button>
    </div>
  );
}
