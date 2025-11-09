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
  Divider,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  useCreateLocation,
  CreateLocationInput,
} from "../../hooks/locations/useCreateLocation";
import {
  useEditLocation,
  EditLocationInput,
} from "../../hooks/locations/useEditLocation";
import { Location } from "../../types/location";
import OperatingHoursEditor from "./OperatingHoursEditor";
import {
  useOperatingHoursAll,
  useSaveOperatingHours,
} from "../../hooks/locations/useOperatingHours";
import { OperatingHours } from "../../types/location";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

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
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({});
  const [originalOperatingHours, setOriginalOperatingHours] =
    useState<OperatingHours>({});

  const {
    createLocation,
    loading: creating,
    error: createError,
  } = useCreateLocation();
  const {
    editLocation,
    loading: editing,
    error: editError,
  } = useEditLocation();

  const isEditing = !!location;
  const loading = creating || editing;
  const error = createError || editError;

  const { save: saveOperatingHours, loading: savingOH } =
    useSaveOperatingHours();
  const { byId: ohById } = useOperatingHoursAll();

  function sanitizeOperatingHours(oh: OperatingHours): OperatingHours {
    const copy: OperatingHours = { ...oh };
    const days: (keyof OperatingHours)[] = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    for (const d of days) {
      const v: any = (copy as any)[d];
      if (!v) continue;
      const rangesSource = Array.isArray(v.ranges)
        ? v.ranges
        : Array.isArray(v.timeSlots)
          ? v.timeSlots
          : [];
      const ranges = rangesSource
        .filter((r: any) => r && r.start && r.end)
        .map((r: any) => ({ start: r.start, end: r.end }));
      const isOpen = v.isOpen === true || ranges.length > 0;
      if (!isOpen) {
        delete (copy as any)[d];
        continue;
      }
      (copy as any)[d] = { isOpen: true, ranges };
    }
    // keep timezone if present
    if (!copy.timezone) delete (copy as any).timezone;
    return copy;
  }

  function hasAnyDayConfigured(oh: any): boolean {
    const keys = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    return keys.some((k) => !!oh?.[k]);
  }

  function toBackendPayload(oh: OperatingHours): OperatingHours {
    // Backend expects only day keys with DayOperatingHours
    const { timezone, exceptions, ...days } = oh as any;
    const result: any = {};
    for (const k of Object.keys(days)) {
      const v = days[k];
      const slots = Array.isArray(v.ranges) ? v.ranges : v.timeSlots || [];
      result[k] = { isOpen: true, timeSlots: slots };
    }
    return result as OperatingHours;
  }

  function deepEqual(a: any, b: any): boolean {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }

  useEffect(() => {
    if (location) {
      setName(location.name);
      setAddress(location.address);
      const withOH = ohById.get(location.id) as any;
      const existing = withOH?.operating_hours as OperatingHours | undefined;
      const sanitized = sanitizeOperatingHours(existing || {});
      setOperatingHours(sanitized);
      setOriginalOperatingHours(sanitized);
    } else {
      setName("");
      setAddress("");
      setOperatingHours({});
      setOriginalOperatingHours({});
    }
  }, [location, isOpen, ohById]);

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
        // Save operating hours if changed and non-empty
        const sanitized = sanitizeOperatingHours(operatingHours || {});
        const changed = !deepEqual(sanitized, originalOperatingHours || {});
        if (changed && hasAnyDayConfigured(sanitized)) {
          const payload = toBackendPayload(sanitized);
          if (hasAnyDayConfigured(payload)) {
            await saveOperatingHours(location.id, payload);
          }
        }
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
      console.error(
        `Error ${isEditing ? "updating" : "creating"} location:`,
        err,
      );
      addToast({
        title: isEditing
          ? t("locations.updateErrorTitle")
          : t("locations.createErrorTitle"),
        description:
          error ||
          (isEditing
            ? t("locations.updateErrorDesc")
            : t("locations.createErrorDesc")),
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
    <Modal
      isOpen={isOpen}
      onOpenChange={handleModalClose}
      size={isEditing ? "5xl" : "2xl"}
      classNames={{
        wrapper: "items-start pt-8 pb-8",
        base: "max-h-[90vh]",
        body: "py-6",
        header: "pb-4",
        footer: "pt-4",
      }}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col space-y-1">
          <h2 className="text-xl font-semibold">
            {isEditing
              ? t("locations.editLocation")
              : t("locations.addLocation")}
          </h2>
          <p className="text-sm text-default-500 font-normal">
            {isEditing
              ? t("locations.editLocationSubtitle") ||
                "Update location details and operating hours"
              : t("locations.addLocationSubtitle") ||
                "Add a new location to your business"}
          </p>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Location Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-medium font-medium text-default-700">
              <MapPinIcon className="h-5 w-5 text-primary" />
              {t("locations.basicInfo") || "Location Information"}
            </div>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              id="location-form"
              onSubmit={handleSubmit}
            >
              <Input
                label={t("locations.locationName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={
                  t("locations.locationNamePlaceholder") ||
                  "Enter location name"
                }
                variant="bordered"
                labelPlacement="outside"
                className="col-span-full md:col-span-1"
              />
              <Input
                label={t("locations.locationAddress")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder={
                  t("locations.locationAddressPlaceholder") ||
                  "Enter full address"
                }
                variant="bordered"
                labelPlacement="outside"
                className="col-span-full md:col-span-1"
              />
            </form>
          </div>

          {/* Operating Hours Section - Only in Edit Mode */}
          {isEditing && (
            <>
              <Divider />
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-medium font-medium text-default-700">
                  <ClockIcon className="h-5 w-5 text-primary" />
                  {t("operatingHours.title") || "Operating Hours"}
                </div>
                <div className="text-sm text-default-500 mb-4">
                  {t("operatingHours.description") ||
                    "Set the hours when this location is open for business"}
                </div>

                <OperatingHoursEditor
                  value={operatingHours}
                  onChange={setOperatingHours}
                  disabled={savingOH}
                />
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter className="gap-2">
          <Button
            type="button"
            variant="bordered"
            size="md"
            onPress={handleModalClose}
            isDisabled={loading}
            className="px-6"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="location-form"
            variant="solid"
            size="md"
            isLoading={loading || savingOH}
            color="primary"
            className="px-6"
          >
            {isEditing
              ? t("locations.updateLocation") || "Update Location"
              : t("locations.createLocation") || "Create Location"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateEditLocationModal;
