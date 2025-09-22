import React, { useMemo } from "react";
import { Button, Checkbox, Input, Select, SelectItem } from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  DayOperatingHours,
  OperatingHours,
  TimeRange,
  Weekday,
} from "../../types/location";

type Props = {
  value: OperatingHours;
  onChange: (next: OperatingHours) => void;
  disabled?: boolean;
};

const WEEK_DAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function OperatingHoursEditor({
  value,
  onChange,
  disabled,
}: Props) {
  const { t } = useTranslation();

  const timezones: string[] = useMemo(() => {
    try {
      // Intl support; fallback minimal list if not available
      // @ts-ignore
      const names = Intl.supportedValuesOf
        ? Intl.supportedValuesOf("timeZone")
        : [];
      return Array.isArray(names) && names.length ? names : ["UTC"];
    } catch {
      return ["UTC"];
    }
  }, []);

  const updateTimezone = (tz: string) => onChange({ ...value, timezone: tz });

  const getDay = (day: Weekday): DayOperatingHours => ({
    is24h: value?.[day]?.is24h ?? false,
    ranges: value?.[day]?.ranges
      ? [...(value[day]!.ranges as TimeRange[])]
      : [],
  });

  const setDay = (day: Weekday, next: DayOperatingHours) =>
    onChange({ ...value, [day]: next });

  const addRange = (day: Weekday) => {
    const d = getDay(day);
    const ranges = [...(d.ranges || []), { start: "09:00", end: "18:00" }];
    setDay(day, { ...d, ranges });
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
    setDay(day, { ...d, ranges });
  };

  const toggle24h = (day: Weekday, checked: boolean) => {
    setDay(day, {
      is24h: checked,
      ranges: checked ? [] : value?.[day]?.ranges || [],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("operatingHours.timezone")}
        </label>
        <Select
          selectedKeys={value?.timezone ? [value.timezone] : []}
          onSelectionChange={(keys) => {
            const [tz] = Array.from(keys) as string[];
            if (tz) updateTimezone(tz);
          }}
          isDisabled={disabled}
        >
          {timezones.map((tz) => (
            <SelectItem key={tz} value={tz}>
              {tz}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WEEK_DAYS.map((day) => {
          const d = getDay(day);
          return (
            <div key={day} className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium capitalize">{t(`days.${day}`)}</div>
                <Checkbox
                  isSelected={!!d.is24h}
                  onValueChange={(v) => toggle24h(day, v)}
                  isDisabled={disabled}
                >
                  {t("operatingHours.open24h")}
                </Checkbox>
              </div>

              {!d.is24h && (
                <div className="space-y-2">
                  {(d.ranges || []).map((r, idx) => (
                    <div key={idx} className="grid grid-cols-9 gap-2 items-end">
                      <div className="col-span-4">
                        <Input
                          type="time"
                          label={t("operatingHours.start")}
                          value={r.start}
                          onChange={(e) =>
                            updateRange(day, idx, "start", e.target.value)
                          }
                          isDisabled={disabled}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="time"
                          label={t("operatingHours.end")}
                          value={r.end}
                          onChange={(e) =>
                            updateRange(day, idx, "end", e.target.value)
                          }
                          isDisabled={disabled}
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => removeRange(day, idx)}
                          isDisabled={disabled}
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    size="sm"
                    variant="bordered"
                    onPress={() => addRange(day)}
                    isDisabled={disabled}
                  >
                    {t("operatingHours.addRange")}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exceptions simplified input - optional basic support */}
      <div className="space-y-2">
        <div className="font-medium">{t("operatingHours.exceptions")}</div>
        <div className="text-default-500 text-sm">
          {t("operatingHours.exceptionsHint")}
        </div>
      </div>
    </div>
  );
}
