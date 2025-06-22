import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient.ts";

export function useCreateRegistrationTokens() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<string[] | null>(null);

  const createTokens = async (
    count: number,
    role: "ADMIN" | "STANDARD" | "LYNQ_TEAM",
    business_id: number | null = null,
  ) => {
    setLoading(true);
    setError(null);
    setTokens(null);
    try {
      const res = await axiosPrivate.post("/registration-tokens", {
        count,
        role,
        business_id,
      });
      if (Array.isArray(res.data)) {
        setTokens(res.data);
        return res.data;
      } else {
        setError("Unexpected response from server.");
        return null;
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Error creating users.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createTokens, loading, error, tokens, setTokens };
}
