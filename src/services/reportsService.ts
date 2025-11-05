import { axiosPrivate } from "./axiosClient";
import {
  ReportConfig,
  ReportsResponse,
  ReportLayoutConfiguration,
  ReportEntry,
} from "../types/reports";

// Fetch list of saved report layout configurations
export const getReports = async (): Promise<ReportsResponse> => {
  const res = await axiosPrivate.get(`/report-config`);

  // Backend returns a single config object with nested layouts
  // Transform it into the expected ReportsResponse format
  if (res.data && res.data.config) {
    const config = res.data.config;
    const reports: ReportEntry[] = [];

    // Extract layouts if they exist
    if (config.layouts) {
      Object.entries(config.layouts).forEach(
        ([layoutId, layoutData]: [string, any]) => {
          reports.push({
            id: layoutId,
            layoutId: layoutId,
            widgetPlacements: layoutData.widgetPlacements || {},
            lastModified: layoutData.lastModified || res.data.updatedAt,
            version: layoutData.version || "1.0",
            schedule: config.schedule
              ? {
                  type: config.type,
                  dataFilter: config.dataFilter,
                  schedule: config.schedule,
                  timezone: config.timezone,
                  enabled: config.enabled,
                  language: config.language,
                }
              : undefined,
          });
        },
      );
    }

    // If no layouts but schedule exists, create a "schedule-only" entry
    if (reports.length === 0 && config.schedule) {
      reports.push({
        id: "schedule-only",
        layoutId: "schedule-only",
        widgetPlacements: {},
        lastModified: res.data.updatedAt,
        version: "1.0",
        schedule: {
          type: config.type,
          dataFilter: config.dataFilter,
          schedule: config.schedule,
          timezone: config.timezone,
          enabled: config.enabled,
          language: config.language,
        },
      });
    }

    return {
      statusCode: 200,
      message: "Success",
      total: reports.length,
      lastSync: res.data.updatedAt || new Date().toISOString(),
      reports: reports,
    };
  }

  // Return empty if no valid config found
  return {
    statusCode: 200,
    message: "Success",
    total: 0,
    lastSync: new Date().toISOString(),
    reports: [],
  };
};

// Fetch a single configuration by layout/report id
export const getReportConfigurationById = async (
  reportId: string | undefined,
): Promise<ReportLayoutConfiguration | null> => {
  if (!reportId) return null;

  // Get the full config and extract the specific layout
  const res = await axiosPrivate.get(`/report-config`);

  if (!res.data || !res.data.config) return null;

  const config = res.data.config;

  // Handle "schedule-only" virtual entry
  if (reportId === "schedule-only") {
    return {
      layoutId: "schedule-only",
      widgetPlacements: {},
      lastModified: res.data.updatedAt,
      version: "1.0",
    };
  }

  // Extract the specific layout from config.layouts
  if (config.layouts && config.layouts[reportId]) {
    const layoutData = config.layouts[reportId];
    return {
      layoutId: reportId,
      widgetPlacements: layoutData.widgetPlacements || {},
      lastModified: layoutData.lastModified || res.data.updatedAt,
      version: layoutData.version || "1.0",
    };
  }

  return null;
};
export const saveReportConfig = async (config: ReportConfig) => {
  console.log({ config });
  const response = await axiosPrivate.post("/report-config", { config });
  return response.data;
};

export const getTimezones = async (): Promise<string[]> => {
  const response = await axiosPrivate.get("/report-config/timezones");
  return response.data;
};
