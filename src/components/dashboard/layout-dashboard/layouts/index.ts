import { DashboardWidgetType } from "../widgets/types";

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  widgetPlacements: Record<string, DashboardWidgetType | null>;
}

export const AVAILABLE_LAYOUTS: DashboardLayout[] = [
  {
    id: "default",
    name: "Default Layout",
    description: "Standard dashboard with metrics on top and charts below",
    isDefault: true,
    widgetPlacements: {
      "metric-1": "total-in",
      "metric-2": "total-out", 
      "metric-3": "entry-rate",
      "chart-1": "people-flow-chart",
      "chart-2": "traffic-heatmap",
      "chart-3": "entry-rate-chart",
    },
  },
  {
    id: "analytics-focused",
    name: "Analytics Focused",
    description: "Charts prominently displayed with minimal metrics",
    widgetPlacements: {
      "metric-1": "total-in",
      "metric-2": null,
      "metric-3": null,
      "chart-1": "people-flow-chart",
      "chart-2": "traffic-heatmap",
      "chart-3": "entry-rate-chart",
    },
  },
  {
    id: "metrics-dashboard",
    name: "Metrics Dashboard",
    description: "Focus on key metrics with single chart",
    widgetPlacements: {
      "metric-1": "total-in",
      "metric-2": "total-out", 
      "metric-3": "entry-rate",
      "chart-1": "people-flow-chart",
      "chart-2": null,
      "chart-3": null,
    },
  },
  {
    id: "compact",
    name: "Compact View",
    description: "Essential widgets only for smaller screens",
    widgetPlacements: {
      "metric-1": "total-in",
      "metric-2": "entry-rate",
      "metric-3": null,
      "chart-1": "people-flow-chart",
      "chart-2": null,
      "chart-3": null,
    },
  },
  {
    id: "custom",
    name: "Custom Layout",
    description: "Your personalized layout configuration",
    widgetPlacements: {
      "metric-1": null,
      "metric-2": null,
      "metric-3": null,
      "chart-1": null,
      "chart-2": null,
      "chart-3": null,
    },
  },
];

export const getDefaultLayout = (): DashboardLayout => {
  return AVAILABLE_LAYOUTS.find(layout => layout.isDefault) || AVAILABLE_LAYOUTS[0];
};

export const getLayoutById = (id: string): DashboardLayout | null => {
  return AVAILABLE_LAYOUTS.find(layout => layout.id === id) || null;
};
