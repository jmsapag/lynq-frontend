import { useState, useCallback } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import type {
  AgentSummaryRequest,
  AgentSummaryResponse,
} from "../../pages/agents";

const fetchAgentSummaryExplanation = async (
  request: AgentSummaryRequest,
): Promise<AgentSummaryResponse> => {
  const response = await axiosPrivate.post("/agents/summary/explain", request);
  return response.data;
};

export type AgentSummaryState = "idle" | "loading" | "ready" | "error";

// Custom hook for agent summary explanation
export function useAgentSummary() {
  const [data, setData] = useState<AgentSummaryResponse | null>(null);
  const [state, setState] = useState<AgentSummaryState>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (request: AgentSummaryRequest) => {
    try {
      setState("loading");
      setError(null);

      const response = await fetchAgentSummaryExplanation(request);
      setData(response);
      setState("ready");
    } catch (err: any) {
      setState("error");
      console.error("Agent summary error:", err);

      // Enhanced error handling
      if (err.response?.status === 400) {
        setError(
          "Error en los parámetros de solicitud. Verifica la configuración.",
        );
      } else if (err.response?.status === 404) {
        setError("No se encontraron datos para generar el resumen.");
      } else if (err.response?.status >= 500) {
        setError("Error del servidor. Por favor, intenta más tarde.");
      } else {
        setError("Error al procesar el resumen. Por favor, intenta de nuevo.");
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
    fetchSummary,
    reset,
  };
}
