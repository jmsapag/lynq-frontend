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
