export type AnalysisStatus = "pending" | "completed" | "failed";

export type Confidence = "low" | "medium" | "high";

export type AnalysisResult = {
  summary: string;
  observedFacts: { statement: string; evidence: string }[];
  hypotheses: { cause: string; confidence: Confidence; reasoning: string }[];
  relatedDeployments: string[];
  suggestedInvestigation: string[];
};

export type IncidentAnalysis = {
  id: string;
  incidentId: string;
  requestedById: string;
  status: AnalysisStatus;
  model: string | null;
  result: AnalysisResult | null;
  error: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: string;
  completedAt: string | null;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  incidentId: string;
  role: ChatRole;
  content: string;
  authorId: string | null;
  model: string | null;
  createdAt: string;
};
