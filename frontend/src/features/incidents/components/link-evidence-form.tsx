"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { linkEvidence, type FormState } from "@/features/incidents/actions";
import { LINK_KIND_LABELS, LINK_KINDS } from "@/features/incidents/labels";

const INITIAL_STATE: FormState = { error: null, saved: false };

type LinkEvidenceFormProps = {
  projectId: string;
  incidentId: string;
};

export function LinkEvidenceForm({
  projectId,
  incidentId,
}: LinkEvidenceFormProps) {
  const [state, formAction] = useActionState(
    linkEvidence.bind(null, projectId),
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="incidentId" value={incidentId} />
      <div className="flex flex-wrap gap-2">
        <Select name="kind" aria-label="Evidence type" defaultValue="trace">
          {LINK_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {LINK_KIND_LABELS[kind]}
            </option>
          ))}
        </Select>
        <Input
          name="targetId"
          aria-label="ID"
          placeholder="Trace ID or error, deployment, log UUID"
          maxLength={64}
          className="min-w-0 flex-1 font-mono"
          required
        />
        <SubmitButton pendingLabel="Linking…">Link</SubmitButton>
      </div>
      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
