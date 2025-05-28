import { sensorResponse } from "../types/deviceResponse";
import { useEffect, useState } from "react";
import { axiosClient } from "../services/axiosClient.ts";

function useSensorData() {
  const id = 1;
  const [sensors, setSensors] = useState<sensorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchSensors = async (id: number) => {
      setError(null);
      setLoading(true);
      try {
        const response = await axiosClient.get("/devices", {
          params: {
            business_id: id,
          },
        });
        if (response.status !== 200) {
          setError("Error fetching sensors");
        }
        const data: sensorResponse[] = response.data;
        setSensors(data);
      } finally {
        setLoading(false);
      }
    };
    fetchSensors(id);
    return () => {
      controller.abort();
    };
  }, [id]);

  return {
    locations: sensors,
    loading,
    error,
  };
}

export { useSensorData };
