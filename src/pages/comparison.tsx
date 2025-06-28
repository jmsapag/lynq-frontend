import { ChartCard } from "../components/dashboard/charts/chart-card";
import { DashboardFilters } from "../components/dashboard/filter";
import { useEffect, useState, useMemo } from "react";
import { useSensorData } from "../hooks/useSensorData";
import { useSensorRecords } from "../hooks/useSensorRecords.ts";
import { sensorResponse } from "../types/deviceResponse";
import { sensorMetadata } from "../types/sensorMetadata";
import {
  GroupByTimeAmount,
  AggregationType,
} from "../types/sensorDataResponse";
import { SensorRecordsFormData } from "../types/sensorRecordsFormData";
import { Time } from "@internationalized/date";
import { Spinner, addToast } from "@heroui/react";
import { DeviceComparisonChart } from "../components/dashboard/charts/device-comparison.tsx";

function getFirstFetchedDateRange() {
  return {
    start: new Date(new Date().setDate(new Date().getDate() - 14)),
    end: new Date(),
  };
}

const MAX_SENSORS = 20;

const getInitialFormData = (): SensorRecordsFormData => ({
  sensorIds: [],
  fetchedDateRange: null,
  dateRange: getFirstFetchedDateRange(),
  hourRange: { start: new Time(0, 0), end: new Time(23, 59) },
  rawData: [],
  groupBy: "day",
  aggregationType: "sum",
  needToFetch: true,
});

const Comparison = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sensorMap, setSensorMap] = useState<Map<number, { position: string, locationName: string }>>(new Map());
  const {
    locations,
    loading: sensorsLoading,
    error: sensorsError,
  } = useSensorData();

  const [selectedSensorIds, setSelectedSensorIds] = useState<number[]>([]);

  const [formDataArr, setFormDataArr] = useState<SensorRecordsFormData[]>(
    Array(MAX_SENSORS).fill(null).map(getInitialFormData),
  );

  useEffect(() => {
    setFormDataArr((prevArr) =>
      Array(MAX_SENSORS)
        .fill(null)
        .map((_, idx) => {
          const sensorId = selectedSensorIds[idx];
          if (sensorId !== undefined) {
            return {
              ...prevArr[idx],
              sensorIds: [sensorId],
              needToFetch: true,
            };
          }
          return getInitialFormData();
        }),
    );
  }, [selectedSensorIds]);

  const sensorResults = formDataArr.map((formData, idx) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSensorRecords(formData, (updater) =>
      setFormDataArr((prevArr) => {
        const newArr = [...prevArr];
        newArr[idx] =
          typeof updater === "function" ? updater(prevArr[idx]) : updater;
        return newArr;
      }),
    ),
  );

  const { inChartData, outChartData } = useMemo(() => {
    const validResults = sensorResults
      .map((result, idx) =>
        selectedSensorIds[idx] !== undefined
          ? { sensorId: selectedSensorIds[idx], ...result }
          : null,
      )
      .filter((result): result is NonNullable<typeof result> =>
        Boolean(result),
      );

    if (validResults.length === 0) {
      return {
        inChartData: { categories: [], devices: [] },
        outChartData: { categories: [], devices: [] },
      };
    }

    const firstWithData = validResults.find(
      (r) => r?.data?.timestamps && r.data.timestamps.length > 0,
    );
    if (!firstWithData || !firstWithData.data?.timestamps) {
      return {
        inChartData: { categories: [], devices: [] },
        outChartData: { categories: [], devices: [] },
      };
    }
    const categories = firstWithData.data.timestamps;

    // Find duplicate position names across different locations
    const positionCounts = new Map<string, number>();
    validResults.forEach(result => {
      const sensorInfo = sensorMap.get(result.sensorId);
      if (sensorInfo) {
        const position = sensorInfo.position;
        positionCounts.set(position, (positionCounts.get(position) || 0) + 1);
      }
    });

    const inDevices = validResults
      .filter((r) => r?.data?.in && r.data.in.length > 0)
      .map((r) => {
        const sensorInfo = sensorMap.get(r.sensorId);
        let name = `Sensor ${r.sensorId}`;

        if (sensorInfo) {
          // Only include location name if there are multiple sensors with the same position
          name = (positionCounts.get(sensorInfo.position) || 0) > 1
            ? `${sensorInfo.position} (${sensorInfo.locationName})`
            : sensorInfo.position;
        }

        return {
          name,
          values: r.data.in,
        };
      });

    const outDevices = validResults
      .filter((r) => r?.data?.out && r.data.out.length > 0)
      .map((r) => {
        const sensorInfo = sensorMap.get(r.sensorId);
        let name = `Sensor ${r.sensorId}`;

        if (sensorInfo) {
          // Only include location name if there are multiple sensors with the same position
          name = (positionCounts.get(sensorInfo.position) || 0) > 1
            ? `${sensorInfo.position} (${sensorInfo.locationName})`
            : sensorInfo.position;
        }

        return {
          name,
          values: r.data.out,
        };
      });

    return {
      inChartData: { categories, devices: inDevices },
      outChartData: { categories, devices: outDevices },
    };
  }, [sensorResults, selectedSensorIds, sensorMap]);

  const dataLoading = sensorResults.some(
    (result, idx) => selectedSensorIds[idx] !== undefined && result.loading,
  );
  const dataError = sensorResults.find((result) => result.error)?.error || null;

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setFormDataArr((prevArr) =>
      prevArr.map((formData) => ({
        ...formData,
        dateRange: { start: startDate, end: endDate },
        needToFetch: true,
      })),
    );
  };

  const handleSensorsChange = (sensors: number[]) => {
    if (sensors.length > MAX_SENSORS) {
      addToast({
        title: "Too many sensors selected",
        description: `You can only compare up to ${MAX_SENSORS} sensor${MAX_SENSORS > 1 ? "s" : ""}.`,
        severity: "warning",
        color: "warning",
      });
      return;
    }

    setSelectedSensorIds(
      sensors
        .map((sensor) => {
          const entry = Array.from(sensorMap.entries()).find(
            ([id]) => id === sensor,
          );
          return entry ? entry[0] : null;
        })
        .filter((id): id is number => id !== null),
    );
  };

  useEffect(() => {
    const newSensorMap = new Map<number, { position: string, locationName: string }>();
    locations?.forEach((location: sensorResponse) => {
      location.sensors.forEach((sensor: sensorMetadata) => {
        newSensorMap.set(sensor.id, {
          position: sensor.position,
          locationName: location.name
        });
      });
    });
    setSensorMap(newSensorMap);
  }, [locations]);

  const handleAggregationChange = (aggregation: string) => {
    setFormDataArr((prevArr) =>
      prevArr.map((formData) => ({
        ...formData,
        aggregationType: aggregation as AggregationType,
        needToFetch: true,
      })),
    );
  };

  const handleGroupByChange = (groupByValue: string) => {
    setFormDataArr((prevArr) =>
      prevArr.map((formData) => ({
        ...formData,
        groupBy: groupByValue as GroupByTimeAmount,
        needToFetch: true,
      })),
    );
  };

  const handleRefreshData = () => {
    const now = new Date();
    localStorage.setItem("lastUpdated", now.toISOString());
    setLastUpdated(now);
    setFormDataArr((prevArr) =>
      prevArr.map((formData) => ({
        ...formData,
        dateRange: {
          start: formData.dateRange.start,
          end: new Date(),
        },
        needToFetch: true,
      })),
    );
  };

  const handleHourRangeChange = (start: Time, end: Time) => {
    setFormDataArr((prevArr) =>
      prevArr.map((formData) => ({
        ...formData,
        hourRange: { start, end },
        needToFetch: true,
      })),
    );
  };

  useEffect(() => {
    const storedLastUpdated = localStorage.getItem("lastUpdated");
    if (storedLastUpdated) {
      setLastUpdated(new Date(storedLastUpdated));
    }
  }, []);

  useEffect(() => {
    const handleGroupByChangeFromFilter = (e: CustomEvent) => {
      if (e.detail && e.detail.groupBy) {
        handleGroupByChange(e.detail.groupBy);
      }
    };
    window.addEventListener(
      "groupByChange",
      handleGroupByChangeFromFilter as EventListener,
    );
    return () => {
      window.removeEventListener(
        "groupByChange",
        handleGroupByChangeFromFilter as EventListener,
      );
    };
  }, []);

  const isLoading = sensorsLoading || dataLoading;
  const hasError = sensorsError || dataError;

  return isLoading ? (
    <div className="flex items-center justify-center h-screen">
      <Spinner size="lg" />
    </div>
  ) : hasError ? (
    <div className="flex items-center justify-center h-screen text-red-500">
      Error loading data. Please try again.
    </div>
  ) : (
    <div className="space-y-6">
      <DashboardFilters
        onDateRangeChange={handleDateRangeChange}
        currentDateRange={formDataArr[0].dateRange}
        onSensorsChange={handleSensorsChange}
        currentSensors={selectedSensorIds.map(
          (id) => id || 999, // Fallback to 999 if undefined
        )}
        hourRange={formDataArr[0].hourRange}
        onHourRangeChange={handleHourRangeChange}
        onAggregationChange={handleAggregationChange}
        onRefreshData={handleRefreshData}
        locations={locations}
        lastUpdated={lastUpdated}
      />
      <div className="grid grid-cols-1 gap-6">
        <ChartCard
          title="Device Comparison (Entries)"
          translationKey="comparison.charts.deviceComparisonIn"
        >
          {inChartData.categories.length === 0 ||
          inChartData.devices.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available. Please select sensors and date range.
            </div>
          ) : (
            <DeviceComparisonChart data={inChartData} className="h-[300px]" />
          )}
        </ChartCard>
        <ChartCard
          title="Device Comparison (Exits)"
          translationKey="comparison.charts.deviceComparisonOut"
        >
          {outChartData.categories.length === 0 ||
          outChartData.devices.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available. Please select sensors and date range.
            </div>
          ) : (
            <DeviceComparisonChart data={outChartData} className="h-[300px]" />
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default Comparison;
