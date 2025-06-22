import { sensorResponse } from "../types/deviceResponse";
import { useEffect, useState } from "react";
import { axiosPrivate } from "../services/axiosClient.ts";

function useSensorData() {
  const [sensors, setSensors] = useState<sensorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchSensors = async () => {
      setError(null);
      setLoading(true);
      try {
        const response = await axiosPrivate.get("/devices/accessible", {});
        if (response.status !== 200) {
          setError("Error fetching sensors");
        }
        const data: sensorResponse[] = response.data;
        setSensors(data);
      } finally {
        setLoading(false);
      }
    };
    fetchSensors();
    return () => {
      controller.abort();
    };
  }, []);

  return {
    locations: sensors,
    loading,
    error,
  };
}

export { useSensorData };
