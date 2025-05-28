import { format, parseISO } from "date-fns";
import {
  SensorDataPoint,
  TransformedSensorData,
} from "../../types/sensorDataResponse.ts";
import { useCallback } from "react";

function useTransformData() {
  return useCallback((data: SensorDataPoint[]): TransformedSensorData => {
    const timestamps = data.map((point) => {
      const date = parseISO(point.timestamp);
      return format(date, "MMM dd, HH:mm"); // Format for display
    });

    const inValues = data.map((point) => point.total_count_in);
    const outValues = data.map((point) => point.total_count_out);

    return {
      timestamps,
      in: inValues,
      out: outValues,
    };
  }, []);
}

export { useTransformData };
