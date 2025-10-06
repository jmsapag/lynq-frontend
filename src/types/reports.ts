export interface ReportConfig {
  type: "weekly";
  dataFilter: {
    locationIds: number[];
    daysOfWeek: number[];
    timeRange: {
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
    };
  };
  schedule: {
    daysOfWeek: number[];
    executionTime: {
      hour: number;
      minute: number;
    };
  };
  timezone: string;
  enabled: boolean;
  layoutId?: string; // Selected layout from ReportLayoutService
  language?: string;
}

// Returned by /reports (list of saved layout configurations)
export interface ReportLayoutConfiguration {
  layoutId: string;
  widgetPlacements: Record<string, string>;
  lastModified: string; // ISO date string
  version: string;
}

export interface ReportConfigurationsResponse {
  configurations: ReportLayoutConfiguration[];
  total: number;
  lastSync: string; // ISO date string
}

// Generic Report (business/report schedule entity) expected by list & detail UI
// NOTE: Current /reports endpoint (configurations) does not provide all of these fields.
// We adapt what we can (layoutId -> id/title, lastModified -> createdAt) and leave others undefined.
export interface Report {
  id: string;
  title?: string; // or name
  name?: string;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
  lastRunAt?: string; // ISO
  status?: string; // e.g. active / disabled
  schedule?: string; // human readable schedule description
  variables?: Record<string, any>; // arbitrary key/value metadata
}
