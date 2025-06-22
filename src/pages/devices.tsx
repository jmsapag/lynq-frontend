import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from "@heroui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useDevices } from "../hooks/devices/useDevices";
import { useBusinesses } from "../hooks/business/useBusiness";
import { useLocations } from "../hooks/devices/useLocations";
import { useCreateDevice } from "../hooks/devices/useCreateDevice";
import { useDeleteDevice } from "../hooks/devices/useDeleteDevice";
import { addToast } from "@heroui/react";
import { useTranslation } from "react-i18next";

export default function DevicesPage() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [serialNumber, setSerialNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [position, setPosition] = useState("");
  const [businessId, setBusinessId] = useState<number | "">("");
  const [locationId, setLocationId] = useState<number | "">("");

  const [page, setPage] = useState(1);
  const limit = 15;
  const {
    devices,
    loading: loadingDevices,
    error: devicesError,
    pagination,
  } = useDevices(page, limit);

  const { createDevice, loading: creating } = useCreateDevice();
  const {
    deleteDevice,
    loading: deleting,
    error: deleteError,
  } = useDeleteDevice();

  const {
    businesses,
    loading: loadingBusinesses,
    error: businessesError,
  } = useBusinesses(1, 1000);

  const {
    locations,
    loading: loadingLocations,
    error: locationsError,
  } = useLocations(
    typeof businessId === "number" && !isNaN(businessId)
      ? businessId
      : undefined,
  );

  useEffect(() => {
    setLocationId("");
  }, [businessId]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<any | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serialNumber || !provider || !position || !businessId || !locationId) {
      addToast({
        title: t("devices.formErrorTitle"),
        description: t("devices.formErrorDesc"),
        severity: "danger",
        color: "danger",
      });
      return;
    }

    try {
      await createDevice({
        serial_number: serialNumber,
        provider,
        position,
        location_id: Number(locationId),
      });
      addToast({
        title: t("devices.createSuccessTitle"),
        description: t("devices.createSuccessDesc"),
        severity: "success",
        color: "success",
      });
      setShowModal(false);
      setSerialNumber("");
      setProvider("");
      setPosition("");
      setBusinessId("");
      setLocationId("");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      addToast({
        title: t("devices.createErrorTitle"),
        description:
          err?.response?.data?.message || t("devices.createErrorDesc"),
        severity: "danger",
        color: "danger",
      });
    }
  };

  const handleDeleteClick = (device: any) => {
    setDeviceToDelete(device);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deviceToDelete) {
      const success = await deleteDevice(
        deviceToDelete.id,
        deviceToDelete.location_id,
      );
      setShowDeleteModal(false);
      setDeviceToDelete(null);
      if (success) {
        addToast({
          title: t("devices.deleteSuccessTitle"),
          description: t("devices.deleteSuccessDesc"),
          severity: "success",
          color: "success",
        });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        addToast({
          title: t("devices.deleteErrorTitle"),
          description: deleteError || t("devices.deleteErrorDesc"),
          severity: "danger",
          color: "danger",
        });
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-end items-center mb-10">
        <Button variant="solid" size="sm" onPress={() => setShowModal(true)}>
          {t("devices.addDevice")}
        </Button>
      </div>

      {loadingDevices && (
        <div className="text-sm text-gray-500 mb-3">{t("common.loading")}</div>
      )}
      {devicesError && (
        <div className="text-sm text-red-500 mb-3">{devicesError}</div>
      )}
      {deleteError && (
        <div className="text-sm text-red-500 mb-3">{deleteError}</div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="py-2 px-3 font-medium text-gray-700">
                {t("devices.serialNumber")}
              </th>
              <th className="py-2 px-3 font-medium text-gray-700">
                {t("devices.provider")}
              </th>
              <th className="py-2 px-3 font-medium text-gray-700">
                {t("devices.position")}
              </th>
              <th className="py-2 px-3 font-medium text-gray-700">
                {t("devices.location")}
              </th>
              <th className="py-2 px-3 font-medium text-gray-700">
                {t("devices.createdAt")}
              </th>
              <th className="py-2 px-3 font-medium text-gray-700 text-center">
                {t("devices.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(devices) ? devices : []).map((d, idx) => (
              <tr
                key={d.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="py-2 px-3 text-gray-900">{d.serial_number}</td>
                <td className="py-2 px-3 text-gray-800">{d.provider}</td>
                <td className="py-2 px-3 text-gray-800">{d.position}</td>
                <td className="py-2 px-3 text-gray-600">
                  {d.location_name || "-"}
                </td>
                <td className="py-2 px-3 text-gray-500">
                  {new Date(d.created_at).toLocaleString()}
                </td>
                <td className="py-2 px-3 flex justify-center gap-2">
                  <button
                    className="text-red-500 hover:text-red-700 p-1"
                    onClick={() => handleDeleteClick(d)}
                    disabled={deleting}
                    title={t("devices.deleteDevice")}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {(!devices || devices.length === 0) && !loadingDevices && (
              <tr>
                <td colSpan={6} className="py-4 px-3 text-gray-400">
                  {t("devices.noDevices")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center items-center gap-4">
        <Button
          variant="bordered"
          size="sm"
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          isDisabled={!pagination?.hasPreviousPage || loadingDevices}
        >
          {t("common.previous")}
        </Button>
        <span className="text-sm text-gray-600">
          {t("common.page")} {page}{" "}
          {pagination?.totalPages ? `of ${pagination.totalPages}` : ""}
        </span>
        <Button
          variant="bordered"
          size="sm"
          onPress={() => setPage((p) => p + 1)}
          isDisabled={!pagination?.hasNextPage || loadingDevices}
        >
          {t("common.next")}
        </Button>
      </div>

      {/* Create Device Modal */}
      <Modal isOpen={showModal} onOpenChange={setShowModal}>
        <ModalContent>
          <ModalHeader>{t("devices.addDevice")}</ModalHeader>
          <ModalBody>
            <form
              id="create-device-form"
              onSubmit={handleCreate}
              className="space-y-4"
            >
              <Input
                label={t("devices.serialNumber")}
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
              />
              <Input
                label={t("devices.provider")}
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                required
              />
              <Input
                label={t("devices.position")}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              />
              <Select
                label={t("businesses.name")}
                value={businessId ? String(businessId) : ""}
                onChange={(e) => {
                  const val = (e.target as HTMLSelectElement).value;
                  setBusinessId(val ? Number(val) : "");
                }}
                required
                isDisabled={loadingBusinesses}
                items={businesses}
              >
                {(b) => <SelectItem key={b.id}>{b.name}</SelectItem>}
              </Select>
              {businessesError && (
                <div className="text-red-500 text-sm">{businessesError}</div>
              )}
              <Select
                label={t("devices.position")}
                value={locationId ? String(locationId) : ""}
                onChange={(e) =>
                  setLocationId(Number((e.target as HTMLSelectElement).value))
                }
                required
                isDisabled={loadingLocations || !businessId}
                items={locations}
              >
                {(loc) => <SelectItem key={loc.id}>{loc.name}</SelectItem>}
              </Select>
              {locationsError && (
                <div className="text-red-500 text-sm">{locationsError}</div>
              )}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="bordered"
              size="sm"
              onPress={() => setShowModal(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form="create-device-form"
              variant="solid"
              size="sm"
              isLoading={creating}
            >
              {t("devices.addDevice")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <ModalContent>
          <ModalHeader>{t("devices.deleteDevice")}</ModalHeader>
          <ModalBody>{t("devices.deleteConfirm")}</ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              size="sm"
              onPress={() => setShowDeleteModal(false)}
              isDisabled={deleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="solid"
              color="danger"
              size="sm"
              onPress={handleConfirmDelete}
              isLoading={deleting}
            >
              {t("devices.deleteDevice")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
