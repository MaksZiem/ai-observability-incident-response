export type ErrorStatus = "open" | "investigating" | "resolved";

export type ErrorGroup = {
  id: string;
  projectId: string;
  fingerprint: string;
  type: string;
  message: string;
  service: string;
  endpoint: string | null;
  status: ErrorStatus;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
};

export type ErrorEvent = {
  id: string;
  projectId: string;
  groupId: string;
  service: string;
  message: string;
  stackTrace: string | null;
  timestamp: string;
  endpoint: string | null;
  traceId: string | null;
  spanId: string | null;
  requestId: string | null;
  attributes: Record<string, unknown>;
  receivedAt: string;
};
