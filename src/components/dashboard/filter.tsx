import React, { useState } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectItem,
  Switch,
  // TimeInput
} from "@heroui/react";
import { DatePicker, Button } from "@heroui/react";
import { DateValue, Time } from "@internationalized/date";
import { fromDate, getLocalTimeZone } from "@internationalized/date";
import SensorSelectionModal from "./sensors/SensorSelectionModal";
import { SensorLocation } from "../../types/sensorLocation.ts";

export type PredefinedPeriod =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last14Days"
  | "last30Days"
  | "custom";

type DashboardFiltersProps = {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  currentDateRange: { start: Date; end: Date };
  onSensorsChange: (sensors: number[]) => void;
  onAggregationChange?: (aggregation: string) => void;
  hourRange: { start: Time; end: Time };
  onHourRangeChange: (start: Time, end: Time) => void;
  currentAggregation?: string;
  locations: SensorLocation[];
  currentSensors: number[];
  hideGroupBy?: boolean;
  hideAggregation?: boolean;
  showPredefinedPeriods?: boolean;
  currentPredefinedPeriod?: PredefinedPeriod;
  onPredefinedPeriodChange?: (period: PredefinedPeriod) => void;
  // Comparison props
  showComparison?: boolean;
  isComparisonEnabled?: boolean;
  onComparisonToggle?: (enabled: boolean) => void;
};

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onDateRangeChange,
  currentDateRange,
  onSensorsChange,
  // onAggregationChange, // Hidden aggregation functionality
  // currentAggregation,   // Hidden aggregation functionality
  // hourRange,
  // onHourRangeChange,
  locations,
  currentSensors,
  showPredefinedPeriods = false,
  currentPredefinedPeriod = "custom",
  onPredefinedPeriodChange,
  hideGroupBy = false,
  // Comparison props
  showComparison = false,
  isComparisonEnabled = false,
  onComparisonToggle,
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

  const [selectedPeriod, setSelectedPeriod] = useState<PredefinedPeriod>(
    currentPredefinedPeriod,
  );
  const [groupBy, setGroupBy] = useState<string>("day");
  // Aggregation state - hidden from UI but kept for potential future use
  // const [aggregation, setAggregation] = useState<string>(
  //   currentAggregation || "sum",
  // );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const getDateRangeForPeriod = (
    period: PredefinedPeriod,
  ): { start: Date; end: Date } => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (period) {
      case "today":
        return { start, end };
      case "yesterday":
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        return { start, end };
      case "last7Days":
        start.setDate(start.getDate() - 6);
        return { start, end };
      case "last14Days":
        start.setDate(start.getDate() - 13);
        return { start, end };
      case "last30Days":
        start.setDate(start.getDate() - 29);
        return { start, end };
      case "custom":
      default:
        return currentDateRange;
    }
  };

  const handlePredefinedPeriodChange = (keys: any) => {
    // Hero UI Select returns a Set of selected keys, we want the first (and only) value
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      const period = selectedKey as PredefinedPeriod;
      setSelectedPeriod(period);

      if (period !== "custom") {
        const dateRange = getDateRangeForPeriod(period);

        setStartDate(fromDate(dateRange.start, getLocalTimeZone()));
        setEndDate(fromDate(dateRange.end, getLocalTimeZone()));

        onDateRangeChange(dateRange.start, dateRange.end);

        if (onPredefinedPeriodChange) {
          onPredefinedPeriodChange(period);
        }
      }
    }
  };

  const handleStartDateChange = (value: DateValue | null) => {
    if (value) {
      setSelectedPeriod("custom");
      if (onPredefinedPeriodChange) {
        onPredefinedPeriodChange("custom");
      }

      setStartDate(value);
      if (endDate) {
        const startDateObj = value.toDate(getLocalTimeZone());
        startDateObj.setHours(0, 0, 0, 0);
        const endDateObj = endDate.toDate(getLocalTimeZone());
        onDateRangeChange(startDateObj, endDateObj);
      }
    }
  };

  const handleEndDateChange = (value: DateValue | null) => {
    if (value) {
      setSelectedPeriod("custom");
      if (onPredefinedPeriodChange) {
        onPredefinedPeriodChange("custom");
      }

      const now = new Date().setHours(23, 59, 59, 999);
      if (value.toDate(getLocalTimeZone()).getTime() > now) {
        return;
      }
      setEndDate(value);
      if (startDate) {
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

  const handleGroupByChange = (keys: any) => {
    // Hero UI Select returns a Set of selected keys, we want the first (and only) value
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      const newGroupBy = selectedKey as string;
      setGroupBy(newGroupBy);

      // Dispatch a custom event to notify the dashboard component
      const event = new CustomEvent("groupByChange", {
        detail: { groupBy: newGroupBy },
      });
      window.dispatchEvent(event);
    }
  };

  // Aggregation change handler - commented out since UI is hidden
  // const handleAggregationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const newAggregation = e.target.value;
  //   setAggregation(newAggregation);
  //   if (onAggregationChange) {
  //     onAggregationChange(newAggregation);
  //   }
  // };

  return (
    <div className="bg-white rounded-lg mb-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-end md:justify-start md:space-y-0 md:space-x-4">
        {/* Add predefined periods dropdown */}
        {showPredefinedPeriods && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("filters.predefinedPeriods")}
            </label>
            <Select
              className="w-full md:w-60"
              selectedKeys={new Set([selectedPeriod])}
              onSelectionChange={handlePredefinedPeriodChange}
              placeholder="Select time period"
              size="sm"
              variant="bordered"
              selectionMode="single"
              aria-label={t("filters.predefinedPeriods")}
            >
              <SelectItem key="today">
                {t("filters.periodOptions.today")}
              </SelectItem>
              <SelectItem key="yesterday">
                {t("filters.periodOptions.yesterday")}
              </SelectItem>
              <SelectItem key="last7Days">
                {t("filters.periodOptions.last7Days")}
              </SelectItem>
              <SelectItem key="last14Days">
                {t("filters.periodOptions.last14Days")}
              </SelectItem>
              <SelectItem key="last30Days">
                {t("filters.periodOptions.last30Days")}
              </SelectItem>
              <SelectItem key="custom">
                {t("filters.periodOptions.custom")}
              </SelectItem>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("filters.dateRange")}
          </label>
          <div className="flex items-center space-x-2">
            <DatePicker
              value={startDate}
              variant="bordered"
              granularity="day"
              size="sm"
              onChange={handleStartDateChange}
              className="w-full"
              aria-label="Start Date"
            />
            <span className="text-gray-500">{t("filters.to")}</span>
            <DatePicker
              value={endDate}
              variant="bordered"
              granularity="day"
              size="sm"
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
            size="sm"
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

        {!hideGroupBy && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("filters.groupBy")}
            </label>
            <Select
              className="w-full md:w-60"
              selectedKeys={new Set([groupBy])}
              onSelectionChange={handleGroupByChange}
              placeholder="Select time grouping"
              size="sm"
              variant="bordered"
              selectionMode="single"
              aria-label={t("filters.groupBy")}
            >
              <SelectItem key="5min">
                {t("filters.groupOptions.5min")}
              </SelectItem>
              <SelectItem key="10min">
                {t("filters.groupOptions.10min")}
              </SelectItem>
              <SelectItem key="15min">
                {t("filters.groupOptions.15min")}
              </SelectItem>
              <SelectItem key="30min">
                {t("filters.groupOptions.30min")}
              </SelectItem>
              <SelectItem key="hour">
                {t("filters.groupOptions.hour")}
              </SelectItem>
              <SelectItem key="day">{t("filters.groupOptions.day")}</SelectItem>
              <SelectItem key="week">
                {t("filters.groupOptions.week")}
              </SelectItem>
              <SelectItem key="month">
                {t("filters.groupOptions.month")}
              </SelectItem>
            </Select>
          </div>
        )}

        {showComparison && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("filters.comparison.toggle")}
            </label>
            <div className="flex items-center h-full">
              <Switch
                isSelected={isComparisonEnabled}
                onValueChange={onComparisonToggle}
                size="sm"
                color="primary"
                aria-label={t("filters.comparison.toggle")}
              ></Switch>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
