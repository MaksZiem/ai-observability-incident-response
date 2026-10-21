import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ApiKeySettings } from "@/features/projects/components/api-key-settings";
import { DeleteProjectForm } from "@/features/projects/components/delete-project-form";
import { ProjectSettingsForm } from "@/features/projects/components/project-settings-form";
import { getProject } from "@/features/projects/queries";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = {
  title: "Settings",
};

type SettingsSectionProps = {
  title: string;
  description: string;
  tone?: "default" | "danger";
  children: ReactNode;
};

function SettingsSection({
  title,
  description,
  tone = "default",
  children,
}: SettingsSectionProps) {
  return (
    <section
      className={`flex flex-col gap-4 rounded-xl border bg-surface p-[18px] ${
        tone === "danger" ? "border-danger/30" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-[13px] text-fg-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default async function SettingsPage({
  params,
}: PageProps<"/projects/[projectId]/settings">) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  return (
    <div>
      <PageHeader title="Settings" description={project.name} />

      <div className="flex max-w-[720px] flex-col gap-6 p-6">
        <SettingsSection
          title="Project"
          description="The name and environment shown across the dashboard."
        >
          <ProjectSettingsForm project={project} />
        </SettingsSection>

        <SettingsSection
          title="API key"
          description="Telemetry is accepted only with this key in the x-api-key header."
        >
          <ApiKeySettings
            projectId={project.id}
            apiKeyPrefix={project.apiKeyPrefix}
          />
        </SettingsSection>

        <SettingsSection
          title="Account"
          description="Change the password you use to sign in."
        >
          <ChangePasswordForm />
        </SettingsSection>

        <SettingsSection
          title="Danger zone"
          description="Actions here cannot be undone."
          tone="danger"
        >
          <DeleteProjectForm project={project} />
        </SettingsSection>
      </div>
    </div>
  );
}
