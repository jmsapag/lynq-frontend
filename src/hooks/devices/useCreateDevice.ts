import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface CreateDeviceInput {
  serial_number: string;
  provider: string;
  position: string;
  location_id: number;
}

export function useCreateDevice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDevice = async (input: CreateDeviceInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosPrivate.post("/devices", input);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createDevice, loading, error };
}
