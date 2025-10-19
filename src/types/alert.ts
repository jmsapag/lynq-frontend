export enum AlertType {
  PERSONALIZED = "PERSONALIZED",
  SENSOR_ERROR = "SENSOR_ERROR",
}

export enum AlertSeverity {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export enum AlertStatus {
  UNREAD = "UNREAD",
  READ = "READ",
}

export interface Alert {
  id: number;
  title: string;
  message: string;
  severity: AlertSeverity;
  locationId: number;
  alertType: AlertType;
  metadata?: Record<string, any>;
  createdAt: string;
  status: AlertStatus;
  locationName?: string;
}

export interface AlertResponse {
  data: Alert[];
  total: number;
}
