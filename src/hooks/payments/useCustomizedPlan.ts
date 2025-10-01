import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

interface CustomizedPlanRequest {
  company: string;
  contactEmail: string;
  message?: string;
}

interface UseCustomizedPlanReturn {
  submitRequest: (data: CustomizedPlanRequest) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  reset: () => void;
}

export const useCustomizedPlan = (): UseCustomizedPlanReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = async (data: CustomizedPlanRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      await axiosPrivate.post("/subscriptions/customize", data);

      setIsSuccess(true);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Error al enviar la solicitud. Inténtalo de nuevo.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
  };

  return {
    submitRequest,
    isLoading,
    isSuccess,
    error,
    reset,
  };
};
