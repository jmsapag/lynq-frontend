import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Checkbox,
} from "@heroui/react";
import { axiosPrivate } from "../../services/axiosClient";
import { Location, UserWithLocations } from "../../types/location";
import { useTranslation } from "react-i18next";

interface LocationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  locations: Location[];
  users: UserWithLocations[];
  setUsers: (users: UserWithLocations[]) => void;
  selectedLocationIds: number[];
}

const LocationSelectionModal: React.FC<LocationSelectionModalProps> = ({
  isOpen,
  onClose,
  userId,
  users,
  userName,
  locations,
  setUsers,
  selectedLocationIds,
}) => {
  const { t, i18n } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(
    new Set(selectedLocationIds),
  );
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedLocations(new Set(selectedLocationIds));
    }
  }, [isOpen, selectedLocationIds]);

  const allSelected =
    locations.length > 0 &&
    locations.every((location) => selectedLocations.has(location.id));

  const handleAllLocationsChange = (checked: boolean) => {
    if (checked) {
      const allLocationIds = locations.map((location) => location.id);
      setSelectedLocations(new Set(allLocationIds));
    } else {
      setSelectedLocations(new Set());
    }
  };

  const handleLocationChange = (locationId: number, checked: boolean) => {
    setSelectedLocations((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(locationId);
      } else {
        newSet.delete(locationId);
      }
      return newSet;
    });
  };

  const handleApply = async () => {
    try {
      setSaving(true);
      await axiosPrivate.post("/locations/locations", {
        userId: userId,
        location_ids: Array.from(selectedLocations),
      });
      setError(null);
      setUsers(
        users.map((user) => {
          if (user.id === userId) {
            return {
              ...user,
              locations: locations.filter((location) =>
                selectedLocations.has(location.id),
              ),
            };
          }
          return user;
        }),
      );
      onClose();
    } catch (err) {
      console.error("Error updating user locations:", err);
      setError("Failed to update locations");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal key={i18n.language} isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          <div className="text-xl font-medium">
            {t("users.selectLocations", "Select Locations for")}: {userName}
          </div>
        </ModalHeader>
        <ModalBody>
          {error ? (
            <div className="bg-danger-50 text-danger p-4 rounded">{error}</div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <Checkbox
                  id="select-all-locations"
                  isSelected={allSelected}
                  isIndeterminate={selectedLocations.size > 0 && !allSelected}
                  onValueChange={handleAllLocationsChange}
                >
                  {t("location.allLocations", "All Locations")}
                </Checkbox>
              </div>

              <div className="divider my-2 h-px bg-gray-200" />

              <div className="ml-4 flex flex-col space-y-2">
                {locations.map((location) => (
                  <Checkbox
                    key={`location-${location.id}`}
                    id={`location-${location.id}`}
                    isSelected={selectedLocations.has(location.id)}
                    onValueChange={(checked) =>
                      handleLocationChange(location.id, checked)
                    }
                  >
                    {location.name}
                  </Checkbox>
                ))}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onPress={onClose} className="mr-2">
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            variant="solid"
            onPress={handleApply}
            isDisabled={saving}
            isLoading={saving}
          >
            {t("common.apply", "Apply")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LocationSelectionModal;
