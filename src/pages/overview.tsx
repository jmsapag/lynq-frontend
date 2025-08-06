import { Spinner } from "@heroui/react";
import { DashboardFilters } from "../components/dashboard/filter.tsx";
import { useEffect, useState, useMemo } from "react";
import { useSensorData } from "../hooks/useSensorData.ts";
import { useSensorRecords } from "../hooks/useSensorRecords.ts";
import { sensorResponse } from "../types/deviceResponse";
import { sensorMetadata } from "../types/sensorMetadata";
import { SensorRecordsFormData } from "../types/sensorRecordsFormData";
import { Time } from "@internationalized/date";
import { SensorDataCard } from "../components/dashboard/charts/card.tsx";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

function getFirstFetchedDateRange() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date();
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    start: startOfWeek,
    end: endOfWeek,
  };
}

export const Overview: React.FC = () => {
  const { t } = useTranslation();
  const GROUP_BY = "day";
  const AGGREGATION_TYPE = "sum";

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

  const metrics = useMemo(() => {
    if (!sensorData || !sensorData.in || !sensorData.out) {
      return {
        totalIn: 0,
        totalOut: 0,
        entryRate: 0,
        dailyAverageIn: 0,
        dailyAverageOut: 0,
        percentageChange: 0,
        mostCrowdedDay: null,
        leastCrowdedDay: null,
      };
    }

    const totalIn = sensorData.in.reduce((sum, value) => sum + value, 0);
    const totalOut = sensorData.out.reduce((sum, value) => sum + value, 0);

    const totalMovements = totalIn + totalOut;

    const entryRate =
      totalMovements > 0 ? Math.round((totalIn / totalMovements) * 100) : 0;

    const startDate = sensorRecordsFormData.dateRange.start;
    const endDate = sensorRecordsFormData.dateRange.end;
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    const dailyAverageIn = Math.round(totalIn / daysDiff);
    const dailyAverageOut = Math.round(totalOut / daysDiff);

    let percentageChange = 0;
    if (
      sensorData.timestamps &&
      sensorData.timestamps.length > 0 &&
      sensorData.in.length > 0
    ) {
      const firstDayIn = sensorData.in[0];
      const lastDayIn = sensorData.in[sensorData.in.length - 1];
      if (firstDayIn !== 0) {
        percentageChange = ((lastDayIn - firstDayIn) / firstDayIn) * 100;
      } else if (lastDayIn > 0) {
        percentageChange = 100;
      }
    }

    let mostCrowdedDayIndex = -1;
    let leastCrowdedDayIndex = -1;
    let maxInValue = -1;
    let minInValue = Number.MAX_SAFE_INTEGER;

    sensorData.in.forEach((value, index) => {
      if (value > maxInValue) {
        maxInValue = value;
        mostCrowdedDayIndex = index;
      }

      if (value < minInValue && value > 0) {
        minInValue = value;
        leastCrowdedDayIndex = index;
      }
    });

    if (leastCrowdedDayIndex === -1 && sensorData.in.length > 0) {
      leastCrowdedDayIndex = sensorData.in.findIndex((value) => value === 0);
      minInValue = 0;
    }

    const mostCrowdedDay =
      mostCrowdedDayIndex >= 0
        ? {
            date: new Date(sensorData.timestamps[mostCrowdedDayIndex]),
            value: maxInValue,
          }
        : null;

    const leastCrowdedDay =
      leastCrowdedDayIndex >= 0
        ? {
            date: new Date(sensorData.timestamps[leastCrowdedDayIndex]),
            value: minInValue,
          }
        : null;

    return {
      totalIn,
      totalOut,
      entryRate,
      dailyAverageIn,
      dailyAverageOut,
      percentageChange: Math.round(percentageChange),
      mostCrowdedDay,
      leastCrowdedDay,
    };
  }, [sensorData, sensorRecordsFormData.dateRange]);

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      dateRange: { start: startDate, end: endDate },
      needToFetch: true,
    }));
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

  useEffect(() => {
    const newSensorMap = new Map<number, string>();
    locations?.forEach((location: sensorResponse) => {
      location.sensors.forEach((sensor: sensorMetadata) => {
        newSensorMap.set(sensor.id, sensor.position);
      });
    });
    setSensorMap(newSensorMap);
  }, [locations]);

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
      />
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : hasError ? (
        <div className="flex items-center justify-center h-64 text-red-500">
          {t("common.error")}
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SensorDataCard
              title="Total In"
              value={metrics.totalIn.toLocaleString()}
              translationKey="dashboard.metrics.totalIn"
              descriptionTranslationKey="dashboard.metrics.totalInDescription"
              unit="people"
            />

            <SensorDataCard
              title="Total Out"
              value={metrics.totalOut.toLocaleString()}
              translationKey="dashboard.metrics.totalOut"
              descriptionTranslationKey="dashboard.metrics.totalOutDescription"
              unit="people"
            />

            <SensorDataCard
              title="Daily Average In"
              value={metrics.dailyAverageIn.toLocaleString()}
              translationKey="dashboard.metrics.dailyAverageIn"
              descriptionTranslationKey="dashboard.metrics.dailyAverageInDescription"
              unit="people/day"
            />

            <SensorDataCard
              title="Daily Average Out"
              value={metrics.dailyAverageOut.toLocaleString()}
              translationKey="dashboard.metrics.dailyAverageOut"
              descriptionTranslationKey="dashboard.metrics.dailyAverageOutDescription"
              unit="people/day"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SensorDataCard
              title="Most Crowded Day"
              value={
                metrics.mostCrowdedDay
                  ? format(metrics.mostCrowdedDay.date, "d MMM")
                  : "-"
              }
              translationKey="dashboard.metrics.mostCrowdedDay"
              descriptionTranslationKey="dashboard.metrics.mostCrowdedDayDescription"
              unit={
                metrics.mostCrowdedDay
                  ? `(${metrics.mostCrowdedDay.value.toLocaleString()} people)`
                  : ""
              }
            />

            <SensorDataCard
              title="Least Crowded Day"
              value={
                metrics.leastCrowdedDay
                  ? format(metrics.leastCrowdedDay.date, "d MMM")
                  : "-"
              }
              translationKey="dashboard.metrics.leastCrowdedDay"
              descriptionTranslationKey="dashboard.metrics.leastCrowdedDayDescription"
              unit={
                metrics.leastCrowdedDay
                  ? `(${metrics.leastCrowdedDay.value.toLocaleString()} people)`
                  : ""
              }
            />

            <SensorDataCard
              title="Entry Rate"
              value={metrics.entryRate}
              translationKey="dashboard.metrics.entryRate"
              descriptionTranslationKey="dashboard.metrics.entryRateDescription"
              unit="%"
            />

            <SensorDataCard
              title="Percentage Increase/Decrease"
              value={
                (metrics.percentageChange > 0 ? "+" : "") +
                metrics.percentageChange.toLocaleString()
              }
              translationKey="dashboard.metrics.percentageChange"
              descriptionTranslationKey="dashboard.metrics.percentageChangeDescription"
              unit="%"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
