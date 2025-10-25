export enum AlertCondition {
  GREATER_THAN = "greater-than",
  LESS_THAN = "less-than",
}

export interface CreateAlertConfigDto {
  title: string;
  threshold: number;
  intervalMinutes: number;
  condition: AlertCondition;
}

export interface AlertConfig {
  id: number;
  userId: number;
  locationId: number;
  title: string;
  threshold: number;
  intervalMinutes: number;
  condition: AlertCondition;
  createdAt: Date;
}

export interface UpdateAlertConfigDto {
  title: string;
  threshold: number;
  intervalMinutes: number;
  condition: AlertCondition;
}
