import { format, parseISO } from "date-fns";
import {
  SensorDataPoint,
  TransformedSensorData,
} from "../../types/sensorDataResponse.ts";
import { useCallback } from "react";

function useTransformData() {
  return useCallback((data: SensorDataPoint[]): TransformedSensorData => {
    const timestamps = data.map((point) => {
      const date = parseISO(point.timestamp.replace("Z", ""));
      return format(date, "MMM dd, HH:mm"); // Format for display
    });

    const inValues = data.map((point) => point.total_count_in);
    const outValues = data.map((point) => point.total_count_out);
    
    // Handle optional FootfallCam metrics - these might not be present in all data points
    const returningCustomers = data.map((point) => point.returningCustomer ?? 0);
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
  }, []);
}

export { useTransformData };
