import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface EditLocationInput {
  name: string;
  address: string;
  business_id?: number;
}

export function useEditLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editLocation = async (locationId: number, input: EditLocationInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosPrivate.put(`/locations/${locationId}`, input);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { editLocation, loading, error };
}
