import { axiosPrivate } from "./axiosClient";
import { AIAssistantRequest, AIAssistantResponse } from "../types/aiAssistant";

/**
 * Sends a query to the AI assistant endpoint
 * @param query - The user's question or query
 * @returns The assistant's response with content, confidence, and sources
 */
export const sendAssistantQuery = async (
  query: string,
): Promise<AIAssistantResponse> => {
  const request: AIAssistantRequest = { query };
  // AI responses can take longer, so we increase the timeout to 60 seconds
  const response = await axiosPrivate.post<AIAssistantResponse>(
    "/assistant",
    request,
    {
      timeout: 60000, // 60 seconds for AI processing
    },
  );
  return response.data;
};
