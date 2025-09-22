import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Location } from "../../types/location";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useDeleteLocation } from "../../hooks/locations/useDeleteLocation";

interface LocationsTableProps {
  locations: Location[];
  loading: boolean;
  error: string | null;
  onEdit: (location: Location) => void;
  onLocationDeleted: () => void;
  operatingHoursById?: Map<number, any>;
}

const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
  loading,
  error,
  onEdit,
  onLocationDeleted,
  operatingHoursById,
}) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const renderExpanded = (locationWithOH: any) => {
    const oh = locationWithOH?.operating_hours || {};
    const days: Array<{ key: string; label: string; value: any }> = [
      { key: "monday", label: t("days.monday"), value: oh.monday },
      { key: "tuesday", label: t("days.tuesday"), value: oh.tuesday },
      { key: "wednesday", label: t("days.wednesday"), value: oh.wednesday },
      { key: "thursday", label: t("days.thursday"), value: oh.thursday },
      { key: "friday", label: t("days.friday"), value: oh.friday },
      { key: "saturday", label: t("days.saturday"), value: oh.saturday },
      { key: "sunday", label: t("days.sunday"), value: oh.sunday },
    ];

    const dayText = (v: any) => {
      if (!v) return "—";
      if (v.is24h) return "24h";
      if (!Array.isArray(v.ranges) || v.ranges.length === 0) return "—";
      return v.ranges.map((r: any) => `${r.start}–${r.end}`).join(", ");
    };

    const hasAny = days.some((d) => {
      const v = d.value;
      if (!v) return false;
      if (v.is24h) return true;
      return Array.isArray(v.ranges) && v.ranges.length > 0;
    });

    if (!hasAny) {
      return (
        <div className="text-default-500 text-sm">
          {t("operatingHours.noneConfigured")}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {oh.timezone && (
          <div className="text-default-500 text-sm">{oh.timezone}</div>
        )}
        <div className="space-y-1">
          {days.map((d) => (
            <div key={d.key} className="flex items-center px-2 py-1">
              <div className="w-40 capitalize font-semibold text-default-700">
                {d.label}
              </div>
              <div className="text-default-800">{dayText(d.value)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const { handleDeleteLocation } = useDeleteLocation((error) => {
    setDeleting(false);
    addToast({
      title: t("locations.deleteErrorTitle"),
      description: error.message || t("locations.deleteErrorDesc"),
      severity: "danger",
      color: "danger",
    });
  });

  const handleDeleteClick = (location: Location) => {
    setLocationToDelete(location);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (locationToDelete) {
      setDeleting(true);
      handleDeleteLocation(locationToDelete.id, () => {
        setShowDeleteModal(false);
        setLocationToDelete(null);
        setDeleting(false);
        addToast({
          title: t("locations.deleteSuccessTitle"),
          description: t("locations.deleteSuccessDesc"),
          severity: "success",
          color: "success",
        });
        onLocationDeleted();
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger p-4">
        <p>
          {t("common.error")}: {error}
        </p>
      </div>
    );
  }

  return (
    <>
      <Table aria-label="Locations table" isStriped>
        <TableHeader>
          <TableColumn>{t("locations.name")}</TableColumn>
          <TableColumn>{t("locations.address")}</TableColumn>
          <TableColumn>{t("locations.createdAt")}</TableColumn>
          <TableColumn>{t("locations.actions")}</TableColumn>
        </TableHeader>
        <TableBody emptyContent={loading ? " " : t("locations.noLocations")}>
          {locations.map((location) => (
            <>
              <TableRow key={`${location.id}-main`}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1 text-default-500 hover:text-default-700"
                      onClick={() =>
                        setExpandedId((prev) =>
                          prev === location.id ? null : location.id,
                        )
                      }
                    >
                      {expandedId === location.id ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                    <div className="font-medium">{location.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-default-600">{location.address}</div>
                </TableCell>
                <TableCell>
                  <div className="text-default-600">
                    {formatDate(location.created_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => onEdit(location)}
                      className="text-primary"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleDeleteClick(location)}
                      className="text-danger"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedId === location.id && (
                <TableRow key={`${location.id}-expanded`}>
                  <TableCell colSpan={4} className="bg-default-50">
                    <div className="p-4">
                      {renderExpanded(
                        operatingHoursById?.get(location.id) || null,
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <ModalContent>
          <ModalHeader>{t("locations.deleteLocation")}</ModalHeader>
          <ModalBody>
            <p className="mb-2">
              {t("locations.deleteConfirm")}
              {locationToDelete && ` "${locationToDelete.name}"`}
            </p>
            <div className="bg-danger-50 border border-danger-200 text-danger-700 p-3 rounded-md mt-2">
              <p className="font-semibold mb-1">{t("common.warning")}</p>
              <p className="text-sm">{t("locations.deleteWarning")}</p>
            </div>
          </ModalBody>
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
              {t("locations.delete")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LocationsTable;
