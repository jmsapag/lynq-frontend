import { useState, useEffect, useCallback } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import { Alert, AlertStatus, AlertType } from "../../types/alert";

interface AlertsParams {
  page?: number;
  limit?: number;
  status?: AlertStatus;
  locationId?: number;
  type?: AlertType;
  title?: string;
}

interface AlertsResponse {
  data: Alert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useAlerts(initialParams?: AlertsParams) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [params, setParams] = useState<AlertsParams>({
    page: 1,
    limit: 10,
    ...initialParams,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchAlerts = useCallback(
    async (queryParams?: AlertsParams) => {
      setLoading(true);
      setError(null);
      try {
        const currentParams = queryParams || params;
        const response = await axiosPrivate.get<AlertsResponse>("/alerts", {
          params: currentParams,
        });

        setAlerts(response.data.data);
        setPagination({
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        });

        const unreadResponse = await axiosPrivate.get<AlertsResponse>(
          "/alerts",
          {
            params: { status: AlertStatus.UNREAD, limit: 1 },
          },
        );
        setUnreadCount(unreadResponse.data.total);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch alerts");
      } finally {
        setLoading(false);
      }
    },
    [params],
  );

  const markAsRead = async (alertId: number) => {
    try {
      await axiosPrivate.put(`/alerts/${alertId}/status`, {
        status: AlertStatus.READ,
      });

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
      await axiosPrivate.put("/alerts/all/status", {
        status: AlertStatus.READ,
      });

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

  const changePage = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const setFilter = (filterParams: Partial<AlertsParams>) => {
    setParams((prev) => ({ ...prev, ...filterParams, page: 1 }));
  };

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts, params]);

  return {
    alerts,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: () => fetchAlerts(),
    pagination,
    changePage,
    setFilter,
  };
}
