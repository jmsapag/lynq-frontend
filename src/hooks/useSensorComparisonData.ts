import { useState, useEffect, useCallback } from "react";
import { axiosClient } from "../services/axiosClient";
import {
  GroupByTimeAmount,
  AggregationType,
  SensorDataPoint,
} from "../types/sensorDataResponse";
import { format, parseISO, isBefore, isAfter } from "date-fns";

interface SensorComparisonData {
  name: string;
  id: number;
  inValues: number[];
  outValues: number[];
  timestamps: string[]; // Added timestamps to the interface
}

interface UseSensorComparisonDataParams {
  sensorIds: number[];
  sensorNames: string[];
  dateRange: { start: Date; end: Date } | null;
  groupBy: GroupByTimeAmount;
  aggregationType: AggregationType;
  rawData: Map<number, SensorDataPoint[]>;
  setRawData: (data: Map<number, SensorDataPoint[]>) => void;
  fetchedDateRange: { start: Date; end: Date } | null;
  setFetchedDateRange: (range: { start: Date; end: Date } | null) => void;
  needToFetch: boolean;
  setNeedToFetch: (need: boolean) => void;
  loadedSensorIds: Set<number>;
  setLoadedSensorIds: (ids: Set<number>) => void;
}

interface UseSensorComparisonDataResult {
  data: {
    timestamps: string[];
    sensorsData: SensorComparisonData[];
  };
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSensorComparisonData({
  sensorIds,
  sensorNames,
  dateRange,
  groupBy,
  aggregationType,
  rawData,
  setRawData,
  fetchedDateRange,
  setFetchedDateRange,
  needToFetch,
  setNeedToFetch,
  loadedSensorIds,
  setLoadedSensorIds,
}: UseSensorComparisonDataParams): UseSensorComparisonDataResult {
  const [data, setData] = useState<{
    timestamps: string[];
    sensorsData: SensorComparisonData[];
  }>({
    timestamps: [],
    sensorsData: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to group data
  const groupDataByTime = useCallback(
    (data: any[], timeAmount: GroupByTimeAmount, aggType: AggregationType) => {
      if (!data || data.length === 0) return [];

      const groupedData = new Map<
        string,
        { total_in: number; total_out: number; count: number }
      >();

      data.forEach((point) => {
        const date = parseISO(point.timestamp);
        let groupKey: string;

        switch (timeAmount) {
          case "5min":
            groupKey = format(
              new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                Math.floor(date.getMinutes() / 5) * 5,
              ),
              "yyyy-MM-dd'T'HH:mm:00'Z'",
            );
            break;
          case "10min":
            groupKey = format(
              new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                Math.floor(date.getMinutes() / 10) * 10,
              ),
              "yyyy-MM-dd'T'HH:mm:00'Z'",
            );
            break;
          case "15min":
            groupKey = format(
              new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                Math.floor(date.getMinutes() / 15) * 15,
              ),
              "yyyy-MM-dd'T'HH:mm:00'Z'",
            );
            break;
          case "30min":
            groupKey = format(
              new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                Math.floor(date.getMinutes() / 30) * 30,
              ),
              "yyyy-MM-dd'T'HH:mm:00'Z'",
            );
            break;
          case "hour":
            groupKey = format(
              new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
              ),
              "yyyy-MM-dd'T'HH:00:00'Z'",
            );
            break;
          case "day":
            groupKey = format(
              new Date(date.getFullYear(), date.getMonth(), date.getDate()),
              "yyyy-MM-dd'T'00:00:00'Z'",
            );
            break;
          case "week":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            groupKey = format(weekStart, "yyyy-MM-dd'T'00:00:00'Z'");
            break;
          case "month":
            groupKey = format(
              new Date(date.getFullYear(), date.getMonth(), 1),
              "yyyy-MM-dd'T'00:00:00'Z'",
            );
            break;
          default:
            groupKey = point.timestamp;
        }

        if (!groupedData.has(groupKey)) {
          groupedData.set(groupKey, { total_in: 0, total_out: 0, count: 0 });
        }

        const group = groupedData.get(groupKey)!;
        group.total_in += point.total_count_in;
        group.total_out += point.total_count_out;
        group.count += 1;
      });

      // Apply aggregation and sort
      return Array.from(groupedData.entries())
        .map(([timestamp, values]) => {
          let total_in = values.total_in;
          let total_out = values.total_out;

          if (aggType === "avg" && values.count > 0) {
            total_in = total_in / values.count;
            total_out = total_out / values.count;
          }
          // Other aggregation types can be added here

          return {
            timestamp,
            total_count_in: total_in,
            total_count_out: total_out,
          };
        })
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    },
    [],
  );

  // Function to fetch data for a single sensor
  const fetchSensorData = useCallback(
    async (sensorId: number) => {
      if (!dateRange) return null;

      try {
        console.log(`Fetching data for sensor ${sensorId}`);

        const response = await axiosClient.get("/devices/sensor-data", {
          params: {
            sensor_ids: [sensorId],
            from: dateRange.start.toISOString(),
            to: dateRange.end.toISOString(),
          },
          paramsSerializer: {
            indexes: null,
          },
        });

        // Extract and process data
        return response.data.flatMap((location: any) => location.data);
      } catch (error) {
        console.error(`Error fetching data for sensor ${sensorId}:`, error);
        return null;
      }
    },
    [dateRange],
  );

  // Process data for a specific sensor
  const processSensorData = useCallback(
    (sensorId: number, sensorName: string, dataPoints: SensorDataPoint[]) => {
      // Group by time
      const groupedData = groupDataByTime(dataPoints, groupBy, aggregationType);

      // Format timestamps for display
      const timestamps = groupedData.map((point) => {
        const date = parseISO(point.timestamp);
        return format(date, "MMM dd, HH:mm");
      });

      const inValues = groupedData.map((point) => point.total_count_in);
      const outValues = groupedData.map((point) => point.total_count_out);

      return {
        name: sensorName,
        id: sensorId,
        inValues,
        outValues,
        timestamps,
      };
    },
    [groupBy, aggregationType, groupDataByTime],
  );

  // Update the data view based on selected sensors
  const updateDataView = useCallback(() => {
    if (sensorIds.length === 0 || !rawData.size) {
      setData({
        timestamps: [],
        sensorsData: [],
      });
      return;
    }

    // Process data for each sensor
    const sensorsData: SensorComparisonData[] = [];

    for (let i = 0; i < sensorIds.length; i++) {
      const sensorId = sensorIds[i];
      const sensorName = sensorNames[i] || `Sensor ${sensorId}`;

      const sensorDataPoints = rawData.get(sensorId);
      if (sensorDataPoints && sensorDataPoints.length > 0) {
        // Filter data to match current date range
        const filteredData = sensorDataPoints.filter((point) => {
          if (!dateRange) return true;

          const pointDate = parseISO(point.timestamp);
          return (
            !isBefore(pointDate, dateRange.start) &&
            !isAfter(pointDate, dateRange.end)
          );
        });

        if (filteredData.length > 0) {
          const processedData = processSensorData(
            sensorId,
            sensorName,
            filteredData,
          );
          sensorsData.push(processedData);
        }
      }
    }

    // Use first sensor's timestamps (all should have the same after grouping)
    let commonTimestamps: string[] = [];
    if (sensorsData.length > 0 && sensorsData[0].timestamps.length > 0) {
      commonTimestamps = sensorsData[0].timestamps;
    }

    setData({
      timestamps: commonTimestamps,
      sensorsData: sensorsData,
    });
  }, [sensorIds, sensorNames, rawData, dateRange, processSensorData]);

  // Check if we need to fetch new data
  useEffect(() => {
    if (!dateRange || sensorIds.length === 0) return;

    let shouldFetch = false;

    if (!fetchedDateRange) {
      // First fetch
      console.log("First fetch - no previously fetched data");
      shouldFetch = true;
    } else if (
      isBefore(dateRange.start, fetchedDateRange.start) ||
      isAfter(dateRange.end, fetchedDateRange.end)
    ) {
      // New range extends beyond fetched range
      console.log("New range extends beyond fetched range");
      shouldFetch = true;
    }

    // Check if we have new sensors to fetch
    const newSensors = sensorIds.filter((id) => !loadedSensorIds.has(id));
    if (newSensors.length > 0) {
      console.log("New sensors to fetch:", newSensors);
      shouldFetch = true;
    }

    setNeedToFetch(shouldFetch);
  }, [sensorIds, dateRange, fetchedDateRange, loadedSensorIds]);

  // Main effect to fetch data when needed
  useEffect(() => {
    if (!needToFetch || !dateRange) return;

    setLoading(true);

    const fetchSensors = async () => {
      try {
        // Make a copy of the current raw data map
        const updatedRawData = new Map(rawData);
        const newLoadedIds = new Set<number>(loadedSensorIds);

        // Determine what sensors need to be fetched
        const sensorsToFetch = sensorIds.filter(
          (id) => !loadedSensorIds.has(id),
        );

        if (fetchedDateRange) {
          // Check if we need to fetch data for the start of the range
          const needFetchStart = isBefore(
            dateRange.start,
            fetchedDateRange.start,
          );
          // Check if we need to fetch data for the end of the range
          const needFetchEnd = isAfter(dateRange.end, fetchedDateRange.end);

          if (!needFetchStart && !needFetchEnd && sensorsToFetch.length === 0) {
            // The new range is completely within the already fetched range and no new sensors
            setNeedToFetch(false);
            setLoading(false);
            return;
          }
        }

        // Fetch data for each sensor that needs updating
        for (const sensorId of sensorIds) {
          let shouldFetchSensor = false;

          // If this is a new sensor, we need to fetch it
          if (!loadedSensorIds.has(sensorId)) {
            shouldFetchSensor = true;
          }
          // If we're extending the date range, we need to fetch for all sensors
          else if (
            fetchedDateRange &&
            (isBefore(dateRange.start, fetchedDateRange.start) ||
              isAfter(dateRange.end, fetchedDateRange.end))
          ) {
            shouldFetchSensor = true;
          }

          if (shouldFetchSensor) {
            const sensorDataPoints = await fetchSensorData(sensorId);
            if (sensorDataPoints) {
              // If we already have data for this sensor, merge it
              const existingData = updatedRawData.get(sensorId) || [];
              updatedRawData.set(sensorId, [
                ...existingData,
                ...sensorDataPoints,
              ]);
              newLoadedIds.add(sensorId);
            }
          }
        }

        // Update our state
        setRawData(updatedRawData);
        setLoadedSensorIds(newLoadedIds);

        // Update the fetched date range
        if (fetchedDateRange) {
          const newStart = isBefore(dateRange.start, fetchedDateRange.start)
            ? dateRange.start
            : fetchedDateRange.start;

          const newEnd = isAfter(dateRange.end, fetchedDateRange.end)
            ? dateRange.end
            : fetchedDateRange.end;

          setFetchedDateRange({ start: newStart, end: newEnd });
        } else {
          setFetchedDateRange(dateRange);
        }

        setNeedToFetch(false);
      } catch (err) {
        setError("Error fetching sensor data");
        console.error("Error in fetchSensors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, [
    needToFetch,
    dateRange,
    sensorIds,
    fetchSensorData,
    rawData,
    loadedSensorIds,
    fetchedDateRange,
  ]);

  // Update the view whenever relevant data changes
  useEffect(() => {
    updateDataView();
  }, [updateDataView, rawData, sensorIds, dateRange, groupBy, aggregationType]);

  // Manual refetch function
  const refetch = useCallback(() => {
    // Clear cached data to force a refetch
    setRawData(new Map());
    setLoadedSensorIds(new Set());
    setFetchedDateRange(null);
    setNeedToFetch(true);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
