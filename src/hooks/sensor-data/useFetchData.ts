import { useCallback } from "react";
import { axiosClient } from "../../services/axiosClient";
import {
  SensorDataPoint,
  SensorDataResponse,
} from "../../types/sensorDataResponse";

export function useFetchData() {
  return useCallback(
    async (
      startDate: Date,
      endDate: Date,
      sensorIds: number[],
      setError: (error: string) => void,
    ): Promise<SensorDataPoint[]> => {
      try {
        // Format dates for API request if needed
        const formattedStartDate = startDate.toISOString();
        const formattedEndDate = endDate.toISOString();

        // Make API request
        const response = await axiosClient.get<SensorDataResponse[]>(
          "/devices/sensor-data",
          {
            params: {
              sensor_ids: sensorIds,
              from: formattedStartDate,
              to: formattedEndDate,
            },
            paramsSerializer: {
              indexes: null,
            },
          },
        );
        // check if there is an error in the response
        if (response.status > 400) {
          setError("Failed to fetch sensor data");
          return [];
        }

        // Return the data points from the response
        return response.data[0]?.data || [];
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        return [];
      }
    },
    [],
  );
}
