import React, { useState } from "react";
import { Button, Spinner, Tabs, Tab } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { AlertCard } from "../components/alerts/alert-card";
import { useAlerts } from "../hooks/alerts/useAlerts";
import type { AlertSeverity, Alert } from "../types/alert";

export const AlertFeed: React.FC = () => {
  const { t } = useTranslation();
  const { alerts, loading, error, unreadCount, markAsRead, markAllAsRead } =
    useAlerts();
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "ALL">(
    "ALL",
  );

  const filteredAlerts = alerts.filter((alert: Alert) => {
    if (filterSeverity === "ALL") return true;
    return alert.severity === filterSeverity;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label="Loading alerts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button color="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("alerts.title", "Alerts")}
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} {t("alerts.unreadStatus", "unread alert(s)")}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            color="primary"
            variant="flat"
            size="sm"
            onClick={markAllAsRead}
          >
            {t("alerts.markAllAsRead", "Mark all as read")}
          </Button>
        )}
      </div>

      <Tabs
        selectedKey={filterSeverity}
        onSelectionChange={(key) =>
          setFilterSeverity(key as AlertSeverity | "ALL")
        }
        className="mb-6"
      >
        <Tab key="ALL" title={t("alerts.all", "All")} />
        <Tab key="ERROR" title={t("alerts.errors", "Errors")} />
        <Tab key="WARN" title={t("alerts.warnings", "Warnings")} />
        <Tab key="INFO" title={t("alerts.info", "Info")} />
      </Tabs>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {t("alerts.noAlerts", "No alerts to display")}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert: Alert) => (
            <AlertCard key={alert.id} alert={alert} onMarkAsRead={markAsRead} />
          ))
        )}
      </div>
    </div>
  );
};
