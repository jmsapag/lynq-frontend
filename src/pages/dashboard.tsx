import { ChartCard } from "../components/dashboard/charts/chart-card.tsx";
import { Spinner } from "@heroui/react";
import { DashboardFilters } from "../components/dashboard/filter.tsx";
import { useEffect, useState, useMemo } from "react";
import { useSensorData } from "../hooks/useSensorData.ts";
import { useSensorRecords } from "../hooks/useSensorRecords.ts";
import { sensorResponse } from "../types/deviceResponse";
import { sensorMetadata } from "../types/sensorMetadata";
import {
  GroupByTimeAmount,
  AggregationType,
  SensorDataPoint,
} from "../types/sensorDataResponse";
import { LineChart } from "../components/dashboard/charts/line-chart.tsx";
import { SensorDataCard } from "../components/dashboard/charts/card.tsx";

const Dashboard = () => {
  const {
    sensors,
    loading: sensorsLoading,
    error: sensorsError,
  } = useSensorData();

  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date;
    end: Date;
  }>(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date();
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);

    return { start, end };
  });
  const [fetchedDateRange, setFetchedDateRange] = useState<{start: Date; end: Date} | null>(null);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [selectedAggregation, setSelectedAggregation] =
    useState<AggregationType>("none");
  const [groupBy, setGroupBy] = useState<GroupByTimeAmount>("day");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [rawData, setRawData] = useState<SensorDataPoint[]>([]);
  const [needToFetch, setNeedToFetch] = useState(false);
  // Convert selected sensors from strings to numbers
  const selectedSensorIds = useMemo(() => {
    if (sensors && sensors.length > 0) {
      const selected = selectedSensors
        .map((sensorPosition) => {
          // Find the sensor ID by position
          for (const device of sensors) {
            for (const sensor of device.sensors) {
              if (sensor.position === sensorPosition) {
                return sensor.id;
              }
            }
          }
          return 0; // Default value if not found
        })
        .filter((id) => id !== 0); // Remove any not found
      setFetchedDateRange(null);
      setRawData([]);

      if (selected) {
        return selected;
      }
    }
    return [];
  }, [selectedSensors, sensors]);

  // Use the sensor records hook
  const {
    data: sensorData,
    loading: dataLoading,
    error: dataError,
  } = useSensorRecords({
    sensorIds: selectedSensorIds,
    dateRange: selectedDateRange,
    rawData,
    setRawData,
    needToFetch,
    setNeedToFetch,
    currentFetchedDateRange: fetchedDateRange,
    setFetchedDateRange: setFetchedDateRange,
    groupBy,
    aggregationType: selectedAggregation,
  });

  const metrics = useMemo(() => {
    if (!sensorData || !sensorData.in || !sensorData.out) {
      return {
        totalIn: 0,
        totalOut: 0,
        entryRate: 0,
      };
    }

    const totalIn = sensorData.in.reduce((sum, value) => sum + value, 0);
    const totalOut = sensorData.out.reduce((sum, value) => sum + value, 0);

    const totalMovements = totalIn + totalOut;

    const entryRate =
      totalMovements > 0 ? Math.round((totalIn / totalMovements) * 100) : 0;

    return { totalIn, totalOut, entryRate };
  }, [sensorData]);

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setSelectedDateRange({ start: startDate, end: endDate });
  };

  const handleSensorsChange = (sensors: string[]) => {
    setSelectedSensors(sensors);
  };

  const handleAggregationChange = (aggregation: string) => {
    setSelectedAggregation(aggregation as AggregationType);
  };

  const handleGroupByChange = (groupByValue: string) => {
    setGroupBy(groupByValue as GroupByTimeAmount);
  };

  const handleRefreshData = () => {
    const now = new Date();
    localStorage.setItem("lastUpdated", now.toISOString());
    setLastUpdated(now);

    if (selectedDateRange) {
      const refreshedRange = {
        start: new Date(selectedDateRange.start.getTime()),
        end: new Date(selectedDateRange.end.getTime()),
      };
      setSelectedDateRange(refreshedRange);
    }
  };

  useEffect(() => {
    const storedLastUpdated = localStorage.getItem("lastUpdated");
    if (storedLastUpdated) {
      setLastUpdated(new Date(storedLastUpdated));
    }
  }, []);

  // Listen for groupBy changes from the filter component
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

  // Handle loading states
  const isLoading = sensorsLoading || dataLoading;
  const hasError = sensorsError || dataError;

  // Prepare chart data from sensor data
  const chartData = useMemo(() => {
    if (
      !sensorData ||
      !sensorData.timestamps ||
      sensorData.timestamps.length === 0
    ) {
      return {
        categories: [],
        values: [],
      };
    }

    return {
      categories: sensorData.timestamps,
      values: sensorData.in.map((value, index) => ({
        in: value,
        out: sensorData.out[index],
      })),
    };
  }, [sensorData]);

  return isLoading ? (
    <div className="flex items-center justify-center h-screen">
      <Spinner size="lg"/>
    </div>
  ) : hasError ? (
    <div className="flex items-center justify-center h-screen text-red-500">
      Error loading data. Please try again.
    </div>
  ) : (
    <div className="space-y-6">
      <DashboardFilters
        onDateRangeChange={handleDateRangeChange}
        currentDateRange={selectedDateRange}
        onSensorsChange={handleSensorsChange}
        currentSensors={selectedSensors}
        onAggregationChange={handleAggregationChange}
        onRefreshData={handleRefreshData}
        availableSensors={sensors.flatMap((s: sensorResponse): string[] =>
          s.sensors.flatMap((m: sensorMetadata): string => m.position),
        )}
        lastUpdated={lastUpdated}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SensorDataCard
          title="Total In"
          value={metrics.totalIn}
          translationKey="dashboard.metrics.totalIn"
          unit="people"
        />

        <SensorDataCard
          title="Total Out"
          value={metrics.totalOut}
          translationKey="dashboard.metrics.totalOut"
          unit="people"
        />

        <SensorDataCard
          title="Entry Rate"
          value={metrics.entryRate}
          translationKey="dashboard.metrics.entryRate"
          unit="%"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard
          title="Flujo de Personas (In/Out)"
          translationKey="dashboard.charts.peopleFlow"
        >
          {chartData.categories.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available. Please select sensors and date range.
            </div>
          ) : (
            <LineChart data={chartData}/>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
