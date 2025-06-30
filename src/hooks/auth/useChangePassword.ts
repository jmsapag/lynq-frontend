import { useState } from "react";
import { axiosClient } from "../../services/axiosClient.ts";

export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosClient.post("/auth/change-password", { token, password });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error };
} 