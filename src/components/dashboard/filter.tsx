import React, { useState, useRef, useEffect } from "react";
import { ArrowPathIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

type DashboardFiltersProps = {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onSensorsChange: (sensors: string[]) => void;
  onRefreshData?: () => void;
  availableSensors: string[];
};

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onDateRangeChange,
  onSensorsChange,
  onRefreshData,
  availableSensors,
}) => {
  const { t } = useTranslation();

  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 7)),
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("23:59");
  const [groupBy, setGroupBy] = useState<string>("day");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setStartDate(date);
    if (endDate) {
      onDateRangeChange(date, endDate);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setEndDate(date);
    if (startDate) {
      onDateRangeChange(startDate, date);
    }
  };

  const handleSensorToggle = (sensor: string) => {
    const updatedSensors = selectedSensors.includes(sensor)
      ? selectedSensors.filter((s) => s !== sensor)
      : [...selectedSensors, sensor];

    setSelectedSensors(updatedSensors);
    onSensorsChange(updatedSensors);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };

  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupBy(e.target.value);
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:space-x-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("filters.dateRange")}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                value={format(startDate, "yyyy-MM-dd")}
                onChange={handleStartDateChange}
              />
              <span className="text-gray-500">{t("filters.to")}</span>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                value={format(endDate, "yyyy-MM-dd")}
                onChange={handleEndDateChange}
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
                          onChange={() => {}} // La acción ya está en el onClick del div
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
              <input
                type="time"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                value={startTime}
                onChange={handleStartTimeChange}
              />
              <span className="text-gray-500">{t("filters.to")}</span>
              <input
                type="time"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                value={endTime}
                onChange={handleEndTimeChange}
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

          <button
            onClick={handleRefresh}
            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            {t("filters.refresh")}
          </button>
        </div>
      </div>
    </div>
  );
};
