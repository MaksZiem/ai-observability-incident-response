import { redirect } from "next/navigation";
import { listProjects } from "@/features/projects/queries";

export default async function HomePage() {
  const [latest] = await listProjects();

  redirect(latest ? `/projects/${latest.id}` : "/projects/new");
}
