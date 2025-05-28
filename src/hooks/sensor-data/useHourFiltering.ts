import { useCallback } from "react";
import { SensorDataPoint } from "../../types/sensorDataResponse.ts";
import { Time } from "@internationalized/date";

export const useHourFiltering = () => {
  return useCallback(
    (
      data: SensorDataPoint[],
      hourRange: { start: Time; end: Time },
    ): SensorDataPoint[] => {
      if (!data.length || !hourRange) return [];

      return data.filter((point) => {
        const hours = new Date(point.timestamp).getHours();
        const seconds = new Date(point.timestamp).getSeconds();
        return (
          (hours > hourRange.start.hour ||
            (hours === hourRange.start.hour &&
              seconds >= hourRange.start.second)) &&
          (hours < hourRange.end.hour ||
            (hours === hourRange.end.hour && seconds <= hourRange.end.second))
        );
      });
    },
    [],
  );
};
