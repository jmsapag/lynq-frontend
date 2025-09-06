import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  Select,
  SelectItem,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { ReportConfig } from "../../types/reports";
import { useState, useEffect } from "react";
import { useLocations } from "../../hooks/locations/useLocations";
import { ReportLayoutService } from "../../services/reportLayoutService";
import { getTimezones } from "../../services/reportsService";

interface ReportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReportConfig) => void;
  isLoading: boolean;
}

const daysOfWeekOptions = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const ReportConfigModal = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
}: ReportConfigModalProps) => {
  const { t } = useTranslation();
  const { locations } = useLocations();

  // Get available layouts from the service
  const reportLayoutService = ReportLayoutService.getInstance();
  const availableLayouts = reportLayoutService.getAllLayouts();

  const [config, setConfig] = useState<ReportConfig>({
    type: "weekly",
    enabled: true,
    timezone: "UTC", // Default to UTC
    layoutId: "default", // Set default layout
    dataFilter: {
      locationIds: [],
      daysOfWeek: [1, 2, 3, 4, 5],
      timeRange: { startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
    },
    schedule: {
      daysOfWeek: [1],
      executionTime: { hour: 8, minute: 0 },
    },
  });

  const [timezones, setTimezones] = useState<string[]>([]);

  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        const timezoneList = await getTimezones();
        setTimezones(timezoneList);
      } catch (error) {
        console.error("Error fetching timezones:", error);
      }
    };
    fetchTimezones();
  }, []);

  const handleLocationToggle = (locationId: number) => {
    setConfig((prev) => {
      const locationIds = prev.dataFilter.locationIds;
      const newLocationIds = locationIds.includes(locationId)
        ? locationIds.filter((id) => id !== locationId)
        : [...locationIds, locationId];
      return {
        ...prev,
        dataFilter: {
          ...prev.dataFilter,
          locationIds: newLocationIds,
        },
      };
    });
  };

  const handleTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field:
      | "dataFilter.timeRange.start"
      | "dataFilter.timeRange.end"
      | "schedule.executionTime",
  ) => {
    const [hour, minute] = e.target.value.split(":").map(Number);
    if (field === "dataFilter.timeRange.start") {
      setConfig((prev) => ({
        ...prev,
        dataFilter: {
          ...prev.dataFilter,
          timeRange: {
            ...prev.dataFilter.timeRange,
            startHour: hour,
            startMinute: minute,
          },
        },
      }));
    } else if (field === "dataFilter.timeRange.end") {
      setConfig((prev) => ({
        ...prev,
        dataFilter: {
          ...prev.dataFilter,
          timeRange: {
            ...prev.dataFilter.timeRange,
            endHour: hour,
            endMinute: minute,
          },
        },
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, executionTime: { hour, minute } },
      }));
    }
  };

  const handleDayToggle = (
    day: number,
    field: "dataFilter.daysOfWeek" | "schedule.daysOfWeek",
  ) => {
    const currentDays =
      field === "dataFilter.daysOfWeek"
        ? config.dataFilter.daysOfWeek
        : config.schedule.daysOfWeek;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    if (field === "dataFilter.daysOfWeek") {
      setConfig((prev) => ({
        ...prev,
        dataFilter: { ...prev.dataFilter, daysOfWeek: newDays },
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, daysOfWeek: newDays },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(config);
  };

  const formatTime = (hour: number, minute: number) => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${pad(hour)}:${pad(minute)}`;
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{t("reports.modalTitle")}</ModalHeader>
          <ModalBody className="space-y-6">
            {/* Layout Selection */}
            <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-medium px-1">
                {t("reports.form.layoutTitle", "Report Layout")}
              </legend>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("reports.form.layout", "Select Layout")}
                </label>
                <Select
                  size="sm"
                  selectedKeys={config.layoutId ? [config.layoutId] : []}
                  onSelectionChange={async (keys) => {
                    const layoutId = Array.from(keys)[0] as string;
                    setConfig((prev) => ({
                      ...prev,
                      layoutId: layoutId,
                    }));
                  }}
                  placeholder={t(
                    "reports.form.selectLayout",
                    "Choose a layout...",
                  )}
                >
                  {availableLayouts.map((layout) => (
                    <SelectItem key={layout.id}>{layout.name}</SelectItem>
                  ))}
                </Select>
                {config.layoutId && (
                  <div className="mt-1">
                    <p className="text-xs text-gray-500">
                      {
                        availableLayouts.find((l) => l.id === config.layoutId)
                          ?.description
                      }
                    </p>
                  </div>
                )}
              </div>
            </fieldset>

            <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-medium px-1">
                {t("reports.form.dataFilterTitle", "Data Filter")}
              </legend>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("reports.form.locations")}
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {locations?.map((location) => (
                      <Checkbox
                        key={location.id}
                        size="sm"
                        isSelected={config.dataFilter.locationIds.includes(
                          location.id,
                        )}
                        onValueChange={() => handleLocationToggle(location.id)}
                      >
                        {location.name}
                      </Checkbox>
                    ))}
                  </div>
                </div>
                <br />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("reports.form.dataDays")}
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {daysOfWeekOptions.map(({ value, label }) => (
                      <Checkbox
                        key={value}
                        size="sm"
                        isSelected={config.dataFilter.daysOfWeek.includes(
                          value,
                        )}
                        onValueChange={() =>
                          handleDayToggle(value, "dataFilter.daysOfWeek")
                        }
                      >
                        {label}
                      </Checkbox>
                    ))}
                  </div>
                </div>
                <br />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("reports.form.timeRange")}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      size="sm"
                      type="time"
                      value={formatTime(
                        config.dataFilter.timeRange.startHour,
                        config.dataFilter.timeRange.startMinute,
                      )}
                      onChange={(e) =>
                        handleTimeChange(e, "dataFilter.timeRange.start")
                      }
                    />
                    <span>{t("filters.to", "to")}</span>
                    <Input
                      size="sm"
                      type="time"
                      value={formatTime(
                        config.dataFilter.timeRange.endHour,
                        config.dataFilter.timeRange.endMinute,
                      )}
                      onChange={(e) =>
                        handleTimeChange(e, "dataFilter.timeRange.end")
                      }
                    />
                  </div>
                </div>
                <br />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("reports.form.timezone")}
                  </label>
                  <Select
                    size="sm"
                    selectedKeys={[config.timezone]}
                    onSelectionChange={(keys) => {
                      const newTimezone = Array.from(keys)[0] as string;
                      setConfig((prev) => ({ ...prev, timezone: newTimezone }));
                    }}
                  >
                    {timezones.map((tz) => (
                      <SelectItem key={tz}>{tz}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </fieldset>

            <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-medium px-1">
                {t("reports.form.scheduleTitle", "Schedule")}
              </legend>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("reports.form.scheduleDays")}
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {daysOfWeekOptions.map(({ value, label }) => (
                      <Checkbox
                        key={value}
                        size="sm"
                        isSelected={config.schedule.daysOfWeek.includes(value)}
                        onValueChange={() =>
                          handleDayToggle(value, "schedule.daysOfWeek")
                        }
                      >
                        {label}
                      </Checkbox>
                    ))}
                  </div>
                </div>
                <br />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("reports.form.executionTime")}
                  </label>
                  <Input
                    size="sm"
                    type="time"
                    value={formatTime(
                      config.schedule.executionTime.hour,
                      config.schedule.executionTime.minute,
                    )}
                    onChange={(e) =>
                      handleTimeChange(e, "schedule.executionTime")
                    }
                  />
                </div>
              </div>
            </fieldset>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onClose} disabled={isLoading}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {t("reports.form.save")}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ReportConfigModal;
