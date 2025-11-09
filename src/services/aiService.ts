import { AIAnalysisRequest, AIAnalysisResult } from "../types/ai";

export const fetchAIAnalysis = async (
  request: AIAnalysisRequest,
): Promise<AIAnalysisResult> => {
  // This will be replaced with the actual endpoint when ready
  // const response = await axiosPrivate.post('/ai/analysis', request);
  // return response.data;

  // Mock implementation for development
  return mockAIAnalysis(request);
};

// Temporary mock function - will be removed when backend is ready
const mockAIAnalysis = (request: AIAnalysisRequest): AIAnalysisResult => {
  const isBackcast = request.type === "BACKCAST";

  // Generate sample data
  const data = [];
  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    data.push({
      timestamp: d.toISOString(),
      value: Math.floor(Math.random() * 100) + 50,
      predicted: isBackcast ? false : d > new Date(),
    });
  }

  return {
    analysisType: request.type,
    message: isBackcast
      ? "Based on historical data analysis, foot traffic peaked on weekends with 15% higher volume compared to weekdays, with highest activity between 2-4pm."
      : "Our AI predicts a 12% increase in foot traffic next week, with Saturday expected to have the highest volume.",
    timestamp: new Date().toISOString(),
    data,
  };
};
