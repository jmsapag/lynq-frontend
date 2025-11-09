export enum AlertCondition {
  GREATER_THAN = "greater-than",
  LESS_THAN = "less-than",
}

export enum AlertMetric {
  SUM_IN_OUT = "sum_in_out",
  TOTAL_IN = "total_in",
  TOTAL_OUT = "total_out",
  NO_DATA = "no_data",
  ANOMALY = "anomaly",
}

export interface CreateAlertConfigDto {
  title: string;
  metric: AlertMetric;
  threshold: number;
  intervalMinutes: number;
  graceMinutes: number;
  debounceMinutes: number;
  condition: AlertCondition;
}

export interface AlertConfig {
  id: number;
  userId: number;
  locationId: number;
  title: string;
  metric: AlertMetric;
  threshold: number;
  intervalMinutes: number;
  graceMinutes: number;
  debounceMinutes: number;
  condition: AlertCondition;
  createdAt: Date;
}

export interface UpdateAlertConfigDto {
  title: string;
  metric: AlertMetric;
  threshold: number;
  intervalMinutes: number;
  graceMinutes: number;
  debounceMinutes: number;
  condition: AlertCondition;
}
