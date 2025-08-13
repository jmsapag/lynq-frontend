import { useMemo, useState } from "react";
import { sensorMetadata } from "../../types/sensorMetadata";
import { useSensorRecords } from "../useSensorRecords";
import { Time } from "@internationalized/date";
import { SensorRecordsFormData } from "../../types/sensorRecordsFormData";

export const useOverviewMetrics = (
  sensorData: any,
  dateRange: { start: Date; end: Date },
  sensorMap: Map<number, string>,
  locations: any[],
  sensorIds?: number[],
) => {
  // Always fetch daily aggregated data for most/least crowded day calculations
  const [dailyDataFormData, setDailyDataFormData] =
    useState<SensorRecordsFormData>(() => ({
      sensorIds: sensorIds || Array.from(sensorMap.keys()),
      fetchedDateRange: null,
      dateRange,
      hourRange: { start: new Time(0, 0), end: new Time(23, 59) },
      rawData: [],
      groupBy: "day" as const,
      aggregationType: "sum" as const,
      needToFetch: true,
    }));

  // Update daily data form when dependencies change
  useMemo(() => {
    setDailyDataFormData((prev) => ({
      ...prev,
      sensorIds: sensorIds || Array.from(sensorMap.keys()),
      dateRange,
      needToFetch: true,
    }));
  }, [sensorIds, sensorMap, dateRange]);

  const { data: dailySensorData } = useSensorRecords(
    dailyDataFormData,
    setDailyDataFormData,
  );
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

    const totalIn = sensorData.in.reduce(
      (sum: number, value: number) => sum + value,
      0,
    );
    const totalOut = sensorData.out.reduce(
      (sum: number, value: number) => sum + value,
      0,
    );

    const totalMovements = totalIn + totalOut;
    const entryRate =
      totalMovements > 0 ? Math.round((totalIn / totalMovements) * 100) : 0;

    const startDate = dateRange.start;
    const endDate = dateRange.end;
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    const dailyAverageIn = Math.round(totalIn / daysDiff);
    const dailyAverageOut = Math.round(totalOut / daysDiff);

    // Calculate percentage change using daily data for consistent comparison
    let percentageChange = 0;
    if (
      dailySensorData &&
      dailySensorData.timestamps &&
      dailySensorData.timestamps.length > 0 &&
      dailySensorData.in.length > 0
    ) {
      const firstDayIn = dailySensorData.in[0];
      const lastDayIn = dailySensorData.in[dailySensorData.in.length - 1];
      if (firstDayIn !== 0) {
        percentageChange = ((lastDayIn - firstDayIn) / firstDayIn) * 100;
      } else if (lastDayIn > 0) {
        percentageChange = 100;
      }
    }

    // Use daily data for most/least crowded day calculations
    let mostCrowdedDay = null;
    let leastCrowdedDay = null;

    if (dailySensorData && dailySensorData.in && dailySensorData.timestamps) {
      let mostCrowdedDayIndex = -1;
      let leastCrowdedDayIndex = -1;
      let maxInValue = -1;
      let minInValue = Number.MAX_SAFE_INTEGER;

      dailySensorData.in.forEach((value: number, index: number) => {
        if (value > maxInValue) {
          maxInValue = value;
          mostCrowdedDayIndex = index;
        }

        if (value < minInValue && value > 0) {
          minInValue = value;
          leastCrowdedDayIndex = index;
        }
      });

      if (leastCrowdedDayIndex === -1 && dailySensorData.in.length > 0) {
        leastCrowdedDayIndex = dailySensorData.in.findIndex(
          (value: number) => value === 0,
        );
        minInValue = 0;
      }

      mostCrowdedDay =
        mostCrowdedDayIndex >= 0
          ? {
              date: new Date(dailySensorData.timestamps[mostCrowdedDayIndex]),
              value: maxInValue,
            }
          : null;

      leastCrowdedDay =
        leastCrowdedDayIndex >= 0
          ? {
              date: new Date(dailySensorData.timestamps[leastCrowdedDayIndex]),
              value: minInValue,
            }
          : null;
    }

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
  }, [sensorData, dateRange, dailySensorData]);

  const getSensorDetails = () => {
    return Array.from(sensorMap.entries()).map(([id, position]) => ({
      id,
      position,
      location:
        locations?.find((loc) =>
          loc.sensors.some((sensor: sensorMetadata) => sensor.id === id),
        )?.name || "",
    }));
  };

  const sensorIdsList = () => {
    return Array.from(sensorMap.keys()).join(",");
  };

  return {
    metrics,
    getSensorDetails,
    sensorIdsList: sensorIdsList(),
  };
};
