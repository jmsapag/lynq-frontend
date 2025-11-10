import { useState, useCallback } from "react";
// import { axiosAI } from "../../services/axiosClient"; // Disabled for demo mode
import { useAuthState } from "../auth/useAuthState";
import type {
  AgentSummaryRequest,
  AgentSummaryResponse,
} from "../../pages/agents";

const fetchAgentSummary = async (
  _request: AgentSummaryRequest, // Prefixed with _ to indicate intentionally unused
  userId: string | null,
  businessId: string | null,
): Promise<AgentSummaryResponse> => {
  if (!userId || !businessId) {
    throw new Error("User ID and Business ID are required.");
  }

  // DEMO MODE: Return mocked summary response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        requestId: `demo-${Date.now()}`,
        status: "success",
        result: {
          type: "summary",
          title:
            "Disminución Significativa en el Tráfico Peatonal y Tasa de Retorno de Clientes",
          content: `Del 3 al 10 de noviembre de 2025, las métricas de tráfico peatonal revelaron una notable disminución en el tráfico general. Las entradas totales registradas durante esta semana fueron de 8,495, lo que representa una disminución del 13.83% en comparación con el total de la semana anterior de 9,859. De manera similar, las salidas totales cayeron un 14.74%, lo que indica una reducción en la actividad de los clientes dentro de la ubicación.

Además, la tasa de retorno de clientes disminuyó del 5.00% al 4.37%, reflejando una caída del 12.46%. Esta disminución sugiere que menos clientes están regresando a la ubicación, lo que podría ser una preocupación para la continuidad del negocio y la lealtad del cliente. En general, los datos indican una tendencia a la baja tanto en el tráfico peatonal como en la retención de clientes, lo que requiere una mayor investigación y posibles ajustes estratégicos.`,
          keyPoints: [
            "Las entradas totales disminuyeron un 13.83%, señalando una reducción en el tráfico peatonal.",
            "Las salidas totales cayeron un 14.74%, indicando una disminución en la actividad de los clientes.",
            "La tasa de retorno de clientes disminuyó un 12.46%, sugiriendo problemas con la lealtad del cliente.",
            "Los datos muestran una tendencia a la baja que requiere atención estratégica.",
          ],
          confidence: "high",
          sources: [
            "Datos de sensores LYNQ",
            "Análisis de tendencias semanales",
          ],
        },
        execution: {
          totalDuration: 2500,
          agentsInvoked: ["DataAgent", "AnalysisAgent", "SummaryAgent"],
        },
        timestamp: new Date().toISOString(),
      });
    }, 2000); // Simulate 2 second delay
  });

  /* ORIGINAL CODE - Commented out for demo mode
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
  */
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
