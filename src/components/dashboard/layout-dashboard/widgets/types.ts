import React from "react";

export type DashboardWidgetType =
  | "total-in"
  | "total-out"
  | "entry-rate"
  | "people-flow-chart"
  | "traffic-heatmap"
  | "entry-rate-chart";

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
    entryRate: number;
  };
  chartData: {
    categories: string[];
    values: Array<{ in: number; out: number }>;
  };
  sensorData: any;
  sensorRecordsFormData: any;
}
