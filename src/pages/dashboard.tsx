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
} from "../types/sensorDataResponse";
import { LineChart } from "../components/dashboard/charts/line-chart.tsx";
import { EntryRateChart } from "../components/dashboard/charts/entry-rate/entry-rate-chart.tsx";
import { SensorDataCard } from "../components/dashboard/charts/card.tsx";
import { SensorRecordsFormData } from "../types/sensorRecordsFormData";
import { Time } from "@internationalized/date";
import { ChartHeatMap } from "../components/dashboard/charts/heat-map/chart-heat-map.tsx";

function getFirstFetchedDateRange() {
  return {
    start: new Date(new Date().setDate(new Date().getDate() - 14)), // 14 days ago
    end: new Date(), // today
  };
}

const Dashboard = () => {
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
      groupBy: "day",
      aggregationType: "sum",
      needToFetch: true,
    });

  // Use the sensor records hook
  const {
    data: sensorData,
    loading: dataLoading,
    error: dataError,
  } = useSensorRecords(sensorRecordsFormData, setSensorRecordsFormData);

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
    setSensorRecordsFormData((prev) => ({
      ...prev,
      dateRange: { start: startDate, end: endDate },
    }));
  };

  const handleSensorsChange = (sensors: string[]) => {
    setSensorRecordsFormData((prev: SensorRecordsFormData) => {
      return {
        ...prev,
        sensorIds: sensors
          .map((sensor) => {
            const sensorEntry = Array.from(sensorMap.entries()).find(
              ([, position]) => position === sensor,
            );
            return sensorEntry ? sensorEntry[0] : null;
          })
          .filter((id): id is number => id !== null), // Filter out null values
      };
    });
  };
  useEffect(() => {}, [sensorRecordsFormData]);

  useEffect(() => {
    const newSensorMap = new Map<number, string>();
    locations?.forEach((location: sensorResponse) => {
      location.sensors.forEach((sensor: sensorMetadata) => {
        newSensorMap.set(sensor.id, sensor.position);
      });
    });
    setSensorMap(newSensorMap);
  }, [locations]);

  const handleAggregationChange = (aggregation: string) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      aggregationType: aggregation as AggregationType,
    }));
  };

  const handleGroupByChange = (groupByValue: string) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      groupBy: groupByValue as GroupByTimeAmount,
    }));
  };

  const handleRefreshData = () => {
    const now = new Date();
    localStorage.setItem("lastUpdated", now.toISOString());
    setLastUpdated(now);

    setSensorRecordsFormData((prev) => ({
      ...prev,
      dateRange: {
        start: prev.dateRange.start,
        end: new Date(), // today
      },
    }));
  };

  const handleHourRangeChange = (start: Time, end: Time) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      hourRange: { start, end },
    }));
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

  return (
    <div className="space-y-6">
      <DashboardFilters
        onDateRangeChange={handleDateRangeChange}
        currentDateRange={sensorRecordsFormData.dateRange}
        onSensorsChange={handleSensorsChange}
        currentSensors={
          sensorRecordsFormData.sensorIds?.map((id) => sensorMap.get(id)!) || []
        }
        hourRange={sensorRecordsFormData.hourRange}
        onHourRangeChange={handleHourRangeChange}
        onAggregationChange={handleAggregationChange}
        onRefreshData={handleRefreshData}
        locations={locations}
        lastUpdated={lastUpdated}
      />
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Spinner size="lg" />
        </div>
      ) : hasError ? (
        <div className="flex items-center justify-center h-screen text-red-500">
          Error loading data. Please try again.
        </div>
      ) : (
        <>
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
                <LineChart
                  data={chartData}
                  groupBy={sensorRecordsFormData.groupBy}
                />
              )}
            </ChartCard>

            <ChartCard
              title="Traffic Heatmap (By Day & Hour)"
              translationKey="dashboard.charts.trafficHeatmap"
            >
              {chartData.categories.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No data available. Please select sensors and date range.
                </div>
              ) : (
                <ChartHeatMap data={sensorData} />
              )}
            </ChartCard>

            <ChartCard
              title="Entry Rate Over Time"
              translationKey="dashboard.charts.entryRateOverTime"
            >
              {chartData.categories.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No data available. Please select sensors and date range.
                </div>
              ) : (
                <EntryRateChart
                  data={chartData}
                  groupBy={sensorRecordsFormData.groupBy}
                />
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
