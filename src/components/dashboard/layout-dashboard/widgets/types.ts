import React from "react";

export type DashboardWidgetType =
  | "total-in"
  | "total-out"
  | "entry-rate"
  | "people-flow-chart"
  | "traffic-heatmap"
  | "entry-rate-chart"
  | "cumulative-people-chart"
  | "daily-average-in"
  | "daily-average-out"
  | "most-crowded-day"
  | "least-crowded-day"
  | "percentage-change"
  | "returning-customers"
  | "avg-visit-duration"
  | "turn-in-ratio"
  | "returning-customers-chart"
  | "avg-visit-duration-chart"
  | "turn-in-ratio-donut"
  | "location-comparison-chart"
  | "top-stores-chart";

export interface WidgetConfig {
  id: string;
  type: DashboardWidgetType;
  title: string;
  translationKey?: string;
  category: "metric" | "chart";
  component: React.ReactNode;
}

export interface WidgetFactoryParams {
  metrics: {
    totalIn: number;
    totalOut: number;
    dailyAverageIn: number;
    dailyAverageOut: number;
    mostCrowdedDay: { date: Date; value: number } | null;
    leastCrowdedDay: { date: Date; value: number } | null;
    entryRate: number;
    percentageChange: number;
    returningCustomers: number;
    avgVisitDuration: number;
    // removed: affluence
  };
  chartData: {
    categories: string[];
    values: Array<{ in: number; out: number }>;
  };
  sensorData: any;
  sensorDataByLocation?: any;
  topStoresData?: import("../../../charts/top-stores-chart").TopStoresData[];
  sensorRecordsFormData: any;
  dateRange?: { start: Date; end: Date }; // Adding dateRange
  sensorIdsList?: string;
  getSensorDetails?: () => any[];
  businessId?: number;
  comparisons?: {
    totalIn?: import("../../../../utils/comparisonUtils").MetricComparison;
    totalOut?: import("../../../../utils/comparisonUtils").MetricComparison;
    entryRate?: import("../../../../utils/comparisonUtils").MetricComparison;
    dailyAverageIn?: import("../../../../utils/comparisonUtils").MetricComparison;
    dailyAverageOut?: import("../../../../utils/comparisonUtils").MetricComparison;
    returningCustomers?: import("../../../../utils/comparisonUtils").MetricComparison;
    avgVisitDuration?: import("../../../../utils/comparisonUtils").MetricComparison;
      // removed: affluence
  };
  comparisonPeriod?: { start: Date; end: Date };
}
