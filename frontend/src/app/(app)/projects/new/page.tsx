import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CreateProjectForm } from "@/features/projects/components/create-project-form";

export const metadata: Metadata = {
  title: "New project",
};

export default function NewProjectPage() {
  return (
    <div>
      <PageHeader
        title="New project"
        description="A project groups the services of one application in one environment."
      />
      <div className="p-6">
        <div className="max-w-[720px] rounded-xl border border-border bg-surface p-[18px]">
          <CreateProjectForm />
        </div>
      </div>
    </div>
  );
}
