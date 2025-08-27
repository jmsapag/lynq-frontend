// Report layout specific types
export interface ReportWidget {
  id: string;
  type: ReportWidgetType;
  title: string;
  category: "metric" | "chart";
  enabled: boolean;
  order: number;
}

export type ReportWidgetType = 
  | "total-in"
  | "total-out" 
  | "entry-rate"
  | "daily-average-in"
  | "daily-average-out"
  | "most-crowded-day"
  | "least-crowded-day"
  | "percentage-change"
  | "people-flow-chart"
  | "traffic-heatmap"
  | "entry-rate-chart"
  | "cumulative-people-chart"
  | "returning-customers"
  | "avg-visit-duration"
  | "affluence"
  | "returning-customers-chart"
  | "avg-visit-duration-chart"
  | "affluence-chart";

export interface ReportDropZone {
  id: string;
  type: "metric" | "chart" | "any";
  className?: string;
  title?: string;
}

export interface ReportLayoutSection {
  id: string;
  className: string;
  zones: ReportDropZone[];
}

export interface ReportLayoutConfig {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  sections: ReportLayoutSection[];
  widgetPlacements: Record<string, ReportWidgetType | null>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
}

export interface ReportWidgetPlacements {
  [zoneId: string]: ReportWidgetType | null;
}

// Interface for saving/loading report layouts
export interface ReportLayoutStorage {
  layouts: Record<string, ReportLayoutConfig>;
  currentLayoutId: string | null;
  lastUpdated: string;
}

// Configuration that combines layout + report config
export interface ReportConfiguration {
  layout: ReportLayoutConfig;
  widgetPlacements: ReportWidgetPlacements;
}
