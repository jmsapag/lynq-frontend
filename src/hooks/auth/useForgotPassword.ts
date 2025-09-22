import { useState } from "react";
import { axiosClient } from "../../services/axiosClient.ts";
import { useLanguage } from "../useLanguage";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCurrentLanguage } = useLanguage();

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const currentLanguage = getCurrentLanguage();
      const payload = {
        email,
        language: currentLanguage,
      };

      await axiosClient.post("/auth/forgot-password", payload);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send recovery email");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading, error };
}
