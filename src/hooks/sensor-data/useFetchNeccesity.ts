import { isAfter, isBefore } from "date-fns";
import { useCallback } from "react";
import { SensorDataPoint } from "../../types/sensorDataResponse.ts";

export function useFetchNecessity() {
  return useCallback(
    (
      dateRange: { start: Date; end: Date } | null,
      fetchedDateRange: { start: Date; end: Date } | null,
      pointsInRange: SensorDataPoint[],
    ): boolean => {
      // No need to fetch if no date range or already fetched
      if (!dateRange) return false;

      // First fetch case
      if (!fetchedDateRange) {
        console.log("First fetch - no previously fetched data");
        return true;
      }

      // Check if new range extends beyond fetched range
      if (
        isBefore(dateRange.start, fetchedDateRange.start) ||
        (isAfter(dateRange.end, fetchedDateRange.end) &&
          !isAfter(dateRange.end, new Date()))
      ) {
        console.log("New range extends beyond fetched range");
        return true;
      }

      // Check if it's the same range
      const isSameRange =
        dateRange.start.getTime() === fetchedDateRange.start.getTime() &&
        dateRange.end.getTime() === fetchedDateRange.end.getTime();

      if (isSameRange) {
        // console.log(
        //   "Skipping API request - date range is the same as previously fetched",
        // );
        return false;
      }

      // Check if we have data in the requested range and it's within the fetched range
      const hasDataInRange = pointsInRange.length > 0;
      if (
        hasDataInRange &&
        !isBefore(dateRange.start, fetchedDateRange.start) &&
        !isAfter(dateRange.end, fetchedDateRange.end)
      ) {
        // console.log(
        //   "Skipping API request - data already available client-side",
        // );
        return false;
      }

      return true;
    },
    [],
  );
}
