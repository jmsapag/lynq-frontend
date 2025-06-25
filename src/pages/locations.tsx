import { useState } from "react";
import { Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import LocationsTable from "../components/locations/LocationsTable";
import CreateEditLocationModal from "../components/locations/CreateEditLocationModal";
import { useLocations } from "../hooks/locations/useLocations";
import { Location } from "../types/location";
import SearchBar from "../components/search/SearchBar"; // Add this import

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

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedLocation(null);
  };

  const handleLocationSuccess = () => {
    refetch();
  };

  const [search, setSearch] = useState("");

  const filteredLocations = Array.isArray(locations)
    ? locations.filter(
        (loc) =>
          search.trim() === "" ||
          loc.name.toLowerCase().includes(search.toLowerCase()) ||
          loc.address.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  return (
    <div className="w-full mx-1">
      <div className="flex justify-end items-center mb-4 gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t("common.search") || "Search locations..."}
          className="w-64"
        />
        <Button
          color="primary"
          variant="solid"
          size="sm"
          onPress={() => setIsCreateModalOpen(true)}
        >
          {t("locations.addLocation")}
        </Button>
      </div>

      <LocationsTable
        locations={filteredLocations}
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
