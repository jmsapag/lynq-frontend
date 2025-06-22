import { useEffect, useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface Location {
  id: number;
  name: string;
}

export function useLocations(businessId?: number) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setLocations([]);
      return;
    }
    setLoading(true);
    setError(null);

    axiosPrivate
      .get(`/business/${businessId}/locations`)
      .then((res) => {
        setLocations(res.data.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [businessId]);

  return { locations, loading, error };
}
