"use client";

import { useActionState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  updateProject,
  type UpdateProjectState,
} from "@/features/projects/actions";
import { ENVIRONMENT_LABELS, ENVIRONMENTS } from "@/features/projects/labels";
import type { Project } from "@/features/projects/types";

const INITIAL_STATE: UpdateProjectState = { error: null, saved: false };

type ProjectSettingsFormProps = {
  project: Project;
};

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const [state, formAction] = useActionState(
    updateProject.bind(null, project.id),
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name">
          <Input
            name="name"
            maxLength={100}
            defaultValue={project.name}
            required
          />
        </FormField>
        <FormField label="Environment">
          <Select name="environment" defaultValue={project.environment}>
            {ENVIRONMENTS.map((environment) => (
              <option key={environment} value={environment}>
                {ENVIRONMENT_LABELS[environment]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p role="status" className="text-xs text-success">
          Project saved.
        </p>
      )}

      <SubmitButton
        variant="primary"
        pendingLabel="Saving…"
        className="self-start"
      >
        Save
      </SubmitButton>
    </form>
  );
}
