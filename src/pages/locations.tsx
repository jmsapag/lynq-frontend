import { useState } from "react";
import { Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import LocationsTable from "../components/locations/LocationsTable";
import CreateEditLocationModal from "../components/locations/CreateEditLocationModal";
import { useLocations } from "../hooks/locations/useLocations";
import { Location } from "../types/location";

export default function Locations() {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  const {
    locations,
    loading: locationsLoading,
    error: locationsError,
    refetch,
  } = useLocations();

  // Function to handle editing a location
  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsEditModalOpen(true);
  };

  // Function to close the edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedLocation(null);
  };

  // Function to handle successful create/edit operations
  const handleLocationSuccess = () => {
    refetch(); // Refresh the locations list
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{t("locations.management")}</h1>
          <p className="text-default-500">{t("locations.description")}</p>
        </div>
        <div className="flex flex-row gap-2">
          <Button color="primary" onPress={() => setIsCreateModalOpen(true)}>
            {t("locations.addLocation")}
          </Button>
        </div>
      </div>

      <LocationsTable
        locations={locations}
        loading={locationsLoading}
        error={locationsError}
        onEdit={handleEditLocation}
        onLocationDeleted={handleLocationSuccess}
      />

      {/* Create Location Modal */}
      <CreateEditLocationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleLocationSuccess}
      />

      {/* Edit Location Modal */}
      <CreateEditLocationModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={() => {
          handleLocationSuccess();
          handleCloseEditModal();
        }}
        location={selectedLocation}
      />
    </div>
  );
}
