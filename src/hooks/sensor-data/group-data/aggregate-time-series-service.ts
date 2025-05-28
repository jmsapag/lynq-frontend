import {
  AggregationType,
  GroupByTimeAmount,
  SensorDataPoint,
} from "../../../types/sensorDataResponse.ts";
import { parseISO } from "date-fns";
import { useCallback } from "react";
import { timeGroupingStrategies } from "./index.ts";

// Strategy interface
export interface TimeGroupingStrategy {
  getGroupKey(date: Date): string;
}

const aggregateTimeSeries = (
  data: SensorDataPoint[],
  timeAmount: GroupByTimeAmount,
  aggregationType: "sum" | "avg" | "min" | "max",
): SensorDataPoint[] => {
  if (data.length === 0) return [];

  const groupedData = new Map<
    string,
    { total_in: number; total_out: number; count: number }
  >();

  
  data.forEach((point) => {
    const date = parseISO(point.timestamp);
    const strategy: TimeGroupingStrategy = timeGroupingStrategies[timeAmount]!;
    const groupKey = strategy.getGroupKey(date);

    if (!groupedData.has(groupKey)) {
      groupedData.set(groupKey, { total_in: 0, total_out: 0, count: 0 });
    }

    const group = groupedData.get(groupKey)!;
    group.total_in += point.total_count_in;
    group.total_out += point.total_count_out;
    group.count += 1;
  });

  // Convert the grouped data back to SensorDataPoint[]
  return Array.from(groupedData.entries())
    .map(([timestamp, values]) => {
      let total_in = values.total_in;
      let total_out = values.total_out;

      // Apply aggregation
      if (aggregationType === "avg" && values.count > 0) {
        total_in = total_in / values.count;
        total_out = total_out / values.count;
      } else if (aggregationType === "min" || aggregationType === "max") {
        // For min/max, we'd need the original data points, not just sums
        // This is a simplified implementation
        total_in = total_in / values.count;
        total_out = total_out / values.count;
      }
      // For 'sum' and 'none', we use the total as is

      return {
        timestamp,
        total_count_in: total_in,
        total_count_out: total_out,
      };
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};

export {aggregateTimeSeries}