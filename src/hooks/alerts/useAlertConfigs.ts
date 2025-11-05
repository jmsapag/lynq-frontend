import { useState, useEffect, useCallback } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import { AlertConfig } from "../../types/alert-config";

export function useAlertConfigs(locationId?: number) {
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    if (!locationId) {
      setConfigs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axiosPrivate.get<AlertConfig[]>(
        `/alerts/configurations/location/${locationId}`,
      );
      console.log("Alerts configurations: ", response);
      if (Array.isArray(response.data)) {
        setConfigs(response.data);
      } else {
        setConfigs([]);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch alert configurations",
      );
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const deleteConfig = async (configId: number) => {
    try {
      await axiosPrivate.delete(`/alerts/configurations/${configId}`);
      setConfigs((prev) => prev.filter((c) => c.id !== configId));
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to delete alert configuration",
      );
      // Re-throw the error to be caught in the component
      throw err;
    }
  };

  return {
    configs,
    loading,
    error,
    refetch: fetchConfigs,
    deleteConfig,
  };
}
