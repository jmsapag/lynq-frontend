import { useCallback } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import {
  SensorDataPoint,
  SensorDataResponse,
} from "../../types/sensorDataResponse";

export function useFetchDataByLocation() {
  return useCallback(
    async (
      startDate: Date,
      endDate: Date,
      sensorIds: number[],
      setError: (error: string) => void,
    ): Promise<SensorDataResponse[]> => {
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

        // Return the data organized by location without merging
        return response.data.map((location) => ({
          ...location,
          data: fillMissingPoints(location.data || [], startDate, endDate),
        }));
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        return [];
      }
    },
    [],
  );
}

function fillMissingPoints(
  data: SensorDataPoint[],
  startDate: Date,
  endDate: Date,
): SensorDataPoint[] {
  if (data.length === 0) return [];

  const sortedData = [...data].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  );

  const missingPoints: SensorDataPoint[] = [];

  // Fill gaps between existing data points
  for (let i = 1; i < sortedData.length; i++) {
    const prevData = sortedData[i - 1];
    let prevDate = new Date(prevData.timestamp).getTime();
    const currentData = sortedData[i];
    while (
      prevDate + 5 * 60 * 1000 <
      new Date(currentData.timestamp).getTime()
    ) {
      prevDate += 5 * 60 * 1000;
      missingPoints.push({
        timestamp: new Date(prevDate).toISOString(),
        total_count_in: 0,
        total_count_out: 0,
      });
    }
  }

  // Fill from 'startDate' to first data point
  const firstData = sortedData[0];
  let firstDate = new Date(firstData.timestamp).getTime();
  while (firstDate - 5 * 60 * 1000 > startDate.getTime()) {
    firstDate -= 5 * 60 * 1000;
    missingPoints.push({
      timestamp: new Date(firstDate).toISOString(),
      total_count_in: 0,
      total_count_out: 0,
    });
  }

  // Fill from last data point to endDate if needed
  const lastData = sortedData[sortedData.length - 1];
  let lastDate = new Date(lastData.timestamp).getTime();
  const endTime = endDate.getTime();

  while (lastDate + 5 * 60 * 1000 < endTime) {
    lastDate += 5 * 60 * 1000;
    missingPoints.push({
      timestamp: new Date(lastDate).toISOString(),
      total_count_in: 0,
      total_count_out: 0,
    });
  }

  // Combine the original data with the missing points
  return [...sortedData, ...missingPoints].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  );
}
