import { useState } from "react";
import { axiosClient } from "../services/axiosClient";
import { CreateSensorDto } from "../types/CreateSensorDto";

function useCreateDevice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDevice = async (deviceData: CreateSensorDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.post("/devices", deviceData);
      return response.data;
    } catch (err) {
      setError("Error creating device");
      console.error("Error creating device:", err);
    } finally {
      setLoading(false);
    }
  };

  return { createDevice, loading, error };
}

export default useCreateDevice; 