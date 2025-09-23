import { format, parseISO } from "date-fns";
import {
  SensorDataResponse,
  TransformedSensorDataByLocation,
  SensorDataPoint,
  TransformedSensorData,
} from "../../types/sensorDataResponse.ts";
import { useCallback } from "react";

// Helper function to validate returning customer values
function isValidReturningCustomerValue(
  currentValue: number | null | undefined,
  previousValue: number | null | undefined,
  index: number,
): boolean {
  // Handle null/undefined as invalid
  if (currentValue == null) return false;

  // First element: 0 is valid (no previous to compare)
  if (index === 0) return true;

  // If current is 0 and previous was also 0 → valid (consecutive zeros)
  if (currentValue === 0 && previousValue === 0) return true;

  // If current is 0 and previous was non-zero → invalid (sudden drop)
  if (currentValue === 0 && previousValue != null && previousValue !== 0)
    return false;

  // Non-zero values are always valid
  return true;
}

function transformSingleLocationData(
  data: SensorDataPoint[],
): TransformedSensorData {
  const timestamps = data.map((point) => {
    const date = parseISO(point.timestamp.replace("Z", ""));
    return format(date, "MMM dd, HH:mm"); // Format for display
  });

  const inValues = data.map((point) => point.total_count_in);
  const outValues = data.map((point) => point.total_count_out);

  // Handle optional FootfallCam metrics with validation logic
  const returningCustomers = data.map((point, index) => {
    const currentValue = point.returningCustomer ?? null;
    const previousValue =
      index > 0 ? (data[index - 1].returningCustomer ?? null) : null;

    return isValidReturningCustomerValue(currentValue, previousValue, index)
      ? (currentValue ?? 0)
      : 0; // Invalid values become 0 for display purposes
  });
  const avgVisitDuration = data.map((point) => point.avgVisitDuration ?? 0);
  const outsideTraffic = data.map((point) => point.outsideTraffic ?? 0);

  // Calculate affluence as in/outsideTraffic - only when outsideTraffic > 0
  const affluence = data.map((point) => {
    const traffic = point.outsideTraffic ?? 0;
    return traffic > 0 ? (point.total_count_in / traffic) * 100 : 0;
  });

  return {
    timestamps,
    in: inValues,
    out: outValues,
    returningCustomers,
    avgVisitDuration,
    outsideTraffic,
    affluence,
  };
}

function useTransformDataByLocation() {
  return useCallback(
    (data: SensorDataResponse[]): TransformedSensorDataByLocation[] => {
      return data.map((location) => ({
        locationId: location.location_id,
        locationName: location.location_name,
        data: transformSingleLocationData(location.data),
      }));
    },
    [],
  );
}

export { useTransformDataByLocation };
