import { useCallback } from "react";
import { isBefore, isAfter, parseISO } from "date-fns";
import { SensorDataResponse } from "../../types/sensorDataResponse.ts";

export function useDataFilteringByLocation() {
  return useCallback(
    (
      data: SensorDataResponse[],
      dateRange: { start: Date; end: Date } | null,
    ): SensorDataResponse[] => {
      if (!dateRange || !data.length) return [];

      return data.map((location) => ({
        ...location,
        data: location.data.filter((point) => {
          const pointDate = parseISO(point.timestamp);
          return (
            !isBefore(pointDate, dateRange.start) &&
            !isAfter(pointDate, dateRange.end)
          );
        }),
      }));
    },
    [],
  );
}
