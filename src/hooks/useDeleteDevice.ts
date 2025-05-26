import { useState } from "react";
import { axiosClient } from "../services/axiosClient";

function useDeleteDevice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDevice = async (id: number, locationId: number) => {
    setLoading(true);
    setError(null);
    try {
      await axiosClient.delete(`/devices/${id}`, {
        data: { location_id: locationId },
      });
    } catch (err) {
      setError("Error deleting device");
      console.error("Error deleting device:", err);
    } finally {
      setLoading(false);
    }
  };

  return { deleteDevice, loading, error };
}

export default useDeleteDevice; 