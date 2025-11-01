import { ReportWidgetType } from "../../types/reportLayout";
import {
  createWidgetConfig,
  type WidgetFactoryParams,
} from "../dashboard/layout-dashboard/widgets";

interface ReportWidgetInfo {
  id: string;
  type: ReportWidgetType;
  title: string;
  category: "metric" | "chart";
  component: React.ReactNode;
}

/**
 * Factory function to create report widgets based on existing dashboard widgets
 * This reuses the dashboard widget system to maintain consistency
 */
export const createReportWidgets = (
  params: WidgetFactoryParams,
): ReportWidgetInfo[] => {
  // Get all dashboard widgets (now includes all metrics and charts)
  const dashboardWidgets = createWidgetConfig(params);

  // Map dashboard widgets to report widgets
  const reportWidgets: ReportWidgetInfo[] = dashboardWidgets.map((widget) => ({
    id: `report-${widget.id}`,
    type: widget.type as ReportWidgetType,
    title: widget.title,
    category: widget.category,
    component: widget.component,
  }));

  return reportWidgets;
};

/**
 * Get widget information without requiring full params (for UI purposes)
 */
export const getReportWidgetMeta = (): Array<{
  id: string;
  type: ReportWidgetType;
  title: string;
  category: "metric" | "chart";
  description: string;
}> => {
  return [
    // Metric widgets
    {
      id: "report-total-in",
      type: "total-in",
      title: "Total Entries",
      category: "metric",
      description: "Total number of people entering during the selected period",
    },
    {
      id: "report-total-out",
      type: "total-out",
      title: "Total Exits",
      category: "metric",
      description: "Total number of people exiting during the selected period",
    },
    {
      id: "report-entry-rate",
      type: "entry-rate",
      title: "Entry Rate",
      category: "metric",
      description: "Percentage ratio of entries to total traffic",
    },
    {
      id: "report-daily-average-in",
      type: "daily-average-in",
      title: "Daily Average Entries",
      category: "metric",
      description: "Average number of entries per day",
    },
    {
      id: "report-daily-average-out",
      type: "daily-average-out",
      title: "Daily Average Exits",
      category: "metric",
      description: "Average number of exits per day",
    },
    {
      id: "report-most-crowded-day",
      type: "most-crowded-day",
      title: "Most Crowded Day",
      category: "metric",
      description: "Day with highest traffic during the period",
    },
    {
      id: "report-least-crowded-day",
      type: "least-crowded-day",
      title: "Least Crowded Day",
      category: "metric",
      description: "Day with lowest traffic during the period",
    },
    {
      id: "report-percentage-change",
      type: "percentage-change",
      title: "Period Change",
      category: "metric",
      description: "Percentage change compared to previous period",
    },
    {
      id: "report-returning-customers",
      type: "returning-customers",
      title: "Returning Customers",
      category: "metric",
      description: "Number of returning customers (FootfallCam data)",
    },
    {
      id: "report-affluence",
      type: "affluence",
      title: "Affluence Rate",
      category: "metric",
      description: "Affluence percentage (FootfallCam data)",
    },

    // Chart widgets
    {
      id: "report-people-flow-chart",
      type: "people-flow-chart",
      title: "People Flow Chart",
      category: "chart",
      description: "Line chart showing entries and exits over time",
    },
    {
      id: "report-traffic-heatmap",
      type: "traffic-heatmap",
      title: "Traffic Heatmap",
      category: "chart",
      description: "Heatmap showing traffic patterns by day and hour",
    },
    {
      id: "report-entry-rate-chart",
      type: "entry-rate-chart",
      title: "Entry Rate Chart",
      category: "chart",
      description: "Chart showing entry rate trends over time",
    },
    {
      id: "report-cumulative-people-chart",
      type: "cumulative-people-chart",
      title: "Cumulative Entries Chart",
      category: "chart",
      description: "Cumulative entries with daily reset",
    },
    {
      id: "report-returning-customers-chart",
      type: "returning-customers-chart",
      title: "Returning Customers Chart",
      category: "chart",
      description: "Chart showing returning customer trends (FootfallCam)",
    },
    {
      id: "report-affluence-chart",
      type: "affluence-chart",
      title: "Affluence Chart",
      category: "chart",
      description: "Chart showing affluence trends over time (FootfallCam)",
    },
  ];
};
