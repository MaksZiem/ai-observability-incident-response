import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { AlertRuleList } from "@/features/alerts/components/alert-rule-list";
import { CreateAlertForm } from "@/features/alerts/components/create-alert-form";
import { listAlertRules } from "@/features/alerts/queries";
import { getProject } from "@/features/projects/queries";

export const metadata: Metadata = {
  title: "Alerts",
};

export default async function AlertsPage({
  params,
}: PageProps<"/projects/[projectId]/alerts">) {
  const { projectId } = await params;

  await getProject(projectId);
  const rules = await listAlertRules(projectId);

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Rules are checked every minute. A firing rule can open an incident or call a webhook."
      />

      <div className="grid items-start gap-6 p-6 lg:grid-cols-[1fr_360px]">
        {rules.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No alert rules yet"
            description="Create one to be told when error rate, latency or traffic crosses a threshold."
          />
        ) : (
          <AlertRuleList projectId={projectId} rules={rules} />
        )}

        <section className="rounded-xl border border-border bg-surface p-[18px]">
          <h2 className="mb-4 text-base font-semibold">New alert</h2>
          <CreateAlertForm projectId={projectId} />
        </section>
      </div>
    </div>
  );
}
