"use client";

import { useActionState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  createProject,
  type CreateProjectState,
} from "@/features/projects/actions";
import { ApiKeyReveal } from "@/features/projects/components/api-key-reveal";
import { ENVIRONMENT_LABELS, ENVIRONMENTS } from "@/features/projects/labels";

const INITIAL_STATE: CreateProjectState = {
  error: null,
  name: "",
  environment: "production",
  created: null,
};

export function CreateProjectForm() {
  const [state, formAction] = useActionState(createProject, INITIAL_STATE);

  if (state.created) {
    return (
      <ApiKeyReveal
        projectId={state.created.projectId}
        apiKey={state.created.apiKey}
      />
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label="Name" hint="For example: My E-commerce API.">
        <Input name="name" maxLength={100} defaultValue={state.name} required />
      </FormField>
      <FormField label="Environment">
        <Select name="environment" defaultValue={state.environment}>
          {ENVIRONMENTS.map((environment) => (
            <option key={environment} value={environment}>
              {ENVIRONMENT_LABELS[environment]}
            </option>
          ))}
        </Select>
      </FormField>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}

      <SubmitButton
        variant="primary"
        pendingLabel="Creating project…"
        className="self-start"
      >
        Create project
      </SubmitButton>
    </form>
  );
}
