export type Deployment = {
  id: string;
  projectId: string;
  version: string;
  service: string | null;
  commitSha: string | null;
  description: string | null;
  deployedAt: string;
  createdAt: string;
};
