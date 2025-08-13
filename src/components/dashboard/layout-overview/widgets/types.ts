// src/components/dashboard/layout-overview/widgets/types.ts
import { type MetricComparison } from "../../../../utils/comparisonUtils";

export type OverviewWidgetType =
  | "total-in"
  | "total-out"
  | "entry-rate"
  | "daily-average-in"
  | "daily-average-out"
  | "most-crowded-day"
  | "least-crowded-day"
  | "percentage-change";

export interface OverviewWidgetConfig {
  id: string;
  type: OverviewWidgetType;
  title: string;
  translationKey: string;
  descriptionTranslationKey: string;
  category: "metric";
  // Props for SensorDataCard
  value: string | number;
  unit: string;
  data: Record<string, any>;
  comparison?: MetricComparison;
  comparisonPeriod?: { start: Date; end: Date };
}

export interface OverviewWidgetFactoryParams {
  metrics: {
    totalIn: number;
    totalOut: number;
    dailyAverageIn: number;
    dailyAverageOut: number;
    mostCrowdedDay: { date: Date; value: number } | null;
    leastCrowdedDay: { date: Date; value: number } | null;
    entryRate: number;
    percentageChange: number;
  };
  dateRange: { start: Date; end: Date };
  sensorIdsList: string;
  getSensorDetails: () => any[];
  comparisons?: {
    totalIn?: MetricComparison;
    totalOut?: MetricComparison;
    entryRate?: MetricComparison;
    dailyAverageIn?: MetricComparison;
    dailyAverageOut?: MetricComparison;
  };
  comparisonPeriod?: { start: Date; end: Date };
}
