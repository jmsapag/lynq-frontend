import { useState } from "react";
import { Listbox, Menu } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  CalendarIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

interface DashboardFiltersProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onSensorsChange: (selectedSensors: string[]) => void;
  availableSensors: string[];
}

export const DashboardFilters = ({
  onDateRangeChange,
  onSensorsChange,
  availableSensors,
}: DashboardFiltersProps) => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      onDateRangeChange(new Date(start), new Date(end));
    }
  };

  const handleSensorsChange = (sensors: string[]) => {
    setSelectedSensors(sensors);
    onSensorsChange(sensors);
  };

  const buttonStyles =
    "relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left text-sm text-gray-600 border border-gray-200 hover:bg-gray-50";

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6">
      <div className="flex justify-end gap-4 items-center">
        <Menu as="div" className="relative w-64">
          <Menu.Button className={buttonStyles}>
            <span className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <span className="block truncate">
                {startDate && endDate
                  ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                  : t("dashboard.filters.selectDates")}
              </span>
            </span>
          </Menu.Button>

          <Menu.Items className="absolute left-0 z-10 mt-2 w-96 origin-top-left bg-white rounded-md border border-gray-200">
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-600">
                    {t("dashboard.filters.startDate")}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange(e.target.value, endDate)}
                    className="w-full rounded-md border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-600">
                    {t("dashboard.filters.endDate")}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                      handleDateChange(startDate, e.target.value)
                    }
                    className="w-full rounded-md border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>
          </Menu.Items>
        </Menu>

        <div className="w-64">
          <Listbox
            value={selectedSensors}
            onChange={handleSensorsChange}
            multiple
          >
            <div className="relative">
              <Listbox.Button className={buttonStyles}>
                <span className="block truncate">
                  {selectedSensors.length === 0
                    ? t("dashboard.filters.selectSensors")
                    : t("dashboard.filters.sensorsSelected", {
                        count: selectedSensors.length,
                      })}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 border border-gray-200">
                {availableSensors.map((sensor) => (
                  <Listbox.Option
                    key={sensor}
                    value={sensor}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm text-gray-600 ${
                        active ? "bg-gray-50" : ""
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                        >
                          {sensor}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>
      </div>
    </div>
  );
};
