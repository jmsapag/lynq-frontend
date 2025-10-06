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

// Schedule configuration unified in /reports response
export interface ReportScheduleConfig {
  type: string; // e.g. weekly
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
    executionTime: { hour: number; minute: number };
  };
  timezone: string;
  enabled: boolean;
  language?: string;
}

// Final /reports entry (each layout fused with schedule). If there is only schedule and no layouts
// backend returns a virtual entry with id/layoutId 'schedule-only' and empty widgetPlacements.
export interface ReportEntry extends ReportLayoutConfiguration {
  id: string; // mirrors layoutId or 'schedule-only'
  schedule?: ReportScheduleConfig; // may be shared across entries
}

// Final /reports response
export interface ReportsResponse {
  statusCode: number;
  message: string;
  total: number; // number of reports entries
  lastSync: string;
  reports: ReportEntry[];
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
