import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  addToast,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useCreateLocation, CreateLocationInput } from "../../hooks/locations/useCreateLocation";
import { useEditLocation, EditLocationInput } from "../../hooks/locations/useEditLocation";
import { Location } from "../../types/location";

interface CreateEditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location?: Location | null; // Si existe, es edición; si no, es creación
}

const CreateEditLocationModal: React.FC<CreateEditLocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  location,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const { createLocation, loading: creating, error: createError } = useCreateLocation();
  const { editLocation, loading: editing, error: editError } = useEditLocation();

  const isEditing = !!location;
  const loading = creating || editing;
  const error = createError || editError;

  useEffect(() => {
    if (location) {
      setName(location.name);
      setAddress(location.address);
    } else {
      setName("");
      setAddress("");
    }
  }, [location, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !address.trim()) {
      addToast({
        title: t("locations.formErrorTitle"),
        description: t("locations.formErrorDesc"),
        severity: "danger",
        color: "danger",
      });
      return;
    }

    try {
      const locationData: CreateLocationInput | EditLocationInput = {
        name: name.trim(),
        address: address.trim(),
      };

      if (isEditing && location) {
        await editLocation(location.id, locationData);
        addToast({
          title: t("locations.updateSuccessTitle"),
          description: t("locations.updateSuccessDesc"),
          severity: "success",
          color: "success",
        });
      } else {
        await createLocation(locationData);
        addToast({
          title: t("locations.createSuccessTitle"),
          description: t("locations.createSuccessDesc"),
          severity: "success",
          color: "success",
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} location:`, err);
      addToast({
        title: isEditing ? t("locations.updateErrorTitle") : t("locations.createErrorTitle"),
        description: error || (isEditing ? t("locations.updateErrorDesc") : t("locations.createErrorDesc")),
        severity: "danger",
        color: "danger",
      });
    }
  };

  const resetForm = () => {
    setName("");
    setAddress("");
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleModalClose}>
      <ModalContent>
        <ModalHeader>
          {isEditing ? t("locations.editLocation") : t("locations.addLocation")}
        </ModalHeader>
        <ModalBody>
          <form
            className="space-y-4"
            id="location-form"
            onSubmit={handleSubmit}
          >
            <Input
              label={t("locations.locationName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t("locations.locationName")}
            />
            <Input
              label={t("locations.locationAddress")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder={t("locations.locationAddress")}
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="bordered"
            size="sm"
            onPress={handleModalClose}
            isDisabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="location-form"
            variant="solid"
            size="sm"
            isLoading={loading}
            color="primary"
          >
            {isEditing ? t("locations.editLocation") : t("locations.addLocation")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateEditLocationModal; 