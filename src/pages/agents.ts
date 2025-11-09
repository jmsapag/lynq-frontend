export interface AgentSummaryRequest {
  scope: string;
  from: string;
  to: string;
  locations: string[];
  resolution: string;
  userPrompt: string;
}

export interface AgentSummaryResult {
  type: "summary";
  title: string;
  content: string;
  keyPoints: string[];
  confidence: "high" | "medium" | "low";
  sources?: string[];
}

export interface AgentSummaryResponse {
  requestId: string;
  status: "success" | "error" | "partial";
  result: AgentSummaryResult;
  execution: {
    totalDuration: number;
    agentsInvoked: string[];
  };
  timestamp: string; // ISO 8601
}
