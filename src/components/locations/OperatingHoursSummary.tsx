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
  if (day.is24h) return "24h";
  if (!day.ranges || day.ranges.length === 0) return "—";
  return day.ranges.map((r) => `${r.start}–${r.end}`).join(", ");
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
      if (v.is24h) return true;
      return Array.isArray(v.ranges) && v.ranges.length > 0;
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
