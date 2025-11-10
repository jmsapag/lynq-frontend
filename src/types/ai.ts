export type AIAnalysisType = "FORECAST" | "BACKCAST";

export interface AIAnalysisRequest {
  type: AIAnalysisType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface AIAnalysisResult {
  analysisType: AIAnalysisType;
  message: string;
  timestamp: string;
  data: AIDataPoint[];
}

export interface AIDataPoint {
  timestamp: string;
  value: number;
  predicted: boolean;
}

// Orchestration API types
export interface OrchestrationCard {
  title: string;
  description: string;
  value: string;
  change?: number;
}

export interface OrchestrationError {
  agentType: string;
  stage: string;
  code: string;
  message: string;
  timestamp: string;
  retryCount: number;
  fatal: boolean;
}

export interface OrchestrationExecution {
  totalDuration: number;
  agentsInvoked: string[];
  errors: OrchestrationError[];
}

export interface OrchestrationResult {
  type: "cards";
  cards: OrchestrationCard[];
}

export interface OrchestrationResponse {
  requestId: string;
  status: "partial" | "complete" | "error";
  result: OrchestrationResult;
  execution: OrchestrationExecution;
  timestamp: string;
}
