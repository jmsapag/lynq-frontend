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
  | "percentage-change";

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
  };
  chartData: {
    categories: string[];
    values: Array<{ in: number; out: number }>;
  };
  sensorData: any;
  sensorRecordsFormData: any;
  dateRange?: { start: Date; end: Date }; // Adding dateRange
  sensorIdsList?: string;
  getSensorDetails?: () => any[];
}
