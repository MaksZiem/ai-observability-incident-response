export type ProjectEnvironment = "development" | "staging" | "production";

export type Project = {
  id: string;
  name: string;
  environment: ProjectEnvironment;
  apiKeyPrefix: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectWithApiKey = {
  project: Project;
  apiKey: string;
};
