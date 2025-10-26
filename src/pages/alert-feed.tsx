import React, { useState } from "react";
import {
  Button,
  Spinner,
  Tabs,
  Tab,
  Pagination,
  useDisclosure,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { AlertCard } from "../components/alerts/alert-card";
import { useAlerts } from "../hooks/alerts/useAlerts";
import { useCreateAlertConfig } from "../hooks/alerts/useCreateAlertConfig";
import { useLocations } from "../hooks/locations/useLocations";
import { CreateAlertForm } from "../components/alerts/create-alert-form";
import { AlertSeverity, Alert } from "../types/alert";
import { CreateAlertConfigDto } from "../types/alert-config";

export const AlertFeed: React.FC = () => {
  const { t } = useTranslation();
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "ALL">(
    "ALL",
  );

  const {
    alerts,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    pagination,
    changePage,
    setFilter,
    refetch,
  } = useAlerts();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    createAlert,
    loading: createLoading,
    error: createError,
  } = useCreateAlertConfig();
  const { allLocations } = useLocations();

  const handleSeverityChange = (key: string | number) => {
    const severity = key as AlertSeverity | "ALL";
    setFilterSeverity(severity);

    if (severity === "ALL") {
      setFilter({ type: undefined });
    } else {
      switch (severity) {
        case AlertSeverity.ERROR:
        case AlertSeverity.WARN:
        case AlertSeverity.INFO:
          setFilter({
            title: severity,
          });
          break;
      }
    }
  };

  const handleCreateAlert = async (
    locationId: number,
    alertData: CreateAlertConfigDto,
  ) => {
    const result = await createAlert(locationId, alertData);
    if (result) {
      onClose();
      // Optionally refetch alerts to show any new configurations
      refetch();
    }
  };

  if (loading && pagination.page === 1) {
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
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4">
      {/* Header - more compact */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("alerts.title", "Alerts")}
          </h1>
          {unreadCount > 0 && (
            <p className="text-xs sm:text-sm text-gray-600">
              {unreadCount} {t("alerts.unreadStatus", "unread alert(s)")}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="solid"
            size="sm"
            onClick={onOpen}
            className="text-xs sm:text-sm"
          >
            {t("alerts.createNew", "Create Alert")}
          </Button>
          {unreadCount > 0 && (
            <Button
              color="primary"
              variant="flat"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs sm:text-sm"
            >
              {t("alerts.markAllAsRead", "Mark all as read")}
            </Button>
          )}
        </div>
      </div>

      {/* Show create error if any */}
      {createError && (
        <div className="mb-4 px-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{createError}</p>
          </div>
        </div>
      )}

      {/* Tabs - full width with minimal padding */}
      <div className="mb-4 px-2">
        <Tabs
          selectedKey={filterSeverity}
          onSelectionChange={handleSeverityChange}
          className="w-full"
          classNames={{
            tabList: "w-full",
            tab: "flex-1",
          }}
        >
          <Tab key="ALL" title={t("alerts.all", "All")} />
          <Tab key="ERROR" title={t("alerts.errors", "Errors")} />
          <Tab key="WARN" title={t("alerts.warnings", "Warnings")} />
          <Tab key="INFO" title={t("alerts.info", "Info")} />
        </Tabs>
      </div>

      {/* Alerts list - minimal horizontal padding */}
      <div className="space-y-3 px-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {t("alerts.noAlerts", "No alerts to display")}
            </p>
          </div>
        ) : (
          alerts.map((alert: Alert) => (
            <AlertCard key={alert.id} alert={alert} onMarkAsRead={markAsRead} />
          ))
        )}
      </div>

      {/* Pagination - centered with minimal top margin */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center px-2">
          <Pagination
            total={pagination.totalPages}
            initialPage={pagination.page}
            onChange={changePage}
            size="sm"
            showControls
          />
        </div>
      )}

      {/* Create Alert Modal */}
      <CreateAlertForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleCreateAlert}
        locations={allLocations}
        loading={createLoading}
      />
    </div>
  );
};
