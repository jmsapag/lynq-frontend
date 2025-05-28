import { AggregationType, GroupByTimeAmount, SensorDataPoint } from "../../types/sensorDataResponse.ts";
import { useCallback } from "react";
import { aggregateTimeSeries } from "./group-data/aggregate-time-series-service.ts";

export function useTimeSeriesAggregator(aggregationType: AggregationType) {
  return useCallback(
    (
      data: SensorDataPoint[],
      timeAmount: GroupByTimeAmount,
    ): SensorDataPoint[] => {
      return aggregateTimeSeries(data, timeAmount, aggregationType);
    },
    [aggregationType], // Only depends on aggregationType
  );
}
