import { useCallback } from "react";
import {
  GroupByTimeAmount,
  SensorDataResponse,
  TransformedSensorDataByLocation,
} from "../../types/sensorDataResponse.ts";

export function useDataProcessingByLocation(
  timeSeriesAggregator: (
    data: SensorDataResponse[],
    timeAmount: GroupByTimeAmount,
  ) => SensorDataResponse[],
  transformData: (
    data: SensorDataResponse[],
  ) => TransformedSensorDataByLocation[],
) {
  return useCallback(
    (
      filteredData: SensorDataResponse[],
      groupBy: GroupByTimeAmount,
    ): TransformedSensorDataByLocation[] => {
      const groupedData = timeSeriesAggregator(filteredData, groupBy);
      return transformData(groupedData);
    },
    [timeSeriesAggregator, transformData],
  );
}
