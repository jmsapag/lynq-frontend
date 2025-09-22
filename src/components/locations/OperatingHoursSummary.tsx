import React from "react";
import { useTranslation } from "react-i18next";
import {
  DayOperatingHours,
  LocationWithOperatingHours,
  Weekday,
} from "../../types/location";

type Props = {
  location?: LocationWithOperatingHours | null;
};

const DAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function dayToText(day: DayOperatingHours | undefined) {
  if (!day) return "—";
  const ranges = day.ranges || (day as any).timeSlots || [];
  if (!day.isOpen) return "—";
  if (!ranges || ranges.length === 0) return "—";
  return ranges.map((r: any) => `${r.start}–${r.end}`).join(", ");
}

export default function OperatingHoursSummary({ location }: Props) {
  const { t } = useTranslation();

  const oh = (location as any)?.operating_hours;
  // remove empty day entries
  const hasAny = () => {
    if (!oh) return false;
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ] as const;
    return days.some((d) => {
      const v = oh[d];
      if (!v) return false;
      const ranges = v.ranges || v.timeSlots || [];
      return v.isOpen === true && Array.isArray(ranges) && ranges.length > 0;
    });
  };

  if (!oh || !hasAny()) {
    return (
      <span className="text-default-500 text-sm">
        {t("operatingHours.noneConfigured")}
      </span>
    );
  }

  return null; // Detailed view will be handled in collapsible panel
}
