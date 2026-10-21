import { ConfirmForm } from "@/components/ui/confirm-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { deleteProject } from "@/features/projects/actions";
import type { Project } from "@/features/projects/types";

type DeleteProjectFormProps = {
  project: Project;
};

export function DeleteProjectForm({ project }: DeleteProjectFormProps) {
  return (
    <ConfirmForm
      action={deleteProject.bind(null, project.id)}
      message={`Delete “${project.name}” and all of its telemetry, incidents and alerts? This cannot be undone.`}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-[13px] text-fg-muted">
        Deletes the project with all logs, traces, errors, incidents and alerts.
      </p>
      <SubmitButton variant="danger" pendingLabel="Deleting…">
        Delete project
      </SubmitButton>
    </ConfirmForm>
  );
}
