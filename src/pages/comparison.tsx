import { ChartCard } from "../components/dashboard/charts/chart-card";
import { DashboardFilters } from "../components/dashboard/filter";
import { useEffect, useState, useMemo } from "react";
import { useSensorData } from "../hooks/useSensorData";
import { useSensorComparisonData } from "../hooks/useSensorComparisonData";
import { sensorResponse } from "../types/deviceResponse";
import { sensorMetadata } from "../types/sensorMetadata";
import {
  GroupByTimeAmount,
  AggregationType,
} from "../types/sensorDataResponse";
import { BaseChart } from "../components/dashboard/charts/base-chart";
import type { EChartsOption } from "echarts";

// Device Comparison Chart Component for In/Out values
const DeviceComparisonChart: React.FC<{
  data: {
    timestamps: string[];
    devices: {
      name: string;
      values: number[];
    }[];
  };
  title: string;
  className?: string;
}> = ({ data, className }) => {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    legend: {
      data: data.devices.map((device) => device.name),
    },
    xAxis: {
      type: "category",
      data: data.timestamps,
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
        moveOnMouseMove: true,
      },
    ],
    series: data.devices.map((device) => ({
      name: device.name,
      type: "line",
      data: device.values,
      smooth: true,
    })),
  };

  return <BaseChart option={option} className={className || "h-full"} />;
};

// Loading Spinner Component
const Spinner: React.FC<{ size?: string }> = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }[size] || "w-8 h-8";

  return (
      <div className="flex justify-center">
        <div className={`animate-spin rounded-full border-t-2 border-blue-500 border-opacity-50 ${sizeClasses}`}></div>
      </div>
  );
};

const Comparison = () => {
  const {
    sensors,
    loading: sensorsLoading,
    error: sensorsError,
  } = useSensorData();

  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date;
    end: Date;
  } | null>(() => {
    // Set end date to the end of the current day to avoid time-based variations
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date();
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);

    return { start, end };
  });
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [selectedAggregation, setSelectedAggregation] =
      useState<AggregationType>("none");
  const [groupBy, setGroupBy] = useState<GroupByTimeAmount>("day");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Convert selected sensors from strings to numbers and get their names
  const selectedSensorInfo = useMemo(() => {
    const ids: number[] = [];
    const names: string[] = [];

    selectedSensors.forEach((sensorPosition) => {
      // Find the sensor ID by position
      if (sensors) {
        for (const device of sensors) {
          for (const sensor of device.sensors) {
            if (sensor.position === sensorPosition) {
              ids.push(sensor.id);
              names.push(sensorPosition); // Using position as the display name
              break;
            }
          }
        }
      }
    });

    return { ids, names };
  }, [selectedSensors, sensors]);

  // Use the sensor comparison data hook
  const {
    data: sensorComparisonData,
    loading: dataLoading,
    error: dataError,
    refetch: refetchSensorData,
  } = useSensorComparisonData({
    sensorIds: selectedSensorInfo.ids,
    sensorNames: selectedSensorInfo.names,
    dateRange: selectedDateRange,
    groupBy,
    aggregationType: selectedAggregation,
  });

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setSelectedDateRange({ start: startDate, end: endDate });
  };

  const handleSensorsChange = (sensors: string[]) => {
    setSelectedSensors(sensors);
  };

  const handleAggregationChange = (aggregation: string) => {
    setSelectedAggregation(aggregation as AggregationType);
  };

  const handleRefreshData = () => {
    const now = new Date();
    localStorage.setItem("lastUpdated", now.toISOString());
    setLastUpdated(now);

    // Refetch sensor data
    refetchSensorData();
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
        setGroupBy(e.detail.groupBy as GroupByTimeAmount);
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

  // Prepare chart data for in comparison
  const inChartData = useMemo(() => {
    if (
        !sensorComparisonData?.timestamps ||
        sensorComparisonData.timestamps.length === 0
    ) {
      return {
        timestamps: [],
        devices: [],
      };
    }

    return {
      timestamps: sensorComparisonData.timestamps,
      devices: sensorComparisonData.sensorsData.map((sensor) => ({
        name: sensor.name,
        values: sensor.inValues,
      })),
    };
  }, [sensorComparisonData]);

  // Prepare chart data for out comparison
  const outChartData = useMemo(() => {
    if (
        !sensorComparisonData?.timestamps ||
        sensorComparisonData.timestamps.length === 0
    ) {
      return {
        timestamps: [],
        devices: [],
      };
    }

    return {
      timestamps: sensorComparisonData.timestamps,
      devices: sensorComparisonData.sensorsData.map((sensor) => ({
        name: sensor.name,
        values: sensor.outValues,
      })),
    };
  }, [sensorComparisonData]);

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
            onSensorsChange={handleSensorsChange}
            onAggregationChange={handleAggregationChange}
            onRefreshData={handleRefreshData}
            availableSensors={sensors?.flatMap((s: sensorResponse): string[] =>
                s.sensors.flatMap((m: sensorMetadata): string => m.position)
            ) || []}
            lastUpdated={lastUpdated}
        />

        <div className="grid grid-cols-1 gap-6">
          <ChartCard
              title="Device Comparison (Entries)"
              translationKey="comparison.charts.deviceComparisonIn"
          >
            {inChartData.timestamps.length === 0 ||
            inChartData.devices.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No data available. Please select sensors and date range.
                </div>
            ) : (
                <DeviceComparisonChart
                    data={inChartData}
                    title="Device Comparison (Entries)"
                    className="h-[300px]"
                />
            )}
          </ChartCard>

          <ChartCard
              title="Device Comparison (Exits)"
              translationKey="comparison.charts.deviceComparisonOut"
          >
            {outChartData.timestamps.length === 0 ||
            outChartData.devices.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No data available. Please select sensors and date range.
                </div>
            ) : (
                <DeviceComparisonChart
                    data={outChartData}
                    title="Device Comparison (Exits)"
                    className="h-[300px]"
                />
            )}
          </ChartCard>
        </div>
      </div>
  );
};

export default Comparison;