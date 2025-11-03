import { useState, useCallback } from "react";
import { sendAssistantQuery } from "../../services/aiAssistantService";
import { AIAssistantMessage } from "../../types/aiAssistant";

export const useAIAssistant = () => {
  const [messages, setMessages] = useState<AIAssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim()) return;

    // Add user message
    const userMessage: AIAssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendAssistantQuery(query);

      // Format the response content
      // Use mainContent if available, otherwise use summary
      const content = response.content.mainContent || response.content.summary;

      // Optionally add sources if available
      let fullContent = content;
      if (response.sources && response.sources.length > 0) {
        fullContent;
      }

      // Add assistant response
      const assistantMessage: AIAssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fullContent,
        timestamp: new Date(), // Use current time since backend doesn't provide it
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("[AI Assistant Hook] Error:", err);
      console.error("[AI Assistant Hook] Error response:", err?.response?.data);

      let errorMessage = "Failed to get response";

      // Extract error message from backend error structure
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.status) {
        errorMessage = `Server error (${err.response.status})`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Add error message to chat
      const errorAssistantMessage: AIAssistantMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `I'm sorry, I couldn't process your request. ${errorMessage}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};
