import { useMemo } from "react";
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  DayOperatingHours,
  OperatingHours,
  TimeRange,
  Weekday,
} from "../../types/location";
import {
  PlusIcon,
  TrashIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

type Props = {
  value: OperatingHours;
  onChange: (next: OperatingHours) => void;
  disabled?: boolean;
};

const WEEK_DAYS: { key: Weekday; isWeekend: boolean }[] = [
  { key: "monday", isWeekend: false },
  { key: "tuesday", isWeekend: false },
  { key: "wednesday", isWeekend: false },
  { key: "thursday", isWeekend: false },
  { key: "friday", isWeekend: false },
  { key: "saturday", isWeekend: true },
  { key: "sunday", isWeekend: true },
];

export default function OperatingHoursEditor({
  value,
  onChange,
  disabled,
}: Props) {
  const { t } = useTranslation();

  const timezones: string[] = useMemo(() => {
    try {
      // Get common timezones first
      const commonTimezones = [
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Asia/Tokyo",
        "Australia/Sydney",
        "UTC",
      ];

      // @ts-ignore
      const allTimezones = Intl.supportedValuesOf
        ? Intl.supportedValuesOf("timeZone")
        : commonTimezones;

      return Array.isArray(allTimezones) && allTimezones.length
        ? [
            ...commonTimezones,
            ...allTimezones.filter((tz) => !commonTimezones.includes(tz)),
          ]
        : commonTimezones;
    } catch {
      return ["UTC"];
    }
  }, []);

  const updateTimezone = (tz: string) => onChange({ ...value, timezone: tz });

  const getDay = (day: Weekday): DayOperatingHours => {
    const raw = (value as any)?.[day] || {};
    const ranges = Array.isArray(raw.ranges)
      ? raw.ranges
      : Array.isArray(raw.timeSlots)
        ? raw.timeSlots
        : [];
    return {
      isOpen: raw.isOpen ?? (ranges.length > 0 ? true : false),
      ranges: [...(ranges as TimeRange[])],
    };
  };

  const setDay = (day: Weekday, next: DayOperatingHours) =>
    onChange({ ...value, [day]: next });

  const addRange = (day: Weekday) => {
    const d = getDay(day);
    const ranges = [...(d.ranges || []), { start: "09:00", end: "18:00" }];
    setDay(day, { ...d, isOpen: true, ranges });
  };

  const updateRange = (
    day: Weekday,
    idx: number,
    key: keyof TimeRange,
    val: string,
  ) => {
    const d = getDay(day);
    const ranges = [...(d.ranges || [])];
    if (!ranges[idx]) return;
    ranges[idx] = { ...ranges[idx], [key]: val } as TimeRange;
    setDay(day, { ...d, ranges });
  };

  const removeRange = (day: Weekday, idx: number) => {
    const d = getDay(day);
    const ranges = (d.ranges || []).filter((_, i) => i !== idx);
    setDay(day, { ...d, isOpen: ranges.length > 0 ? true : d.isOpen, ranges });
  };

  const toggleIsOpen = (day: Weekday, checked: boolean) => {
    const d = getDay(day);
    setDay(day, { ...d, isOpen: checked });
  };

  const copyToAllDays = (sourceDay: Weekday) => {
    const sourceData = getDay(sourceDay);
    WEEK_DAYS.forEach(({ key }) => {
      if (key !== sourceDay) {
        setDay(key, { ...sourceData });
      }
    });
  };

  const openDaysCount = WEEK_DAYS.filter(
    ({ key }) => getDay(key).isOpen,
  ).length;
  const hasAnyHours = WEEK_DAYS.some(({ key }) => {
    const day = getDay(key);
    return day.isOpen && day.ranges && day.ranges.length > 0;
  });

  return (
    <div className="space-y-6">
      {/* Timezone Selection */}
      <Card className="bg-default-50">
        <CardBody className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <GlobeAltIcon className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="font-medium text-sm">
                {t("operatingHours.timezone") || "Timezone"}
              </div>
              <div className="text-xs text-default-500">
                {t("operatingHours.timezoneDescription") ||
                  "Select the timezone for this location"}
              </div>
            </div>
          </div>

          <Select
            selectedKeys={value?.timezone ? [value.timezone] : []}
            onSelectionChange={(keys) => {
              const [tz] = Array.from(keys) as string[];
              if (tz) updateTimezone(tz);
            }}
            isDisabled={disabled}
            variant="bordered"
            placeholder="Select timezone"
            className="max-w-sm"
          >
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </Select>
        </CardBody>
      </Card>

      {/* Summary Stats */}
      <div className="flex gap-2 flex-wrap">
        <Chip
          color={openDaysCount > 0 ? "success" : "default"}
          variant="flat"
          size="sm"
        >
          {openDaysCount}/7 {t("operatingHours.daysOpen") || "days open"}
        </Chip>
        {hasAnyHours && (
          <Chip color="primary" variant="flat" size="sm">
            {t("operatingHours.hoursConfigured") || "Hours configured"}
          </Chip>
        )}
      </div>

      {/* Days Configuration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDaysIcon className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">
            {t("operatingHours.weeklySchedule") || "Weekly Schedule"}
          </span>
        </div>

        <div className="grid gap-3">
          {WEEK_DAYS.map(({ key: day, isWeekend }) => {
            const d = getDay(day);
            const hasRanges = d.ranges && d.ranges.length > 0;

            return (
              <Card
                key={day}
                className={`transition-all duration-200 ${
                  d.isOpen
                    ? "border-primary-200 bg-primary-50/30 dark:bg-primary-950/30"
                    : "border-default-200 bg-default-50"
                } ${isWeekend ? "border-l-4 border-l-warning-300" : ""}`}
              >
                <CardBody className="p-4">
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold capitalize text-medium">
                        {t(`days.${day}`) || day}
                      </div>
                      {isWeekend && (
                        <Chip size="sm" variant="flat" color="warning">
                          {t("common.weekend") || "Weekend"}
                        </Chip>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        isSelected={!!d.isOpen}
                        onValueChange={(v) => toggleIsOpen(day, v)}
                        isDisabled={disabled}
                        color="primary"
                        size="sm"
                      >
                        <span className="text-sm">
                          {t("operatingHours.open") || "Open"}
                        </span>
                      </Checkbox>
                    </div>
                  </div>

                  {/* Time Ranges */}
                  {d.isOpen && (
                    <div className="space-y-3 ml-2">
                      {/* Current Ranges */}
                      {(d.ranges || []).map((range, idx) => (
                        <div
                          key={idx}
                          className="flex items-end gap-3 p-3 rounded-lg bg-white/60 dark:bg-default-100/60 border border-default-200"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <Input
                              type="time"
                              label={t("operatingHours.start") || "Start"}
                              value={range.start}
                              onChange={(e) =>
                                updateRange(day, idx, "start", e.target.value)
                              }
                              isDisabled={disabled}
                              variant="bordered"
                              size="sm"
                              labelPlacement="outside"
                            />
                            <Input
                              type="time"
                              label={t("operatingHours.end") || "End"}
                              value={range.end}
                              onChange={(e) =>
                                updateRange(day, idx, "end", e.target.value)
                              }
                              isDisabled={disabled}
                              variant="bordered"
                              size="sm"
                              labelPlacement="outside"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            onPress={() => removeRange(day, idx)}
                            isDisabled={disabled}
                            isIconOnly
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="bordered"
                          color="primary"
                          onPress={() => addRange(day)}
                          isDisabled={disabled}
                          startContent={<PlusIcon className="h-4 w-4" />}
                        >
                          {t("operatingHours.addTimeRange") || "Add Time Range"}
                        </Button>

                        {hasRanges && (
                          <Button
                            size="sm"
                            variant="flat"
                            color="secondary"
                            onPress={() => copyToAllDays(day)}
                            isDisabled={disabled}
                          >
                            {t("operatingHours.copyToAll") ||
                              "Copy to All Days"}
                          </Button>
                        )}
                      </div>

                      {/* No ranges message */}
                      {(!d.ranges || d.ranges.length === 0) && (
                        <div className="text-center py-4 text-sm text-default-500 bg-default-100/60 rounded-lg border-2 border-dashed border-default-200">
                          {t("operatingHours.noHoursSet") ||
                            "No operating hours set for this day"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Closed day message */}
                  {!d.isOpen && (
                    <div className="text-center py-2 text-sm text-default-500">
                      {t("operatingHours.closedDay") || "Closed"}
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
