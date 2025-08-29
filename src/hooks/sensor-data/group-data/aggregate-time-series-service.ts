import {
  GroupByTimeAmount,
  SensorDataPoint,
} from "../../../types/sensorDataResponse.ts";
import { parseISO } from "date-fns";
import { timeGroupingStrategies } from "./index.ts";

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
    {
      total_in: number;
      total_out: number;
      outsideTraffic: number;
      avgVisitDuration: number;
      returningCustomer: number;
      returningCustomerWeightedSum: number;
      returningCustomerTotalWeight: number;
      count: number;
      visitDurationSum: number;
      visitDurationCount: number;
    }
  >();

  data.forEach((point, index) => {
    // Parse the ISO timestamp directly (keeping the Z if present) to properly handle UTC time
    const date = parseISO(point.timestamp);
    const strategy: TimeGroupingStrategy = timeGroupingStrategies[timeAmount]!;
    const groupKey = strategy.getGroupKey(date);

    if (!groupedData.has(groupKey)) {
      groupedData.set(groupKey, {
        total_in: 0,
        total_out: 0,
        outsideTraffic: 0,
        avgVisitDuration: 0,
        returningCustomer: 0,
        returningCustomerWeightedSum: 0,
        returningCustomerTotalWeight: 0,
        count: 0,
        visitDurationSum: 0,
        visitDurationCount: 0,
      });
    }

    const group = groupedData.get(groupKey)!;
    group.total_in += point.total_count_in;
    group.total_out += point.total_count_out;

    // Handle optional FootfallCam metrics - only add if they exist
    if (point.outsideTraffic !== undefined && point.outsideTraffic !== null) {
      group.outsideTraffic += point.outsideTraffic;
    }

    // Handle returning customer with validation logic
    const previousPoint = index > 0 ? data[index - 1] : null;
    const isValidReturning = isValidReturningCustomerValue(
      point.returningCustomer,
      previousPoint?.returningCustomer,
      index,
    );

    if (isValidReturning && point.returningCustomer !== null) {
      // Use weighted aggregation for percentages
      group.returningCustomerWeightedSum +=
        point.returningCustomer * point.total_count_in;
      group.returningCustomerTotalWeight += point.total_count_in;
    }

    // Handle avgVisitDuration aggregation - only if value exists and is > 0
    if (
      point.avgVisitDuration !== undefined &&
      point.avgVisitDuration !== null &&
      point.avgVisitDuration > 0
    ) {
      group.visitDurationSum += point.avgVisitDuration;
      group.visitDurationCount += 1;
    }

    group.count += 1;
  });

  // Convert the grouped data back to SensorDataPoint[]
  return Array.from(groupedData.entries())
    .map(([timestamp, values]) => {
      let total_in = values.total_in;
      let total_out = values.total_out;
      let outsideTraffic = values.outsideTraffic;
      let returningCustomer =
        values.returningCustomerTotalWeight > 0
          ? values.returningCustomerWeightedSum /
            values.returningCustomerTotalWeight
          : 0;
      let avgVisitDuration =
        values.visitDurationCount > 0
          ? values.visitDurationSum / values.visitDurationCount
          : 0;

      // Apply aggregation (returning customer already calculated as weighted average)
      if (aggregationType === "avg" && values.count > 0) {
        total_in = total_in / values.count;
        total_out = total_out / values.count;
        outsideTraffic = outsideTraffic / values.count;
        // returningCustomer already calculated as weighted average above
      } else if (aggregationType === "min" || aggregationType === "max") {
        // For min/max, we'd need the original data points, not just sums
        // This is a simplified implementation
        total_in = total_in / values.count;
        total_out = total_out / values.count;
        outsideTraffic = outsideTraffic / values.count;
        // returningCustomer already calculated as weighted average above
      }
      // For 'sum' and 'none', we use the total as is

      return {
        timestamp: timestamp.replace("Z", ""), // Remove 'Z' for consistency
        total_count_in: total_in,
        total_count_out: total_out,
        outsideTraffic,
        avgVisitDuration,
        returningCustomer,
      };
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};

export { aggregateTimeSeries };
