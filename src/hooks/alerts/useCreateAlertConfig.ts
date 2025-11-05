import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import {
  CreateAlertConfigDto,
  AlertConfig,
  UpdateAlertConfigDto,
} from "../../types/alert-config";

export const createAlertConfig = async (
  locationId: number,
  alertConfig: CreateAlertConfigDto,
): Promise<AlertConfig> => {
  const response = await axiosPrivate.post(
    `/alerts/configure/${locationId}`,
    alertConfig,
  );
  return response.data;
};

export const updateAlertConfig = async (
  configAlertId: number,
  alertConfig: UpdateAlertConfigDto,
): Promise<AlertConfig> => {
  const response = await axiosPrivate.put(
    `/alerts/configurations/${configAlertId}`,
    alertConfig,
  );
  return response.data;
};

// Hook
export function useCreateAlertConfig() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAlert = async (
    locationId: number,
    alertData: CreateAlertConfigDto,
  ): Promise<AlertConfig | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await createAlertConfig(locationId, alertData);
      return result;
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create alert configuration",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (
    configAlertId: number,
    alertData: UpdateAlertConfigDto,
  ): Promise<AlertConfig | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateAlertConfig(configAlertId, alertData);
      return result;
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update alert configuration",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createAlert,
    updateAlert,
    loading,
    error,
    clearError: () => setError(null),
  };
}
