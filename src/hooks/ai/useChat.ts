import { useState, useCallback } from "react";
// import { axiosAI } from "../../services/axiosClient"; // Disabled for demo mode
import { OrchestrationResponse } from "../../types/ai";

export type ChatState = "idle" | "loading" | "ready" | "error";

export function useChat() {
  const [data, setData] = useState<OrchestrationResponse | null>(null);
  const [state, setState] = useState<ChatState>("idle");
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim()) return;

    try {
      setState("loading");
      setError(null);

      // DEMO MODE: Return mocked orchestrator response with 4 cards
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay

      const mockedResponse: OrchestrationResponse = {
        requestId: `demo-chat-${Date.now()}`,
        status: "complete",
        result: {
          type: "cards",
          cards: [
            {
              title: "Entradas Totales",
              description: "Total de personas que ingresaron al local",
              value: "8,488",
              change: -13.9,
            },
            {
              title: "Entradas Promedio Diarias",
              description: "Promedio de entradas por día",
              value: "1,214",
              change: -13.8,
            },
            {
              title: "Afluencia",
              description: "Tasa de conversión de tráfico exterior",
              value: "11.96%",
              change: -1.6,
            },
            {
              title: "Tasa de Retorno",
              description: "Porcentaje de clientes que regresan",
              value: "14.87%",
              change: -2.3,
            },
          ],
        },
        execution: {
          totalDuration: 1500,
          agentsInvoked: ["DataAgent", "MetricsAgent", "CardAgent"],
          errors: [],
        },
        timestamp: new Date().toISOString(),
      };

      setData(mockedResponse);
      setState("ready");

      /* ORIGINAL CODE - Commented out for demo mode
      const enhancedQuery = `${query.trim()}. Please provide the response in card format with metrics.`;

      const response = await axiosAI.post<OrchestrationResponse>(
        "/agents/orchestration/execute-query",
        {
          query: enhancedQuery,
        },
      );

      setData(response.data);
      setState("ready");
      */
    } catch (err: any) {
      setState("error");
      console.error("Chat error:", err);

      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError(
          "La consulta está tardando más de lo esperado. Por favor, intenta de nuevo.",
        );
      } else if (err.response?.status === 400) {
        setError(
          "Error en la consulta. Por favor, intenta con una pregunta diferente.",
        );
      } else if (err.response?.status === 404) {
        setError("No se pudo procesar la consulta en este momento.");
      } else if (err.response?.status >= 500) {
        setError("Error del servidor. Por favor, intenta más tarde.");
      } else {
        setError("Error al procesar la consulta. Por favor, intenta de nuevo.");
      }
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setState("idle");
    setError(null);
  }, []);

  // Helper getters
  const loading = state === "loading";
  const hasError = state === "error";
  const isReady = state === "ready" && !!data;

  return {
    // Data
    data,

    // State
    state,
    loading,
    hasError,
    isReady,
    error,

    // Actions
    sendMessage,
    reset,
  };
}
