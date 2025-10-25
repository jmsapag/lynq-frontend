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
  alertType: AlertType;
  status: AlertStatus;
  locationId: number;
  locationName: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AlertsResponse {
  data: Alert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
