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
  if (!oh || Object.keys(oh).length === 0) {
    return (
      <span className="text-default-500 text-sm">
        {t("operatingHours.noneConfigured")}
      </span>
    );
  }

  return (
    <div className="text-sm">
      <div className="text-default-500">{oh.timezone || ""}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
        {DAYS.map((d) => (
          <div key={d} className="flex gap-2">
            <div className="min-w-20 capitalize text-default-600">
              {t(`days.${d}`)}:
            </div>
            <div className="text-default-800">{dayToText(oh[d])}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
