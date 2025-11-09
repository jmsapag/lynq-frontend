import React, { useState } from "react";
import {
  Button,
  Spinner,
  Tabs,
  Tab,
  Pagination,
  useDisclosure,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { AlertCard } from "../components/alerts/alert-card";
import { useAlerts } from "../hooks/alerts/useAlerts";
import { useCreateAlertConfig } from "../hooks/alerts/useCreateAlertConfig";
import { useLocations } from "../hooks/locations/useLocations";
import { CreateAlertForm } from "../components/alerts/create-alert-form";
import { AlertSeverity, Alert } from "../types/alert";
import { CreateAlertConfigDto, AlertConfig } from "../types/alert-config";
import { useAlertConfigs } from "../hooks/alerts/useAlertConfigs";
import { AlertConfigsTable } from "../components/alerts/alert-configs-table";

export const AlertFeed: React.FC = () => {
  const { t } = useTranslation();
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "ALL">(
    "ALL",
  );
  const [selectedTab, setSelectedTab] = useState<string | number>("feed");
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [editingAlert, setEditingAlert] = useState<AlertConfig | null>(null);
  const [configToDelete, setConfigToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
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
    updateAlert,
    loading: createLoading,
    error: createError,
  } = useCreateAlertConfig();
  const { allLocations } = useLocations();

  const {
    configs,
    loading: configsLoading,
    error: configsError,
    refetch: refetchConfigs,
    deleteConfig,
  } = useAlertConfigs(selectedLocation || undefined);

  const handleSeverityChange = (key: string | number) => {
    const severity = key as AlertSeverity | "ALL";
    setFilterSeverity(severity);

    if (severity === "ALL") {
      setFilter({ severity: undefined });
    } else {
      switch (severity) {
        case AlertSeverity.ERROR:
        case AlertSeverity.WARN:
        case AlertSeverity.INFO:
          setFilter({
            severity: severity,
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
      refetchConfigs();
    }
  };

  const handleUpdateAlert = async (
    configId: number,
    alertData: CreateAlertConfigDto,
  ) => {
    const result = await updateAlert(configId, alertData);
    if (result) {
      onClose();
      refetchConfigs();
    }
  };

  const openCreateModal = () => {
    setEditingAlert(null);
    onOpen();
  };

  const openEditModal = (config: AlertConfig) => {
    setEditingAlert(config);
    onOpen();
  };

  const openDeleteModal = (configId: number) => {
    setConfigToDelete(configId);
    onDeleteModalOpen();
  };

  const handleDeleteConfig = async () => {
    if (!configToDelete) return;

    setIsDeleting(true);
    try {
      await deleteConfig(configToDelete);
      onDeleteModalClose();
    } catch (error) {
      // Error is already set in the hook, maybe show a toast here
      console.error("Failed to delete config", error);
    } finally {
      setIsDeleting(false);
      setConfigToDelete(null);
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
          {selectedTab === "feed" && unreadCount > 0 && (
            <p className="text-xs sm:text-sm text-gray-600">
              {unreadCount} {t("alerts.unreadStatus", "unread alert(s)")}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {selectedTab === "configurations" && (
            <Button
              color="primary"
              variant="solid"
              size="sm"
              onClick={openCreateModal}
              className="text-xs sm:text-sm"
              disabled={!selectedLocation}
            >
              {t("alerts.createNew", "Create Alert")}
            </Button>
          )}
          {selectedTab === "feed" && unreadCount > 0 && (
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

      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
        className="w-full mb-4 px-2"
        classNames={{
          tabList: "w-full",
          tab: "flex-1",
        }}
      >
        <Tab key="feed" title="Alert Feed" />
        <Tab key="configurations" title="Configurations" />
      </Tabs>

      {selectedTab === "feed" ? (
        <>
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
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onMarkAsRead={markAsRead}
                />
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
        </>
      ) : (
        <div className="space-y-4 px-2">
          <Select
            label="Select a Location"
            placeholder="Choose one"
            selectedKeys={selectedLocation ? [selectedLocation.toString()] : []}
            onSelectionChange={(keys) => {
              const selectedId = Array.from(keys)[0] as string;
              setSelectedLocation(parseInt(selectedId) || null);
            }}
            className="max-w-xs"
          >
            {allLocations.map((location) => (
              <SelectItem
                key={location.id.toString()}
                value={location.id.toString()}
              >
                {location.name}
              </SelectItem>
            ))}
          </Select>

          {configsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{configsError}</p>
            </div>
          )}

          <AlertConfigsTable
            configs={configs}
            loading={configsLoading}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        </div>
      )}

      {/* Create/Edit Alert Modal */}
      <CreateAlertForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleCreateAlert}
        onUpdate={handleUpdateAlert}
        locations={allLocations}
        loading={createLoading}
        editingAlert={editingAlert}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this alert configuration?</p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onDeleteModalClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteConfig}
              isLoading={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
