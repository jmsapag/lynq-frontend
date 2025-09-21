import { useMemo, useState, useEffect } from "react";
import { sensorMetadata } from "../../types/sensorMetadata";
import { useSensorRecords } from "../useSensorRecords";
import { useGroupLocations } from "../useGroupLocations";
import { Time } from "@internationalized/date";
import { SensorRecordsFormData } from "../../types/sensorRecordsFormData";
import {
  type ComparisonPeriods,
  calculateMetricComparison,
  type MetricComparison,
} from "../../utils/comparisonUtils";

// Helper function to validate returning customer values
function isValidReturningCustomerValue(
  currentValue: number | null | undefined,
  previousValue: number | null | undefined,
  index: number,
): boolean {
  // Handle null/undefined as invalid
  if (currentValue == null) return false;

  // First element: 0 is valid (no previous to compare)
  if (index === 0) return true;

  // If current is 0 and previous was also 0 → valid (consecutive zeros)
  if (currentValue === 0 && previousValue === 0) return true;

  // If current is 0 and previous was non-zero → invalid (sudden drop)
  if (currentValue === 0 && previousValue != null && previousValue !== 0)
    return false;

  // Non-zero values are always valid
  return true;
}

// Helper function to calculate weighted average percentage
function calculateWeightedAveragePercentage(
  percentages: number[],
  weights: number[], // traffic volumes
  validityFlags: boolean[],
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < percentages.length; i++) {
    if (validityFlags[i] && weights[i] > 0) {
      weightedSum += percentages[i] * weights[i];
      totalWeight += weights[i];
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

interface OverviewMetrics {
  totalIn: number;
  totalOut: number;
  entryRate: number;
  dailyAverageIn: number;
  dailyAverageOut: number;
  percentageChange: number;
  mostCrowdedDay: { date: Date; value: number } | null;
  leastCrowdedDay: { date: Date; value: number } | null;
  returningCustomers: number;
  avgVisitDuration: number;
  affluence: number;
}

interface OverviewMetricsComparisons {
  totalIn?: MetricComparison;
  totalOut?: MetricComparison;
  entryRate?: MetricComparison;
  dailyAverageIn?: MetricComparison;
  dailyAverageOut?: MetricComparison;
}

export const useOverviewMetrics = (
  sensorData: any,
  dateRange: { start: Date; end: Date },
  sensorMap: Map<number, string>,
  locations: any[],
  sensorIds?: number[],
  comparisonPeriods?: ComparisonPeriods | null,
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

  const { data: dailySensorDataByLocation } = useSensorRecords(
    dailyDataFormData,
    setDailyDataFormData,
  );
  const dailySensorData = useGroupLocations(dailySensorDataByLocation);

  // Fetch comparison data if comparison periods are provided
  const [comparisonFormData, setComparisonFormData] =
    useState<SensorRecordsFormData | null>(() =>
      comparisonPeriods
        ? {
            sensorIds: sensorIds || Array.from(sensorMap.keys()),
            fetchedDateRange: null,
            dateRange: comparisonPeriods.previous,
            hourRange: { start: new Time(0, 0), end: new Time(23, 59) },
            rawData: [],
            groupBy: "day" as const,
            aggregationType: "sum" as const,
            needToFetch: true,
          }
        : null,
    );

  // Update comparison form data when dependencies change
  useEffect(() => {
    if (comparisonPeriods) {
      const sensorIdsArray = sensorIds || Array.from(sensorMap.keys());
      setComparisonFormData({
        sensorIds: sensorIdsArray,
        fetchedDateRange: null,
        dateRange: comparisonPeriods.previous,
        hourRange: { start: new Time(0, 0), end: new Time(23, 59) },
        rawData: [],
        groupBy: "day" as const,
        aggregationType: "sum" as const,
        needToFetch: true,
      });
    } else {
      setComparisonFormData(null);
    }
  }, [
    comparisonPeriods?.previous.start.getTime(),
    comparisonPeriods?.previous.end.getTime(),
    JSON.stringify(sensorIds),
    sensorMap.size,
  ]);

  // Create a stable fallback for the sensor records hook
  const fallbackFormData = useMemo(
    () => ({
      sensorIds: [],
      fetchedDateRange: null,
      dateRange: { start: new Date(), end: new Date() },
      hourRange: { start: new Time(0, 0), end: new Time(23, 59) },
      rawData: [],
      groupBy: "day" as const,
      aggregationType: "sum" as const,
      needToFetch: false,
    }),
    [],
  );

  const fallbackSetter = useMemo(
    () => (_: (prev: SensorRecordsFormData) => SensorRecordsFormData) => {
      // No-op function for when comparison data is not needed
    },
    [],
  );

  // Create a wrapper for setComparisonFormData to match the expected signature
  const comparisonSetter = useMemo(
    () =>
      (formData: (prev: SensorRecordsFormData) => SensorRecordsFormData) => {
        setComparisonFormData((prevFormData) => {
          if (prevFormData === null) {
            // If previous state is null, we can't call the formData function
            return null;
          }
          return formData(prevFormData);
        });
      },
    [],
  );

  const { data: comparisonSensorDataByLocation } = useSensorRecords(
    comparisonFormData || fallbackFormData,
    comparisonFormData ? comparisonSetter : fallbackSetter,
  );
  const comparisonSensorData = useGroupLocations(
    comparisonSensorDataByLocation,
  );

  // Calculate returning customers weighted average outside main metrics calculation
  const returningCustomersWeightedAvg = useMemo(() => {
    if (!sensorData?.returningCustomers || !sensorData?.in) return 0;

    const validityFlags = sensorData.returningCustomers.map((value, index) =>
      isValidReturningCustomerValue(
        value,
        index > 0 ? sensorData.returningCustomers[index - 1] : null,
        index,
      ),
    );

    return calculateWeightedAveragePercentage(
      sensorData.returningCustomers,
      sensorData.in, // use traffic as weights
      validityFlags,
    );
  }, [sensorData?.returningCustomers, sensorData?.in]);

  const metrics = useMemo(() => {
    if (!sensorData || !sensorData.in || !sensorData.out) {
      return {
        current: {
          totalIn: 0,
          totalOut: 0,
          entryRate: 0,
          dailyAverageIn: 0,
          dailyAverageOut: 0,
          percentageChange: 0,
          mostCrowdedDay: null,
          leastCrowdedDay: null,
          returningCustomers: 0,
          avgVisitDuration: 0,
          affluence: 0,
        } as OverviewMetrics,
        comparisons: {} as OverviewMetricsComparisons,
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

    // Use the pre-calculated returning customers weighted average

    const totalAvgVisitDuration = sensorData.avgVisitDuration
      ? Math.round(
          sensorData.avgVisitDuration.reduce(
            (sum: number, value: number) => sum + value,
            0,
          ) / sensorData.avgVisitDuration.length,
        )
      : 0;

    const totalAffluence = sensorData.affluence
      ? Math.round(
          sensorData.affluence.reduce(
            (sum: number, value: number) => sum + value,
            0,
          ) / sensorData.affluence.length,
        )
      : 0;

    const currentMetrics = {
      totalIn,
      totalOut,
      entryRate,
      dailyAverageIn,
      dailyAverageOut,
      percentageChange: Math.round(percentageChange),
      mostCrowdedDay,
      leastCrowdedDay,
      returningCustomers: Math.round(returningCustomersWeightedAvg),
      avgVisitDuration: totalAvgVisitDuration,
      affluence: totalAffluence,
    };

    // Calculate comparison metrics if comparison data is available
    let comparisons: OverviewMetricsComparisons = {};
    if (
      comparisonPeriods &&
      comparisonSensorData &&
      comparisonSensorData.in &&
      comparisonSensorData.out
    ) {
      const comparisonTotalIn = comparisonSensorData.in.reduce(
        (sum: number, value: number) => sum + value,
        0,
      );
      const comparisonTotalOut = comparisonSensorData.out.reduce(
        (sum: number, value: number) => sum + value,
        0,
      );
      const comparisonTotalMovements = comparisonTotalIn + comparisonTotalOut;
      const comparisonEntryRate =
        comparisonTotalMovements > 0
          ? Math.round((comparisonTotalIn / comparisonTotalMovements) * 100)
          : 0;

      // Calculate comparison period duration
      const comparisonStart = comparisonPeriods.previous.start;
      const comparisonEnd = comparisonPeriods.previous.end;
      const comparisonDaysDiff = Math.max(
        1,
        Math.ceil(
          (comparisonEnd.getTime() - comparisonStart.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );

      const comparisonDailyAverageIn = Math.round(
        comparisonTotalIn / comparisonDaysDiff,
      );
      const comparisonDailyAverageOut = Math.round(
        comparisonTotalOut / comparisonDaysDiff,
      );

      comparisons = {
        totalIn: calculateMetricComparison(totalIn, comparisonTotalIn),
        totalOut: calculateMetricComparison(totalOut, comparisonTotalOut),
        entryRate: calculateMetricComparison(entryRate, comparisonEntryRate),
        dailyAverageIn: calculateMetricComparison(
          dailyAverageIn,
          comparisonDailyAverageIn,
        ),
        dailyAverageOut: calculateMetricComparison(
          dailyAverageOut,
          comparisonDailyAverageOut,
        ),
      };
    }

    return {
      current: currentMetrics,
      comparisons,
    };
  }, [
    sensorData,
    dateRange,
    dailySensorData,
    comparisonPeriods,
    comparisonSensorData,
    returningCustomersWeightedAvg,
  ]);

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
