import React, { useState } from "react";
import { ArrowPathIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  DatePicker,
  Button,
  // TimeInput
} from "@heroui/react";
import { DateValue, Time } from "@internationalized/date";
import { fromDate, getLocalTimeZone } from "@internationalized/date";
import SensorSelectionModal from "./sensors/SensorSelectionModal";
import { SensorLocation } from "../../types/sensorLocation.ts";

type DashboardFiltersProps = {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  currentDateRange: { start: Date; end: Date };
  onSensorsChange: (sensors: number[]) => void;
  onAggregationChange?: (aggregation: string) => void;
  hourRange: { start: Time; end: Time };
  onHourRangeChange: (start: Time, end: Time) => void;
  currentAggregation?: string;
  onRefreshData?: () => void;
  locations: SensorLocation[];
  currentSensors: number[];
  lastUpdated: Date | null;
  hideGroupBy?: boolean;
  hideAggregation?: boolean;
};

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onDateRangeChange,
  currentDateRange,
  onSensorsChange,
  onAggregationChange,
  currentAggregation,
  // hourRange,
  // onHourRangeChange,
  onRefreshData,
  locations,
  currentSensors,
  lastUpdated,
  hideGroupBy = false,
  hideAggregation = false,
}) => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<DateValue>(() => {
    return currentDateRange?.start
      ? fromDate(currentDateRange.start, getLocalTimeZone())
      : fromDate(new Date(), getLocalTimeZone());
  });

  const [endDate, setEndDate] = useState<DateValue>(() => {
    return currentDateRange?.end
      ? fromDate(currentDateRange.end, getLocalTimeZone())
      : fromDate(new Date(), getLocalTimeZone());
  });

  const [groupBy, setGroupBy] = useState<string>("day");
  const [aggregation, setAggregation] = useState<string>(
    currentAggregation || "sum",
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleStartDateChange = (value: DateValue | null) => {
    if (value) {
      setStartDate(value);
      if (endDate) {
        // Convert DateValue to Date for the callback
        const startDateObj = value.toDate(getLocalTimeZone());
        startDateObj.setHours(0, 0, 0, 0);
        const endDateObj = endDate.toDate(getLocalTimeZone());
        onDateRangeChange(startDateObj, endDateObj);
      }
    }
  };

  const handleEndDateChange = (value: DateValue | null) => {
    if (value) {
      const now = new Date().setHours(23, 59, 59, 999);
      if (value.toDate(getLocalTimeZone()).getTime() > now) {
        return;
      }
      setEndDate(value);
      if (startDate) {
        // Convert DateValue to Date for the callback
        const endDateObj = value.toDate(getLocalTimeZone());
        endDateObj.setHours(23, 59, 59, 999);
        const startDateObj = startDate.toDate(getLocalTimeZone());
        onDateRangeChange(startDateObj, endDateObj);
      }
    }
  };
  // const handleStartTimeChange = (value: Time | null) => {
  //   if (value) {
  //     onHourRangeChange(value, hourRange.end);
  //   }
  // };
  //
  // const handleEndTimeChange = (value: Time | null) => {
  //   if (value) {
  //     onHourRangeChange(hourRange.start, value);
  //   }
  // };

  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGroupBy = e.target.value;
    setGroupBy(newGroupBy);

    // Dispatch a custom event to notify the dashboard component
    const event = new CustomEvent("groupByChange", {
      detail: { groupBy: newGroupBy },
    });
    window.dispatchEvent(event);
  };

  const handleAggregationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAggregation = e.target.value;
    setAggregation(newAggregation);
    if (onAggregationChange) {
      onAggregationChange(newAggregation);
    }
  };

  const handleRefresh = () => {
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return t("filters.neverUpdated");

    const date = format(lastUpdated, "dd/MM/yyyy");
    const time = format(lastUpdated, "HH:mm:ss");
    return `${date} ${time}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:space-x-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("filters.dateRange")}
            </label>
            <div className="flex items-center space-x-2">
              <DatePicker
                value={startDate}
                variant="bordered"
                granularity="day"
                onChange={handleStartDateChange}
                className="w-full"
                aria-label="Start Date"
              />
              <span className="text-gray-500">{t("filters.to")}</span>
              <DatePicker
                value={endDate}
                variant="bordered"
                granularity="day"
                onChange={handleEndDateChange}
                className="w-full"
                aria-label="End Date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("filters.sensors")}
            </label>
            <Button
              variant="bordered"
              className="w-full md:w-60 justify-between"
              endContent={<FunnelIcon className="h-4 w-4 text-gray-500" />}
              onClick={() => setIsModalOpen(true)}
            >
              <span className="truncate">
                {currentSensors.length === 0
                  ? t("filters.noSensorsSelected")
                  : currentSensors.length ===
                      locations.flatMap((sensor) => sensor.sensors).length
                    ? t("filters.allSensors")
                    : t("filters.sensorsSelected", {
                        count: currentSensors.length,
                      })}
              </span>
            </Button>

            <SensorSelectionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              locations={locations}
              selectedSensors={currentSensors}
              onSensorsChange={onSensorsChange}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:space-x-4">
          {/*<div className="space-y-2">*/}
          {/*  <label className="block text-sm font-medium text-gray-700">*/}
          {/*    {t("filters.timeRange")}*/}
          {/*  </label>*/}
          {/*  <div className="flex items-center space-x-2">*/}
          {/*    <TimeInput*/}
          {/*      value={hourRange.start}*/}
          {/*      variant="bordered"*/}
          {/*      onChange={handleStartTimeChange}*/}
          {/*      className="w-full"*/}
          {/*    />*/}
          {/*    <span className="text-gray-500">{t("filters.to")}</span>*/}
          {/*    <TimeInput*/}
          {/*      value={hourRange.end}*/}
          {/*      variant="bordered"*/}
          {/*      onChange={handleEndTimeChange}*/}
          {/*      className="w-full"*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*</div>*/}

          {!hideGroupBy && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("filters.groupBy")}
              </label>
              <select
                className="inline-flex w-full md:w-60 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-colors duration-150"
                value={groupBy}
                onChange={handleGroupByChange}
              >
                <option value="5min">{t("filters.groupOptions.5min")}</option>
                <option value="10min">{t("filters.groupOptions.10min")}</option>
                <option value="15min">{t("filters.groupOptions.15min")}</option>
                <option value="30min">{t("filters.groupOptions.30min")}</option>
                <option value="hour">{t("filters.groupOptions.hour")}</option>
                <option value="day">{t("filters.groupOptions.day")}</option>
                <option value="week">{t("filters.groupOptions.week")}</option>
                <option value="month">{t("filters.groupOptions.month")}</option>
              </select>
            </div>
          )}

          {!hideAggregation && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("filters.aggregation")}
              </label>
              <select
                className="inline-flex w-full md:w-60 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-colors duration-150"
                value={aggregation}
                onChange={handleAggregationChange}
              >
                <option value="sum">
                  {t("filters.aggregationOptions.sum")}
                </option>
                <option value="avg">
                  {t("filters.aggregationOptions.avg")}
                </option>
                <option value="min">
                  {t("filters.aggregationOptions.min")}
                </option>
                <option value="max">
                  {t("filters.aggregationOptions.max")}
                </option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-gray-500 text-center">
              {t("filters.lastUpdated")}: {formatLastUpdated()}
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex w-full items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-colors duration-150"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              {t("filters.refresh")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
