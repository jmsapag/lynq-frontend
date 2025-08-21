import { useCallback } from "react";
import { axiosPrivate } from "../../services/axiosClient";
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
        const response = await axiosPrivate.get<SensorDataResponse[]>(
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
        const mergedMap = new Map<string, SensorDataPoint>();

        response.data.forEach((location) => {
          (location.data || []).forEach((point) => {
            if (mergedMap.has(point.timestamp)) {
              const existing = mergedMap.get(point.timestamp)!;
              mergedMap.set(point.timestamp, {
                timestamp: point.timestamp,
                total_count_in: existing.total_count_in + point.total_count_in,
                total_count_out:
                  existing.total_count_out + point.total_count_out,
                outsideTraffic:
                  (existing.outsideTraffic || 0) + (point.outsideTraffic || 0),
                avgVisitDuration:
                  (existing.avgVisitDuration || 0) +
                  (point.avgVisitDuration || 0),
                returningCustomer:
                  (existing.returningCustomer || 0) +
                  (point.returningCustomer || 0),
              });
            } else {
              mergedMap.set(point.timestamp, { ...point });
            }
          });
        });

        const data = Array.from(mergedMap.values()).sort((a, b) =>
          a.timestamp.localeCompare(b.timestamp),
        );
        const missingPoints: SensorDataPoint[] = [];
        for (let i = 1; i < data.length; i++) {
          const prevData = data[i - 1];
          let prevDate = new Date(prevData.timestamp).getTime();
          const currentData = data[i];
          while (
            prevDate + 5 * 60 * 1000 <
            new Date(currentData.timestamp).getTime()
          ) {
            prevDate += 5 * 60 * 1000;
            missingPoints.push({
              timestamp: new Date(prevDate).toISOString(),
              total_count_in: 0, // or some default value
              total_count_out: 0, // or some default value
            });
          }
        }

        // Fill from last data point to now if needed
        if (data.length > 0) {
          const lastData = data[data.length - 1];
          let lastDate = new Date(lastData.timestamp).getTime();
          const now = Date.now();

          while (lastDate + 5 * 60 * 1000 < now) {
            lastDate += 5 * 60 * 1000;
            missingPoints.push({
              timestamp: new Date(lastDate).toISOString(),
              total_count_in: 0,
              total_count_out: 0,
            });
          }
        }
        // Combine the original data with the missing points
        return [...data, ...missingPoints].sort((a, b) =>
          a.timestamp.localeCompare(b.timestamp),
        );
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        return [];
      }
    },
    [],
  );
}
