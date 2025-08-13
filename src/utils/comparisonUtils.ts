import { format } from "date-fns";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ComparisonPeriods {
  current: DateRange;
  previous: DateRange;
}

export interface MetricComparison {
  current: number;
  previous: number;
  delta: number;
  deltaPercentage: number;
  trend: "up" | "down" | "stable";
}

/**
 * Calculate the equivalent previous period for comparison
 * Based on the current period duration
 */
export const calculateComparisonPeriods = (currentPeriod: DateRange): ComparisonPeriods => {
  const currentStart = new Date(currentPeriod.start);
  const currentEnd = new Date(currentPeriod.end);
  
  // Calculate the duration of the current period in milliseconds
  const durationMs = currentEnd.getTime() - currentStart.getTime();
  
  // Calculate previous period by going back the same duration
  const previousEnd = new Date(currentStart.getTime() - 1); // End just before current starts
  previousEnd.setHours(23, 59, 59, 999);
  
  const previousStart = new Date(previousEnd.getTime() - durationMs + 1); // Same duration as current
  previousStart.setHours(0, 0, 0, 0);
  
  return {
    current: currentPeriod,
    previous: {
      start: previousStart,
      end: previousEnd
    }
  };
};

/**
 * Calculate comparison metrics between current and previous values
 */
export const calculateMetricComparison = (current: number, previous: number): MetricComparison => {
  const delta = current - previous;
  let deltaPercentage = 0;
  let trend: "up" | "down" | "stable" = "stable";
  
  if (previous !== 0) {
    deltaPercentage = (delta / previous) * 100;
  } else if (current > 0) {
    deltaPercentage = 100; // If previous was 0 and current > 0, it's 100% increase
  }
  
  if (delta > 0) {
    trend = "up";
  } else if (delta < 0) {
    trend = "down";
  } else {
    trend = "stable";
  }
  
  return {
    current,
    previous,
    delta,
    deltaPercentage: Math.round(deltaPercentage * 100) / 100, // Round to 2 decimal places
    trend
  };
};

/**
 * Format comparison delta for display
 */
export const formatDeltaDisplay = (comparison: MetricComparison): {
  deltaText: string;
  percentageText: string;
  isPositive: boolean;
} => {
  const { delta, deltaPercentage, trend } = comparison;
  const isPositive = trend === "up";
  const sign = isPositive ? "+" : "";
  
  return {
    deltaText: `${sign}${delta.toLocaleString()}`,
    percentageText: `${sign}${deltaPercentage.toFixed(1)}%`,
    isPositive
  };
};

/**
 * Get period label for display (e.g., "vs. Previous 7 days")
 */
export const getComparisonPeriodLabel = (previousPeriod: DateRange): string => {
  const start = previousPeriod.start;
  const end = previousPeriod.end;
  
  // Calculate days difference
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 1) {
    return format(start, "MMM d"); // e.g., "Dec 15"
  } else if (daysDiff <= 31) {
    return `Previous ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
  } else {
    // For longer periods, show date range
    return `${format(start, "MMM d")} - ${format(end, "MMM d")}`;
  }
};

/**
 * Check if metric supports comparison (some metrics might not be suitable)
 */
export const isMetricComparable = (metricType: string): boolean => {
  // Most metrics are comparable except for dates and percentages that are already derived
  const nonComparableMetrics = ['mostCrowdedDay', 'leastCrowdedDay'];
  return !nonComparableMetrics.includes(metricType);
};