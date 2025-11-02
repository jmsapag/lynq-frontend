import { useState, useEffect, useCallback } from "react";
import { axiosAI } from "../../services/axiosClient";
import { ForecastResponse, ForecastGranularity } from "../../types/forecasting";

// Enhanced types for model status
export interface ModelStatus {
  has_trained_models: boolean;
  available_granularities: number[];
  last_training: string | null;
  model_count: number;
}

export interface TrainingResponse {
  message: string;
  trained_models: number;
  granularities: number[];
  training_time: string;
}

// Service functions for API calls with extended timeouts
const checkModelStatus = async (): Promise<ModelStatus> => {
  const response = await axiosAI.get("/forecasting/status", {
    timeout: 30000, // 30 seconds for status check
  });
  return response.data;
};

const trainModels = async (): Promise<TrainingResponse> => {
  const response = await axiosAI.post(
    "/forecasting/train",
    {},
    {
      timeout: 180000, // 3 minutes for training
    },
  );
  return response.data;
};

const fetchForecastPredictions = async (
  granularity: ForecastGranularity,
  locationId?: number,
): Promise<ForecastResponse> => {
  const response = await axiosAI.get("/forecasting/predict", {
    params: {
      granularity,
      ...(locationId && { location_id: locationId }),
    },
    timeout: 120000, // 2 minutes for predictions
  });
  return response.data;
};

export type ForecastingState =
  | "initializing"
  | "checking_models"
  | "training_models"
  | "loading_predictions"
  | "ready"
  | "error";

// Custom hook for forecasting data with autonomous model management
export function useForecasting(
  granularity: ForecastGranularity,
  locationId?: number,
) {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(
    null,
  );
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [state, setState] = useState<ForecastingState>("initializing");
  const [error, setError] = useState<string | null>(null);

  // Autonomous forecasting flow
  const runForecastingFlow = useCallback(async () => {
    try {
      // Step 1: Check model status
      setState("checking_models");
      setError(null);

      const status = await checkModelStatus();
      setModelStatus(status);

      // Step 2: Determine if training is needed
      const needsTraining =
        !status.has_trained_models ||
        !status.available_granularities.includes(granularity);

      if (needsTraining) {
        // Step 3: Train models automatically (silently)
        setState("training_models");

        try {
          await trainModels();

          // Re-check status after training
          const updatedStatus = await checkModelStatus();
          setModelStatus(updatedStatus);
        } catch (trainError: any) {
          if (trainError.response?.status === 409) {
            // Training already in progress, wait and retry
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const updatedStatus = await checkModelStatus();
            setModelStatus(updatedStatus);
          } else {
            throw trainError;
          }
        }
      }

      // Step 4: Load predictions
      setState("loading_predictions");

      const predictions = await fetchForecastPredictions(
        granularity,
        locationId,
      );
      setForecastData(predictions);

      setState("ready");
    } catch (err: any) {
      setState("error");
      console.error("Forecasting flow error:", err);

      // Enhanced error handling
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError(
          "El análisis está tardando más de lo esperado. Por favor, intenta de nuevo.",
        );
      } else if (err.response?.status === 404) {
        setError(
          "No se encontraron datos suficientes para generar pronósticos.",
        );
      } else if (err.response?.status === 400) {
        setError(
          "Error en los parámetros de solicitud. Verifica la configuración.",
        );
      } else if (err.response?.status === 409) {
        setError(
          "El sistema está preparando los modelos. Por favor, espera unos minutos.",
        );
      } else if (err.response?.status >= 500) {
        setError("Error del servidor. Por favor, intenta más tarde.");
      } else {
        setError(
          "Error al procesar los pronósticos. Por favor, intenta de nuevo.",
        );
      }
    }
  }, [granularity, locationId]);

  // Auto-run the flow when dependencies change
  useEffect(() => {
    runForecastingFlow();
  }, [runForecastingFlow]);

  // Refetch function
  const refetch = useCallback(async () => {
    setForecastData(null);
    await runForecastingFlow();
  }, [runForecastingFlow]);

  // Helper getters
  const loading = state !== "ready" && state !== "error";
  const hasError = state === "error";
  const isReady = state === "ready" && !!forecastData;

  return {
    // Data
    forecastData,
    modelStatus,

    // State
    state,
    loading,
    hasError,
    isReady,
    error,

    // Actions
    refetch,
  };
}
