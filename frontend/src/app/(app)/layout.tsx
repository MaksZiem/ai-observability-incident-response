import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import type { User } from "@/features/auth/types";
import { listProjects } from "@/features/projects/queries";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  const [user, projects] = await Promise.all([
    apiFetch<User>("/auth/me"),
    listProjects(),
  ]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar user={user} projects={projects} />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
