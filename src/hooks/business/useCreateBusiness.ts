import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient.ts";

export function useCreateBusiness() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBusiness = async (name: string, address: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosPrivate.post("/business", { name, address });
      return true;
    } catch (err: any) {
      setError(err.message || "Error creating business");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createBusiness, loading, error };
}
