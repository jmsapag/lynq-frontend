import { useState, useCallback } from "react";
import { axiosAI } from "../../services/axiosClient";
import { useAuthState } from "../auth/useAuthState";
import type {
  AgentSummaryRequest,
  AgentSummaryResponse,
} from "../../pages/agents";

const fetchAgentSummary = async (
  request: AgentSummaryRequest,
  userId: string | null,
  businessId: string | null,
): Promise<AgentSummaryResponse> => {
  if (!userId || !businessId) {
    throw new Error("User ID and Business ID are required.");
  }

  const newRequest = {
    query: request.userPrompt,
    context: {
      userId: Number(userId),
      businessId: Number(businessId),
      locationIds: request.locations.map(Number),
      timeRange: {
        start: request.from,
        end: request.to,
      },
    },
  };

  const response = await axiosAI.post(
    "/agents/orchestration/execute-query",
    newRequest,
  );
  return response.data;
};

export type AgentSummaryState = "idle" | "loading" | "ready" | "error";

// Custom hook for agent summary explanation
export function useAgentSummary() {
  const { userId, businessId } = useAuthState();
  const [data, setData] = useState<AgentSummaryResponse | null>(null);
  const [state, setState] = useState<AgentSummaryState>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(
    async (request: AgentSummaryRequest) => {
      try {
        setState("loading");
        setError(null);

        const response = await fetchAgentSummary(request, userId, businessId);
        setData(response);
        setState("ready");
      } catch (err: any) {
        setState("error");
        console.error("Agent summary error:", err);

        // Enhanced error handling
        if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
          setError(
            "El análisis está tardando más de lo esperado. Por favor, intenta de nuevo.",
          );
        } else if (err.response?.status === 400) {
          setError(
            "Error en los parámetros de solicitud. Verifica la configuración.",
          );
        } else if (err.response?.status === 404) {
          setError("No se encontraron datos para generar el resumen.");
        } else if (err.response?.status >= 500) {
          setError("Error del servidor. Por favor, intenta más tarde.");
        } else {
          setError(
            "Error al procesar el resumen. Por favor, intenta de nuevo.",
          );
        }
      }
    },
    [userId, businessId],
  );

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
