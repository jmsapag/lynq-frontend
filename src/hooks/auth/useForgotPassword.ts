import { useState } from "react";
import { axiosClient } from "../../services/axiosClient.ts";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosClient.post("/auth/forgot-password", { email });
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