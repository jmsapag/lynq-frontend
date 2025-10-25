import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  AlertCondition,
  CreateAlertConfigDto,
  AlertConfig,
} from "../../types/alert-config";
import { Location } from "../../types/location";

interface CreateAlertFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    locationId: number,
    alertData: CreateAlertConfigDto,
  ) => Promise<void>;
  onUpdate?: (
    configId: number,
    alertData: CreateAlertConfigDto,
  ) => Promise<void>;
  locations: Location[];
  loading: boolean;
  editingAlert?: AlertConfig | null;
}

export const CreateAlertForm: React.FC<CreateAlertFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  locations,
  loading,
  editingAlert,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<
    CreateAlertConfigDto & { locationId: number }
  >({
    title: "",
    threshold: 1,
    intervalMinutes: 15,
    condition: AlertCondition.GREATER_THAN,
    locationId: 0,
  });

  const intervalOptions = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
  ];

  const conditionOptions = [
    { value: AlertCondition.GREATER_THAN, label: "Greater than" },
    { value: AlertCondition.LESS_THAN, label: "Less than" },
  ];

  // Populate form when editing
  useEffect(() => {
    if (editingAlert) {
      setFormData({
        title: editingAlert.title,
        threshold: editingAlert.threshold,
        intervalMinutes: editingAlert.intervalMinutes,
        condition: editingAlert.condition,
        locationId: editingAlert.locationId,
      });
    } else {
      setFormData({
        title: "",
        threshold: 1,
        intervalMinutes: 15,
        condition: AlertCondition.GREATER_THAN,
        locationId: 0,
      });
    }
  }, [editingAlert, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlert && formData.locationId === 0) return;

    const { locationId, ...alertData } = formData;

    if (editingAlert && onUpdate) {
      await onUpdate(editingAlert.id, alertData);
    } else {
      await onSubmit(locationId, alertData);
    }

    // Reset form
    setFormData({
      title: "",
      threshold: 1,
      intervalMinutes: 15,
      condition: AlertCondition.GREATER_THAN,
      locationId: 0,
    });
  };

  const isEditing = !!editingAlert;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <h2 className="text-lg font-semibold">
              {isEditing
                ? t("alerts.editAlert", "Edit Alert Configuration")
                : t("alerts.createNew", "Create New Alert")}
            </h2>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <Select
              label="Location"
              placeholder="Select a location"
              selectedKeys={
                formData.locationId ? [formData.locationId.toString()] : []
              }
              onSelectionChange={(keys) => {
                const selectedId = Array.from(keys)[0] as string;
                setFormData((prev) => ({
                  ...prev,
                  locationId: parseInt(selectedId) || 0,
                }));
              }}
              isRequired
              isDisabled={isEditing} // Disable location change when editing
            >
              {locations.map((location) => (
                <SelectItem
                  key={location.id.toString()}
                  value={location.id.toString()}
                >
                  {location.name}
                </SelectItem>
              ))}
            </Select>

            <Input
              label="Alert Title"
              placeholder="Enter alert title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              isRequired
            />

            <div className="flex gap-4">
              <Input
                type="number"
                label="Threshold"
                placeholder="Enter threshold value"
                min="1"
                value={formData.threshold.toString()}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    threshold: parseInt(e.target.value) || 1,
                  }))
                }
                isRequired
              />

              <Select
                label="Condition"
                selectedKeys={[formData.condition]}
                onSelectionChange={(keys) => {
                  const condition = Array.from(keys)[0] as AlertCondition;
                  setFormData((prev) => ({ ...prev, condition }));
                }}
                isRequired
              >
                {conditionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Select
              label="Check Interval"
              selectedKeys={[formData.intervalMinutes.toString()]}
              onSelectionChange={(keys) => {
                const interval = Array.from(keys)[0] as string;
                setFormData((prev) => ({
                  ...prev,
                  intervalMinutes: parseInt(interval),
                }));
              }}
              isRequired
            >
              {intervalOptions.map((option) => (
                <SelectItem
                  key={option.value.toString()}
                  value={option.value.toString()}
                >
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={
                loading ||
                !formData.title ||
                (!isEditing && !formData.locationId)
              }
              isLoading={loading}
            >
              {isEditing ? "Update Alert" : "Create Alert"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
