import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface SetupIntentResponse {
  clientSecret: string;
  setupIntentId: string;
}

export const usePaymentMethod = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSetupIntent = async (): Promise<SetupIntentResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.post<SetupIntentResponse>(
        "/stripe/payment-methods/setup-intent",
      );
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to create setup intent";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSetupIntent,
    loading,
    error,
  };
};
