import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface CreateLocationInput {
  name: string;
  address: string;
  business_id?: number;
}

export function useCreateLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLocation = async (input: CreateLocationInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosPrivate.post("/locations", input);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createLocation, loading, error };
} 