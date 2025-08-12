import { useEffect, useState } from "react";
import {
  DashboardFilters,
  PredefinedPeriod,
} from "../components/dashboard/filter";
import { Time } from "@internationalized/date";
import { useSensorData } from "../hooks/useSensorData";
import { useSensorRecords } from "../hooks/useSensorRecords";
import { sensorResponse } from "../types/deviceResponse";
import { sensorMetadata } from "../types/sensorMetadata";
import { SensorRecordsFormData } from "../types/sensorRecordsFormData";
import { getFirstFetchedDateRange } from "../utils/dateUtils";
import { useOverviewMetrics } from "../hooks/dashboard/useOverviewMetrics";
import { MetricsCardGrid } from "../components/dashboard/overview/card-grid.tsx";
import { LoadingState } from "../components/loading/loading-state.tsx";

export const Overview: React.FC = () => {
  const GROUP_BY = "day";
  const AGGREGATION_TYPE = "sum";
  const [selectedPeriod, setSelectedPeriod] =
    useState<PredefinedPeriod>("last7Days");

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sensorMap, setSensorMap] = useState<Map<number, string>>(new Map());
  const {
    locations,
    loading: sensorsLoading,
    error: sensorsError,
  } = useSensorData();

  const [sensorRecordsFormData, setSensorRecordsFormData] =
    useState<SensorRecordsFormData>({
      sensorIds: [],
      fetchedDateRange: null,
      dateRange: getFirstFetchedDateRange(),
      hourRange: { start: new Time(0, 0), end: new Time(23, 59) },
      rawData: [],
      groupBy: GROUP_BY,
      aggregationType: AGGREGATION_TYPE,
      needToFetch: true,
    });

  const {
    data: sensorData,
    loading: dataLoading,
    error: dataError,
  } = useSensorRecords(sensorRecordsFormData, setSensorRecordsFormData);

  // Get calculated metrics using the custom hook
  const { metrics, getSensorDetails, sensorIdsList } = useOverviewMetrics(
    sensorData,
    sensorRecordsFormData.dateRange,
    sensorMap,
    locations || [],
  );

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      dateRange: { start: startDate, end: endDate },
      needToFetch: true,
    }));
  };

  const handlePredefinedPeriodChange = (period: PredefinedPeriod) => {
    setSelectedPeriod(period);
  };

  const handleSensorsChange = (sensors: number[]) => {
    setSensorRecordsFormData((prev: SensorRecordsFormData) => {
      return {
        ...prev,
        sensorIds: sensors
          .map((sensor) => {
            const sensorEntry = Array.from(sensorMap.entries()).find(
              ([id]) => id === sensor,
            );
            return sensorEntry ? sensorEntry[0] : null;
          })
          .filter((id): id is number => id !== null),
        needToFetch: true,
      };
    });
  };

  const handleAggregationChange = () => {};

  const handleRefreshData = () => {
    const now = new Date();
    localStorage.setItem("lastUpdated", now.toISOString());
    setLastUpdated(now);

    setSensorRecordsFormData((prev) => ({
      ...prev,
      dateRange: {
        start: prev.dateRange.start,
        end: new Date(),
      },
      needToFetch: true,
    }));
  };

  const handleHourRangeChange = (start: Time, end: Time) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      hourRange: { start, end },
      needToFetch: true,
    }));
  };

  // Effect to handle initial sensor IDs
  useEffect(() => {
    if (locations && locations.length > 0) {
      const allSensorIds = locations.flatMap((location) =>
        location.sensors.map((sensor) => sensor.id),
      );

      setSensorRecordsFormData((prev) => ({
        ...prev,
        sensorIds: allSensorIds,
        needToFetch: true,
      }));
    }
  }, [locations]);

  // Effect to build sensor map
  useEffect(() => {
    const newSensorMap = new Map<number, string>();
    locations?.forEach((location: sensorResponse) => {
      location.sensors.forEach((sensor: sensorMetadata) => {
        newSensorMap.set(sensor.id, sensor.position);
      });
    });
    setSensorMap(newSensorMap);
  }, [locations]);

  // Effect to load last updated time from localStorage
  useEffect(() => {
    const storedLastUpdated = localStorage.getItem("lastUpdated");
    if (storedLastUpdated) {
      setLastUpdated(new Date(storedLastUpdated));
    }
  }, []);

  const isLoading = sensorsLoading || dataLoading;
  const hasError = sensorsError || dataError;

  return (
    <div className="space-y-6">
      <DashboardFilters
        onDateRangeChange={handleDateRangeChange}
        currentDateRange={sensorRecordsFormData.dateRange}
        onSensorsChange={handleSensorsChange}
        currentSensors={sensorRecordsFormData.sensorIds?.map((id) => id) || []}
        hourRange={sensorRecordsFormData.hourRange}
        onHourRangeChange={handleHourRangeChange}
        onAggregationChange={handleAggregationChange}
        onRefreshData={handleRefreshData}
        locations={locations}
        lastUpdated={lastUpdated}
        hideGroupBy={true}
        hideAggregation={true}
        showPredefinedPeriods={true}
        currentPredefinedPeriod={selectedPeriod}
        onPredefinedPeriodChange={handlePredefinedPeriodChange}
      />

      <LoadingState isLoading={isLoading} hasError={hasError} />

      {!isLoading && !hasError && (
        <div className="mt-4">
          <MetricsCardGrid
            metrics={metrics}
            dateRange={sensorRecordsFormData.dateRange}
            sensorIdsList={sensorIdsList}
            getSensorDetails={getSensorDetails}
          />
        </div>
      )}
    </div>
  );
};

export default Overview;
