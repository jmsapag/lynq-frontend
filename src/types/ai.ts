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
