import { useState, useEffect } from "react";
import { axiosPrivate } from "../../services/axiosClient.ts";

export interface Business {
  id: number;
  name: string;
  address: string;
  created_at: string;
}

export function useBusinesses(page: number, limit: number) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosPrivate
      .get("/business/list", { params: { page, limit } })
      .then((res) => {
        // Extract the array from res.data.data
        if (Array.isArray(res.data?.data)) {
          setBusinesses(res.data.data);
        } else {
          setBusinesses([]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, limit]);

  return { businesses, loading, error };
}
