import { useState } from "react";
import { axiosClient } from "../services/axiosClient";
import { UpdateSensorDto } from "../types/UpdateSensorDto";

function useUpdateDevice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDevice = async (id: number, locationId: number, updateData: UpdateSensorDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.put(`/devices/${id}`, {
        location_id: locationId,
        ...updateData,
      });
      return response.data;
    } catch (err) {
      setError("Error updating device");
      console.error("Error updating device:", err);
    } finally {
      setLoading(false);
    }
  };

  return { updateDevice, loading, error };
}

export default useUpdateDevice; 