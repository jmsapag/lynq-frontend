import React, { useState, useRef, useEffect } from "react";
import { ArrowPathIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { DatePicker, TimeInput } from "@heroui/react";
import { DateValue } from "@internationalized/date";
import { fromDate, getLocalTimeZone, parseTime } from "@internationalized/date";

type DashboardFiltersProps = {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  currentDateRange: { start: Date; end: Date };
  onSensorsChange: (sensors: string[]) => void;
  onAggregationChange?: (aggregation: string) => void;
  onRefreshData?: () => void;
  availableSensors: string[];
  currentSensors: string[];
  lastUpdated: Date | null;
};

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onDateRangeChange,
  currentDateRange,
  onSensorsChange,
  onAggregationChange,
  onRefreshData,
  availableSensors,
  currentSensors,
  lastUpdated,
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

  const [selectedSensors, setSelectedSensors] = useState<string[]>(currentSensors || []);
  const [startTime, setStartTime] = useState<TimeValue>(() =>
    parseTime("00:00"),
  );
  const [endTime, setEndTime] = useState<TimeValue>(() => parseTime("23:59"));
  const [groupBy, setGroupBy] = useState<string>("day");
  const [aggregation, setAggregation] = useState<string>("none");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (value.toDate(getLocalTimeZone()).getTime() >now) {
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

  const handleSensorToggle = (sensor: string) => {
    const updatedSensors = selectedSensors.includes(sensor)
      ? selectedSensors.filter((s) => s !== sensor)
      : [...selectedSensors, sensor];

    setSelectedSensors(updatedSensors);
    onSensorsChange(updatedSensors);
  };

  const handleStartTimeChange = (value: TimeValue | null) => {
    if (value) {
      setStartTime(value);
    }
  };

  const handleEndTimeChange = (value: TimeValue | null) => {
    if (value) {
      setEndTime(value);
    }
  };

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getSensorButtonText = () => {
    if (selectedSensors.length === 0) {
      return t("filters.selectSensors");
    } else if (selectedSensors.length === 1) {
      return selectedSensors[0];
    } else if (selectedSensors.length === availableSensors.length) {
      return t("filters.allSensors");
    } else {
      return t("filters.sensorsSelected", { count: selectedSensors.length });
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

          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700">
              {t("filters.sensors")}
            </label>
            <button
              type="button"
              className="flex justify-between items-center w-full md:w-60 px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="truncate">{getSensorButtonText()}</span>
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                <div className="py-1">
                  {availableSensors.map((sensor) => (
                    <div
                      key={sensor}
                      className="px-3 py-2 flex items-center hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSensorToggle(sensor)}
                    >
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                          checked={selectedSensors.includes(sensor)}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <label className="ml-2 block text-sm text-gray-900 cursor-pointer">
                        {sensor}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:space-x-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("filters.timeRange")}
            </label>
            <div className="flex items-center space-x-2">
              <TimeInput
                value={startTime}
                variant="bordered"
                onChange={handleStartTimeChange}
                className="w-full"
              />
              <span className="text-gray-500">{t("filters.to")}</span>
              <TimeInput
                value={endTime}
                variant="bordered"
                onChange={handleEndTimeChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("filters.groupBy")}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("filters.aggregation")}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              value={aggregation}
              onChange={handleAggregationChange}
            >
              <option value="none">
                {t("filters.aggregationOptions.none")}
              </option>
              <option value="sum">{t("filters.aggregationOptions.sum")}</option>
              <option value="avg">{t("filters.aggregationOptions.avg")}</option>
              <option value="min">{t("filters.aggregationOptions.min")}</option>
              <option value="max">{t("filters.aggregationOptions.max")}</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-500 text-center mb-2">
              {t("filters.lastUpdated")}: {formatLastUpdated()}
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
