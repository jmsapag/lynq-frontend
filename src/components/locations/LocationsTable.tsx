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
import { useDeleteLocation } from "../../hooks/locations/useDeleteLocation";

interface LocationsTableProps {
  locations: Location[];
  loading: boolean;
  error: string | null;
  onEdit: (location: Location) => void;
  onLocationDeleted: () => void;
}

const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
  loading,
  error,
  onEdit,
  onLocationDeleted,
}) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState(false);

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
        <p>{t("common.error")}: {error}</p>
      </div>
    );
  }

  return (
    <>
      <Table aria-label="Locations table" isStriped>
        <TableHeader>
          <TableColumn>{t("locations.name").toUpperCase()}</TableColumn>
          <TableColumn>{t("locations.address").toUpperCase()}</TableColumn>
          <TableColumn>{t("locations.createdAt").toUpperCase()}</TableColumn>
          <TableColumn>{t("locations.actions").toUpperCase()}</TableColumn>
        </TableHeader>
        <TableBody emptyContent={loading ? " " : t("locations.noLocations")}>
          {locations.map((location) => (
            <TableRow key={location.id}>
              <TableCell>
                <div className="font-medium">{location.name}</div>
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
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <ModalContent>
          <ModalHeader>{t("locations.deleteLocation")}</ModalHeader>
          <ModalBody>
            <p>
              {t("locations.deleteConfirm")}
              {locationToDelete && ` "${locationToDelete.name}"`}
            </p>
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