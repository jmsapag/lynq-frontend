export interface AgentSummaryRequest {
  scope: string;
  from: string;
  to: string;
  locations: string[];
  resolution: string;
  userPrompt: string;
}

export interface AgentSummaryCard {
  title: string;
  value: string;
  trend: string;
}

export interface AgentSummarySeriesData {
  timestamp: string;
  actual: number;
  forecast: number;
}

export interface AgentSummarySeries {
  title: string;
  data: AgentSummarySeriesData[];
}

export interface AgentSummaryResponse {
  summary_text: string;
  cards: AgentSummaryCard[];
  series: AgentSummarySeries;
}
