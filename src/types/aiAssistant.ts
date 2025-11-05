export interface AIAssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AIAssistantRequest {
  query: string;
}

// Backend response structure
export interface AIAssistantResponse {
  content: {
    type: "summary" | string;
    summary: string;
    mainContent: string;
  };
  confidence: "high" | "medium" | "low";
  sources: string[];
  metadata: {
    retrievedChunks: number;
    avgScore: number;
    refiningIterations: number;
  };
}

// Backend error response structure
export interface AIAssistantError {
  statusCode: number;
  message: string;
  error: string;
}
