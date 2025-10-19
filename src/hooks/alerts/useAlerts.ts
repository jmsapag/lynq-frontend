import { useState, useEffect } from "react";
import {
  Alert,
  AlertSeverity,
  AlertType,
  AlertStatus,
} from "../../types/alert";

// Mock data for development with proper enum values
const mockAlerts: Alert[] = [
  {
    id: 1,
    title: "High Traffic Alert",
    message: "Traffic levels exceeded threshold by 25% at Main Entrance",
    severity: AlertSeverity.WARN,
    locationId: 1,
    alertType: AlertType.PERSONALIZED,
    metadata: { threshold: 100, current: 125, difference: 25 },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: AlertStatus.UNREAD,
    locationName: "Main Entrance",
  },
  {
    id: 2,
    title: "Sensor Connection Lost",
    message: "Sensor #42 lost connection and requires attention",
    severity: AlertSeverity.ERROR,
    locationId: 2,
    alertType: AlertType.SENSOR_ERROR,
    metadata: { sensorId: 42, lastSeen: "2024-01-15T10:30:00Z" },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    status: AlertStatus.UNREAD,
    locationName: "North Wing",
  },
  {
    id: 3,
    title: "Daily Report Available",
    message: "Your daily analytics report is ready for review",
    severity: AlertSeverity.INFO,
    locationId: 1,
    alertType: AlertType.PERSONALIZED,
    metadata: { reportId: "daily-2024-01-15" },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: AlertStatus.READ,
    locationName: "Main Entrance",
  },
];

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock implementation for development
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAlerts(mockAlerts);
      setUnreadCount(
        mockAlerts.filter((a) => a.status === AlertStatus.UNREAD).length,
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: number) => {
    try {
      // Mock implementation for development
      await new Promise((resolve) => setTimeout(resolve, 200));

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, status: AlertStatus.READ } : alert,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to mark alert as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mock implementation for development
      await new Promise((resolve) => setTimeout(resolve, 300));

      setAlerts((prev) =>
        prev.map((alert) => ({ ...alert, status: AlertStatus.READ })),
      );
      setUnreadCount(0);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to mark all alerts as read",
      );
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return {
    alerts,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchAlerts,
  };
}
