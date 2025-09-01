import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { CheckboxGroup } from "./CheckboxGroup";
import { ProviderBadge } from "./ProviderBadge";
import { sensorMetadata } from "../../../types/sensorMetadata";
import { SensorLocation } from "../../../types/sensorLocation.ts";

interface SensorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: SensorLocation[];
  selectedSensors: number[];
  onSensorsChange: (sensors: number[]) => void;
}

const SensorSelectionModal: React.FC<SensorSelectionModalProps> = ({
  isOpen,
  onClose,
  locations,
  selectedSensors,
  onSensorsChange,
}) => {
  const { t } = useTranslation();

  // Local state for tracking selected sensors within the modal
  const [localSelectedSensors, setLocalSelectedSensors] = useState<Set<number>>(
    new Set(selectedSensors),
  );

  // Reset local state when modal opens
  useEffect(() => {
    // This ensures we always set the selected sensors when the modal opens
    if (isOpen) {
      // Create a fresh Set from the selectedSensors array
      const newSelectedSet = new Set([...selectedSensors]);
      setLocalSelectedSensors(newSelectedSet);
    }
  }, [isOpen, selectedSensors]);

  // Helper to get all sensors across all locations
  const allSensors = locations.flatMap((location) =>
    location.sensors.map((sensor: sensorMetadata) => sensor.id),
  );

  // Check if all sensors are selected in local state
  const allSelected =
    allSensors.length > 0 &&
    allSensors.every((sensor) => localSelectedSensors.has(sensor));

  // Handle "All sensors" checkbox change
  const handleAllSensorsChange = (checked: boolean) => {
    if (checked) {
      setLocalSelectedSensors(new Set(allSensors));
    } else {
      setLocalSelectedSensors(new Set());
    }
  };

  // Handle location checkbox change
  const handleLocationChange = (sensors: number[], checked: boolean) => {
    if (checked) {
      // Add all sensors from this location
      setLocalSelectedSensors((prev) => {
        const newSet = new Set(prev);
        sensors.forEach((sensor) => newSet.add(sensor));
        return newSet;
      });
    } else {
      // Remove all sensors from this location
      setLocalSelectedSensors((prev) => {
        const newSet = new Set(prev);
        sensors.forEach((sensor) => newSet.delete(sensor));
        return newSet;
      });
    }
  };

  // Handle individual sensor checkbox change
  const handleSensorChange = (sensor: number, checked: boolean) => {
    setLocalSelectedSensors((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(sensor);
      } else {
        newSet.delete(sensor);
      }
      return newSet;
    });
  };

  // Apply changes when user clicks the Apply button
  const handleApply = () => {
    onSensorsChange(Array.from(localSelectedSensors));
    onClose();
  };

  // Check if all sensors in a location are selected
  const areAllLocationSensorsSelected = (sensors: number[]): boolean => {
    return (
      sensors.length > 0 &&
      sensors.every((sensor) => localSelectedSensors.has(sensor))
    );
  };

  // Check if some (but not all) sensors in a location are selected
  const areSomeLocationSensorsSelected = (sensors: number[]): boolean => {
    return (
      sensors.some((sensor) => localSelectedSensors.has(sensor)) &&
      !sensors.every((sensor) => localSelectedSensors.has(sensor))
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalContent>
        <ModalHeader>
          <div className="text-xl font-medium">
            {t("filters.selectSensors")}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex items-center mb-4">
            <CheckboxGroup
              id="select-all-sensors"
              label={t("filters.allSensors")}
              checked={allSelected}
              indeterminate={localSelectedSensors.size > 0 && !allSelected}
              onChange={handleAllSensorsChange}
            />
          </div>

          <div className="divide-y divide-gray-200">
            <Accordion className="gap-2">
              {locations.map((location) => {
                const locationSensors = location.sensors.map(
                  (sensor: sensorMetadata) => sensor.id,
                );
                const allChecked =
                  areAllLocationSensorsSelected(locationSensors);
                const someChecked =
                  areSomeLocationSensorsSelected(locationSensors);

                return (
                  <AccordionItem
                    key={location.id}
                    aria-label={location.name}
                    title={
                      <div className="flex items-center w-full">
                        <CheckboxGroup
                          id={`location-${location.id}`}
                          label={location.name}
                          checked={allChecked}
                          indeterminate={someChecked}
                          onChange={(checked) =>
                            handleLocationChange(locationSensors, checked)
                          }
                          stopPropagation
                        />
                      </div>
                    }
                    classNames={{
                      title: "py-2",
                      trigger: "px-3 py-0",
                    }}
                  >
                    <div className="pl-10 flex flex-col space-y-2 py-2 gap-2">
                      {location.sensors.map((sensor: sensorMetadata) => (
                        <CheckboxGroup
                          key={`sensor-${location.id}-${sensor.id}`}
                          id={`sensor-${location.id}-${sensor.id}`}
                          label={
                            <div className="flex items-center gap-2">
                              <span>{sensor.position}</span>
                              {typeof sensor.provider === "string" &&
                                /footfallcam/i.test(sensor.provider) && (
                                  <ProviderBadge
                                    provider="FootfallCam"
                                    className="ml-1"
                                  />
                                )}
                            </div>
                          }
                          checked={localSelectedSensors.has(sensor.id)}
                          onChange={(checked) =>
                            handleSensorChange(sensor.id, checked)
                          }
                        />
                      ))}
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onPress={onClose} className="mr-2">
            {t("common.cancel")}
          </Button>
          <Button variant="solid" onPress={handleApply}>
            {t("common.apply")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SensorSelectionModal;
