import {
  AggregationType,
  GroupByTimeAmount,
  SensorDataResponse,
} from "../../types/sensorDataResponse.ts";
import { useCallback } from "react";
import { aggregateTimeSeries } from "./group-data/aggregate-time-series-service.ts";

export function useTimeSeriesAggregatorByLocation(
  aggregationType: AggregationType,
) {
  return useCallback(
    (
      data: SensorDataResponse[],
      timeAmount: GroupByTimeAmount,
    ): SensorDataResponse[] => {
      return data.map((location) => ({
        ...location,
        data: aggregateTimeSeries(location.data, timeAmount, aggregationType),
      }));
    },
    [aggregationType], // Only depends on aggregationType
  );
}
