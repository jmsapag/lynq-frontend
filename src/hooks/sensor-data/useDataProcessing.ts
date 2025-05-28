import { useCallback } from "react";
import {
  GroupByTimeAmount,
  SensorDataPoint,
  TransformedSensorData,
} from "../../types/sensorDataResponse.ts";

export function useDataProcessing(
  timeSeriesAggregator: (
    data: SensorDataPoint[],
    timeAmount: GroupByTimeAmount,
  ) => SensorDataPoint[],
  transformData: (data: SensorDataPoint[]) => TransformedSensorData,
) {
  return useCallback(
    (
      filteredData: SensorDataPoint[],
      groupBy: GroupByTimeAmount,
    ): TransformedSensorData => {
      const groupedData = timeSeriesAggregator(filteredData, groupBy);
      return transformData(groupedData);
    },
    [timeSeriesAggregator, transformData],
  );
}
