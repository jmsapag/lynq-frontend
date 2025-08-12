import { useMemo } from "react";
import { sensorMetadata } from "../../types/sensorMetadata";

export const useOverviewMetrics = (
  sensorData: any,
  dateRange: { start: Date; end: Date },
  sensorMap: Map<number, string>,
  locations: any[],
) => {
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

    sensorData.in.forEach((value: number, index: number) => {
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
      leastCrowdedDayIndex = sensorData.in.findIndex(
        (value: number) => value === 0,
      );
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
  }, [sensorData, dateRange]);

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
