import React from "react";
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
  const { handleDeleteLocation } = useDeleteLocation((error) => {
    addToast({
      title: t("locations.deleteErrorTitle"),
      description: error.message || t("locations.deleteErrorDesc"),
      severity: "danger",
      color: "danger",
    });
  });

  const handleDelete = (location: Location) => {
    if (window.confirm(t("locations.deleteConfirm"))) {
      handleDeleteLocation(location.id, () => {
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
    <Table aria-label="Locations table">
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
                  onPress={() => handleDelete(location)}
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
  );
};

export default LocationsTable; 