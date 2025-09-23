import { useCallback, useEffect, useMemo, useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import {
  LocationWithOperatingHours,
  OperatingHours,
} from "../../types/location";

export function useOperatingHoursAll() {
  const [data, setData] = useState<LocationWithOperatingHours[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError(null);
    axiosPrivate
      .get("/locations/operating-hours")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setData(list);
      })
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const byId = useMemo(() => {
    const map = new Map<number, LocationWithOperatingHours>();
    for (const item of data) {
      map.set(item.id, item);
    }
    return map;
  }, [data]);

  return { list: data, byId, loading, error, refetch: fetchAll };
}

export function useSaveOperatingHours() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (
    locationId: number,
    payload: OperatingHours,
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await axiosPrivate.post(
        `/locations/${locationId}/operating-hours`,
        payload,
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { save, loading, error };
}
