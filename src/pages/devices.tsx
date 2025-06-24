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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  addToast,
} from "@heroui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useDevices } from "../hooks/devices/useDevices";
import { useBusinesses } from "../hooks/business/useBusiness";
import { useLocations } from "../hooks/devices/useLocations";
import { useCreateDevice } from "../hooks/devices/useCreateDevice";
import { useDeleteDevice } from "../hooks/devices/useDeleteDevice";
import { useTranslation } from "react-i18next";
import SearchBar from "../components/search/SearchBar";

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

  const [providerFilter, setProviderFilter] = useState<"all" | string>("all");
  const [search, setSearch] = useState("");

  const uniqueProviders = Array.isArray(devices)
    ? Array.from(new Set(devices.map((d) => d.provider).filter(Boolean)))
    : [];

  const providerOptions = [
    { key: "all", label: t("devices.allProviders") || "All Providers" },
    ...uniqueProviders.map((p) => ({ key: p, label: p })),
  ];

  const filteredDevices = Array.isArray(devices)
    ? devices.filter(
        (d) =>
          (providerFilter === "all" ? true : d.provider === providerFilter) &&
          (search.trim() === "" ||
            d.serial_number.toLowerCase().includes(search.toLowerCase()) ||
            d.provider.toLowerCase().includes(search.toLowerCase())),
      )
    : [];

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
    <div className="w-full mx-1">
      <div className="flex justify-end items-center mb-4 gap-4">
        <Select
          placeholder={t("devices.filterProvider") || "Filter by provider"}
          value={providerFilter}
          onChange={(e) =>
            setProviderFilter((e.target as HTMLSelectElement).value)
          }
          size="sm"
          className="w-48"
          items={providerOptions}
        >
          {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
        </Select>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t("common.search") || "Search devices..."}
          className="w-64"
        />

        <Button
          color="primary"
          variant="solid"
          size="sm"
          onPress={() => setShowModal(true)}
        >
          {t("devices.addDevice")}
        </Button>
      </div>

      {loadingDevices && (
        <div className="flex justify-center items-center h-32">
          <Spinner size="lg" />
        </div>
      )}

      <div>
        <Table aria-label="Devices table" isStriped>
          <TableHeader>
            <TableColumn>{t("devices.serialNumber")}</TableColumn>
            <TableColumn>{t("devices.provider")}</TableColumn>
            <TableColumn>{t("devices.position")}</TableColumn>
            <TableColumn>{t("devices.location")}</TableColumn>
            <TableColumn>{t("devices.createdAt")}</TableColumn>
            <TableColumn className="text-center">
              {t("devices.actions")}
            </TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={loadingDevices ? " " : t("devices.noDevices")}
          >
            {(Array.isArray(filteredDevices) ? filteredDevices : []).map(
              (d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.serial_number}</TableCell>
                  <TableCell>{d.provider}</TableCell>
                  <TableCell>{d.position}</TableCell>
                  <TableCell>{d.location_name || "-"}</TableCell>
                  <TableCell>
                    {new Date(d.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleDeleteClick(d)}
                        className="text-danger"
                        isDisabled={deleting}
                        title={t("devices.deleteDevice")}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
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
          {t("common.page")} {page}
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
                label={t("devices.businessName")}
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
                label={t("devices.location")}
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
