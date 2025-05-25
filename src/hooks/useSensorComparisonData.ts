import { useState, useEffect, useCallback } from "react";
import { axiosClient } from "../services/axiosClient";
import {
  GroupByTimeAmount,
  AggregationType,
} from "../types/sensorDataResponse";
import { format, parseISO } from "date-fns";

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
  const [sensorDataMap, setSensorDataMap] = useState<
      Map<number, SensorComparisonData>
  >(new Map());

  // Keep track of which sensors we've loaded
  const [loadedSensorIds, setLoadedSensorIds] = useState<Set<number>>(
      new Set(),
  );

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
      async (sensorId: number, sensorName: string) => {
        if (!dateRange) return null;

        try {
          console.log(`Fetching data for sensor ${sensorId} (${sensorName})`);

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
          const sensorDataPoints = response.data.flatMap(
              (location: any) => location.data,
          );

          // Group by time
          const groupedData = groupDataByTime(
              sensorDataPoints,
              groupBy,
              aggregationType,
          );

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
        } catch (error) {
          console.error(`Error fetching data for sensor ${sensorId}:`, error);
          return null;
        }
      },
      [dateRange, groupBy, aggregationType, groupDataByTime],
  );

  // Update the data view based on selected sensors
  const updateDataView = useCallback(
      (dataMap = sensorDataMap) => {
        // Get data only for currently selected sensors
        const selectedSensorsData = sensorIds
            .map((id) => dataMap.get(id))
            .filter(
                (sensorData): sensorData is SensorComparisonData => !!sensorData,
            );

        // Use first sensor's timestamps (all should have the same after grouping)
        let commonTimestamps: string[] = [];
        if (
            selectedSensorsData.length > 0 &&
            selectedSensorsData[0].timestamps.length > 0
        ) {
          commonTimestamps = selectedSensorsData[0].timestamps;
        }

        setData({
          timestamps: commonTimestamps,
          sensorsData: selectedSensorsData,
        });
      },
      [sensorIds, sensorDataMap],
  );

  // Main effect to fetch data for sensors
  useEffect(() => {
    if (!dateRange || sensorIds.length === 0) return;

    setLoading(true);

    // Find which sensors we need to fetch (ones we haven't loaded yet)
    const sensorsToFetch: { id: number; name: string }[] = [];

    for (let i = 0; i < sensorIds.length; i++) {
      if (!loadedSensorIds.has(sensorIds[i])) {
        sensorsToFetch.push({
          id: sensorIds[i],
          name: sensorNames[i] || `Sensor ${sensorIds[i]}`,
        });
      }
    }

    if (sensorsToFetch.length === 0) {
      // All sensors already loaded - update current view
      updateDataView();
      setLoading(false);
      return;
    }

// Inside fetchSensors function
    const fetchSensors = async () => {
      try {
        // Make a copy of the current sensor data map
        const updatedSensorDataMap = new Map(sensorDataMap);
        const newLoadedIds = new Set<number>(loadedSensorIds);

        // Fetch data for each new sensor
        for (const sensor of sensorsToFetch) {
          const sensorData = await fetchSensorData(sensor.id, sensor.name);
          if (sensorData) {
            updatedSensorDataMap.set(sensor.id, sensorData);
            newLoadedIds.add(sensor.id);
          }
        }

        // Update our maps
        setSensorDataMap(updatedSensorDataMap);
        setLoadedSensorIds(newLoadedIds);

        // Update the view with all available sensor data
        updateDataView(updatedSensorDataMap);
      } catch (err) {
        setError("Error fetching sensor data");
        console.error("Error in fetchSensors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sensorIds.join(","),
    dateRange?.start.getTime(),
    dateRange?.end.getTime(),
    groupBy,
    aggregationType,
  ]);

  // Manual refetch function
  const refetch = useCallback(() => {
    // Clear cached data to force a refetch
    setSensorDataMap(new Map());
    setLoadedSensorIds(new Set());

    if (dateRange && sensorIds.length > 0) {
      setLoading(true);

// Inside fetchAll function
      const fetchAll = async () => {
        try {
          const newDataMap = new Map();
          const newLoadedIds = new Set<number>();

          // Fetch data for all selected sensors
          for (let i = 0; i < sensorIds.length; i++) {
            const sensorData = await fetchSensorData(
                sensorIds[i],
                sensorNames[i],
            );
            if (sensorData) {
              newDataMap.set(sensorIds[i], sensorData);
              newLoadedIds.add(sensorIds[i]);
            }
          }

          setSensorDataMap(newDataMap);
          setLoadedSensorIds(newLoadedIds);
          updateDataView(newDataMap);
        } catch (err) {
          setError("Error refreshing sensor data");
          console.error("Error in refetch:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAll();
    }
  }, [dateRange, sensorIds, sensorNames, fetchSensorData, updateDataView]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}