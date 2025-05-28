import { useCallback } from "react";
import { isBefore, isAfter, parseISO } from "date-fns";
import { SensorDataPoint } from "../../types/sensorDataResponse.ts";

export function useDataFiltering() {
  return useCallback(
    (
      data: SensorDataPoint[],
      dateRange: { start: Date; end: Date } | null,
    ): SensorDataPoint[] => {
      if (!dateRange || !data.length) return [];

      return data.filter((point) => {
        const pointDate = parseISO(point.timestamp);
        return (
          !isBefore(pointDate, dateRange.start) &&
          !isAfter(pointDate, dateRange.end)
        );
      });
    },
    [],
  );
}
