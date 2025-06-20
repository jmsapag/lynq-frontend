import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export function useDeleteDevice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDevice = async (id: number, locationId: number) => {
    setLoading(true);
    setError(null);
    try {
      await axiosPrivate.delete(`/devices/${id}`, {
        data: { location_id: locationId },
      });
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Delete failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteDevice, loading, error };
}
