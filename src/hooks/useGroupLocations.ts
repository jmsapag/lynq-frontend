import { useMemo } from "react";
import {
  TransformedSensorData,
  TransformedSensorDataByLocation,
} from "../types/sensorDataResponse";

export function useGroupLocations(
  locationData: TransformedSensorDataByLocation[],
): TransformedSensorData {
  return useMemo(() => {
    if (locationData.length === 0) {
      return {
        timestamps: [],
        in: [],
        out: [],
        returningCustomers: [],
        avgVisitDuration: [],
        outsideTraffic: [],
        affluence: [],
      };
    }

    // Use the first location's timestamps as the base (they should all be the same)
    const timestamps = locationData[0]?.data.timestamps || [];

    // Aggregate data across all locations
    const aggregatedData: TransformedSensorData = {
      timestamps: [...timestamps],
      in: [],
      out: [],
      returningCustomers: [],
      avgVisitDuration: [],
      outsideTraffic: [],
      affluence: [],
    };

    // For each timestamp index, sum values across all locations
    for (let i = 0; i < timestamps.length; i++) {
      let totalIn = 0;
      let totalOut = 0;
      let totalReturningCustomers = 0;
      let totalOutsideTraffic = 0;
      let sumAvgVisitDuration = 0;
      let validLocationsForAvg = 0;

      // Aggregate values from all locations for this timestamp
      locationData.forEach((location) => {
        const data = location.data;
        if (i < data.timestamps.length) {
          totalIn += data.in[i] || 0;
          totalOut += data.out[i] || 0;
          totalReturningCustomers += data.returningCustomers[i] || 0;
          totalOutsideTraffic += data.outsideTraffic[i] || 0;

          // For average visit duration, we need to calculate the mean across locations
          if (
            data.avgVisitDuration[i] !== undefined &&
            data.avgVisitDuration[i] > 0
          ) {
            sumAvgVisitDuration += data.avgVisitDuration[i];
            validLocationsForAvg++;
          }
        }
      });

      // Calculate average visit duration across locations
      const avgVisitDuration =
        validLocationsForAvg > 0
          ? sumAvgVisitDuration / validLocationsForAvg
          : 0;

      // Calculate affluence as total in / total outside traffic
      const affluence =
        totalOutsideTraffic > 0 ? (totalIn / totalOutsideTraffic) * 100 : 0;

      aggregatedData.in.push(totalIn);
      aggregatedData.out.push(totalOut);
      aggregatedData.returningCustomers.push(totalReturningCustomers);
      aggregatedData.avgVisitDuration.push(avgVisitDuration);
      aggregatedData.outsideTraffic.push(totalOutsideTraffic);
      aggregatedData.affluence.push(affluence);
    }

    return aggregatedData;
  }, [locationData]);
}
