import { useEffect, useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface Device {
  id: number;
  serial_number: string;
  provider: string;
  position: string;
  created_at: string;
  location_id: number;
  active: boolean;
}

export function useDevices(page: number = 1, limit: number = 15) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosPrivate
      .get("/devices/accessible", {
        params: { page: String(page), limit: String(limit) },
      })
      .then((res) => {
        const grouped = res.data.data || {};
        const flat: Device[] = Object.entries(grouped).flatMap(
          ([location, arr]) =>
            Array.isArray(arr) ? arr.map((d: any) => ({ ...d, location })) : [],
        );
        setDevices(flat);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [page, limit]);

  return { devices, loading, error };
}
