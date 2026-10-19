"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { addIncidentNote, type NoteState } from "@/features/incidents/actions";

const INITIAL_STATE: NoteState = { error: null, body: "" };

type AddNoteFormProps = {
  projectId: string;
  incidentId: string;
};

export function AddNoteForm({ projectId, incidentId }: AddNoteFormProps) {
  const [state, formAction] = useActionState(
    addIncidentNote.bind(null, projectId, incidentId),
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label className="sr-only" htmlFor="incident-note">
        Note
      </label>
      <Textarea
        id="incident-note"
        name="body"
        rows={3}
        maxLength={10000}
        placeholder="What did you check or change?"
        defaultValue={state.body}
        required
      />
      <div className="flex items-center justify-between gap-3">
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
        <SubmitButton pendingLabel="Saving…">Add note</SubmitButton>
      </div>
    </form>
  );
}
