// src/pages/layout-dashboard.tsx
import React, { useEffect, useState, useMemo } from "react";
import { DashboardFilters } from "../components/dashboard/filter";
import { LayoutDashboard } from "../components/dashboard/layout-dashboard/LayoutDashboard";
import { useSensorData } from "../hooks/useSensorData";
import { useSensorRecords } from "../hooks/useSensorRecords";
import { sensorResponse } from "../types/deviceResponse";
import { sensorMetadata } from "../types/sensorMetadata";
import {
  GroupByTimeAmount,
  AggregationType,
} from "../types/sensorDataResponse";
import { SensorRecordsFormData } from "../types/sensorRecordsFormData";
import { Time } from "@internationalized/date";

function getFirstFetchedDateRange() {
  return {
    start: new Date(new Date().setDate(new Date().getDate() - 14)), // 14 days ago
    end: new Date(), // today
  };
}

const LayoutDashboardPage: React.FC = () => {
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

    const totalIn = sensorData.in.reduce((sum: number, value: number) => sum + value, 0);
    const totalOut = sensorData.out.reduce((sum: number, value: number) => sum + value, 0);

    const totalMovements = totalIn + totalOut;

    const entryRate =
      totalMovements > 0 ? Math.round((totalIn / totalMovements) * 100) : 0;

    return { totalIn, totalOut, entryRate };
  }, [sensorData]);

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
      ...prev,
      dateRange: { start: startDate, end: endDate },
    }));
  };

  const handleHourRangeChange = (start: Time, end: Time) => {
    setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
      ...prev,
      hourRange: { start, end },
    }));
  };

  const handleRefreshData = async () => {
    setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
      ...prev,
      needToFetch: true,
    }));
    setLastUpdated(new Date());
  };

  // Handle custom events for groupBy changes
  useEffect(() => {
    const handleGroupByChangeFromFilter = (event: Event) => {
      const customEvent = event as CustomEvent<{ groupBy: string }>;
      setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
        ...prev,
        groupBy: customEvent.detail.groupBy as GroupByTimeAmount,
      }));
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
      };
    });
  };

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
    setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
      ...prev,
      aggregationType: aggregation as AggregationType,
    }));
  };

  // Handle loading states
  const isLoading = sensorsLoading || dataLoading;
  const hasError = !!(sensorsError || dataError);

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
      values: sensorData.in.map((value: number, index: number) => ({
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
          sensorRecordsFormData.sensorIds?.map((id: number) => id) || []
        }
        hourRange={sensorRecordsFormData.hourRange}
        onHourRangeChange={handleHourRangeChange}
        onAggregationChange={handleAggregationChange}
        onRefreshData={handleRefreshData}
        locations={locations}
        lastUpdated={lastUpdated}
      />

      <LayoutDashboard
        metrics={metrics}
        chartData={chartData}
        sensorData={sensorData}
        sensorRecordsFormData={sensorRecordsFormData}
        isLoading={isLoading}
        hasError={hasError}
      />
    </div>
  );
};

export default LayoutDashboardPage;
