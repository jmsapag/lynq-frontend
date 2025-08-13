// src/components/dashboard/layout-dashboard/layouts/index.ts
import { DashboardWidgetType } from "../widgets/types";

export interface DropZone {
  id: string;
  type: "metric" | "chart" | "any";
  className?: string;
  title?: string;
}

export interface LayoutSection {
  id: string;
  className: string;
  zones: DropZone[];
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  sections: LayoutSection[];
  widgetPlacements: Record<string, DashboardWidgetType | null>;
}

export const AVAILABLE_LAYOUTS: DashboardLayout[] = [
  {
    id: "default",
    name: "Default Layout",
    description: "Standard dashboard with metrics on top and charts below",
    isDefault: true,
    sections: [
      {
        id: "metrics-row",
        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
        zones: [
          { id: "metric-1", type: "metric", title: "Metric 1" },
          { id: "metric-2", type: "metric", title: "Metric 2" },
          { id: "metric-3", type: "metric", title: "Metric 3" },
        ],
      },
      {
        id: "charts-grid",
        className: " grid grid-rows-1 lg:grid-rows-2 xl:grid-rows-3 gap-6",
        zones: [
          { id: "chart-1", type: "chart", title: "Chart 1" },
          { id: "chart-2", type: "chart", title: "Chart 2" },
          { id: "chart-3", type: "chart", title: "Chart 3" },
        ],
      },
    ],
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
    id: "metrics-grid",
    name: "Metrics Grid",
    description: "A 4x2 grid layout dedicated to metrics.",
    sections: [
      {
        id: "metrics-grid-section",
        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        zones: [
          { id: "metric-1", type: "metric", title: "Metric 1" },
          { id: "metric-2", type: "metric", title: "Metric 2" },
          { id: "metric-3", type: "metric", title: "Metric 3" },
          { id: "metric-4", type: "metric", title: "Metric 4" },
          { id: "metric-5", type: "metric", title: "Metric 5" },
          { id: "metric-6", type: "metric", title: "Metric 6" },
          { id: "metric-7", type: "metric", title: "Metric 7" },
          { id: "metric-8", type: "metric", title: "Metric 8" },
        ],
      },
    ],
    widgetPlacements: {
      "metric-1": null,
      "metric-2": null,
      "metric-3": null,
      "metric-4": null,
      "metric-5": null,
      "metric-6": null,
      "metric-7": null,
      "metric-8": null,
    },
  },
  {
    id: "analytics-focused",
    name: "Analytics Focused",
    description: "Large charts with minimal metrics",
    sections: [
      {
        id: "single-metric",
        className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",
        zones: [
          { id: "metric-1", type: "metric", title: "Key Metric" },
          { id: "metric-2", type: "metric", title: "Secondary Metric" },
        ],
      },
      {
        id: "main-chart",
        className: "grid grid-cols-1 mb-6",
        zones: [
          {
            id: "chart-main",
            type: "chart",
            title: "Main Analytics Chart",
            className: "col-span-full",
          },
        ],
      },
      {
        id: "secondary-charts",
        className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
        zones: [
          { id: "chart-1", type: "chart", title: "Secondary Chart 1" },
          { id: "chart-2", type: "chart", title: "Secondary Chart 2" },
        ],
      },
    ],
    widgetPlacements: {
      "metric-1": "total-in",
      "metric-2": "entry-rate",
      "chart-main": "people-flow-chart",
      "chart-1": "traffic-heatmap",
      "chart-2": "entry-rate-chart",
    },
  },
  {
    id: "metrics-dashboard",
    name: "Metrics Dashboard",
    description: "Focus on key metrics with single chart",
    sections: [
      {
        id: "main-metrics",
        className: "grid grid-cols-1 md:grid-cols-4 gap-4",
        zones: [
          { id: "metric-1", type: "metric", title: "Primary" },
          { id: "metric-2", type: "metric", title: "Secondary" },
          { id: "metric-3", type: "metric", title: "Tertiary" },
          { id: "metric-4", type: "metric", title: "Additional" },
        ],
      },
      {
        id: "single-chart",
        className: "grid grid-cols-1",
        zones: [{ id: "chart-main", type: "chart", title: "Overview Chart" }],
      },
    ],
    widgetPlacements: {
      "metric-1": "total-in",
      "metric-2": "total-out",
      "metric-3": "entry-rate",
      "metric-4": null,
      "chart-main": "people-flow-chart",
    },
  },
  {
    id: "compact",
    name: "Compact View",
    description: "Essential widgets only for smaller screens",
    sections: [
      {
        id: "compact-metrics",
        className: "grid grid-cols-2 gap-3 mb-4",
        zones: [
          { id: "metric-1", type: "metric", title: "Key 1" },
          { id: "metric-2", type: "metric", title: "Key 2" },
        ],
      },
      {
        id: "compact-chart",
        className: "grid grid-cols-1",
        zones: [{ id: "chart-1", type: "chart", title: "Main Chart" }],
      },
    ],
    widgetPlacements: {
      "metric-1": "total-in",
      "metric-2": "entry-rate",
      "chart-1": "people-flow-chart",
    },
  },
  {
    id: "custom",
    name: "Custom Layout",
    description: "Your personalized layout configuration",
    sections: [
      {
        id: "custom-metrics",
        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
        zones: [
          { id: "metric-1", type: "metric", title: "Metric 1" },
          { id: "metric-2", type: "metric", title: "Metric 2" },
          { id: "metric-3", type: "metric", title: "Metric 3" },
        ],
      },
      {
        id: "custom-charts",
        className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6",
        zones: [
          { id: "chart-1", type: "chart", title: "Chart 1" },
          { id: "chart-2", type: "chart", title: "Chart 2" },
          { id: "chart-3", type: "chart", title: "Chart 3" },
        ],
      },
    ],
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
  return (
    AVAILABLE_LAYOUTS.find((layout) => layout.isDefault) || AVAILABLE_LAYOUTS[0]
  );
};

export const getDefaultOverviewLayout = (): DashboardLayout => {
  return <DashboardLayout>getLayoutById("metrics-grid");
};

export const getLayoutById = (id: string): DashboardLayout | null => {
  return AVAILABLE_LAYOUTS.find((layout) => layout.id === id) || null;
};
