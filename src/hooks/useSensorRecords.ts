import { useCallback, useEffect, useState} from "react";
import { axiosClient } from "../services/axiosClient";
import {
  AggregationType,
  GroupByTimeAmount,
  SensorDataPoint,
  SensorDataResponse,
  TransformedSensorData,
} from "../types/sensorDataResponse";
import {
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

interface UseSensorRecordsParams {
  sensorIds: number[];
  dateRange: { start: Date; end: Date } | null;
  currentFetchedDateRange: { start: Date; end: Date } | null;
  setFetchedDateRange: (range: { start: Date; end: Date }) => void;
  rawData: SensorDataPoint[];
  setRawData: (data: SensorDataPoint[]) => void;
  needToFetch: boolean;
  setNeedToFetch: (need: boolean) => void;
  groupBy: GroupByTimeAmount;
  aggregationType: AggregationType;
}

interface UseSensorRecordsResult {
  data: TransformedSensorData;
  loading: boolean;
  error: string | null;
}

export function useSensorRecords({
  sensorIds,
  dateRange,
  rawData,
  setRawData,
  currentFetchedDateRange,
  setFetchedDateRange,
  needToFetch,
  setNeedToFetch,
  groupBy,
  aggregationType,
}: UseSensorRecordsParams): UseSensorRecordsResult {
  const fetchedDateRange = currentFetchedDateRange;
  const [data, setData] = useState<TransformedSensorData>({
    timestamps: [],
    in: [],
    out: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data from the API
  const fetchData = useCallback(
    async (start: Date, end: Date, sensors: number[]) => {
      if (sensors.length === 0) return [];

      setLoading(true);
      setError(null);

      try {
        const response = await axiosClient.get<SensorDataResponse[]>(
          "/devices/sensor-data",
          {
            params: {
              sensor_ids: sensors,
              from: start.toISOString(),
              to: end.toISOString(),
            },
            paramsSerializer: {
              indexes: null, // This will serialize arrays as param=value1&param=value2
            },
          },
        );

        // Flatten the data from all locations
        return response.data.flatMap((location) => location.data);
      } catch (err) {
        setError("Error fetching sensor data");
        console.error("Error fetching sensor data:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Function to group data by time amount
  const groupDataByTime = useCallback(
    (
      data: SensorDataPoint[],
      timeAmount: GroupByTimeAmount,
    ): SensorDataPoint[] => {
      if (data.length === 0) return [];

      const groupedData = new Map<
        string,
        { total_in: number; total_out: number; count: number }
      >();

      data.forEach((point) => {
        const date = parseISO(point.timestamp);
        let groupKey: string;

        switch (timeAmount) {
          case "5min":
            // Round to nearest 5 minutes
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
            groupKey = format(startOfDay(date), "yyyy-MM-dd'T'00:00:00'Z'");
            break;
          case "week":
            groupKey = format(startOfWeek(date), "yyyy-MM-dd'T'00:00:00'Z'");
            break;
          case "month":
            groupKey = format(startOfMonth(date), "yyyy-MM-dd'T'00:00:00'Z'");
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

      // Convert the grouped data back to SensorDataPoint[]
      return Array.from(groupedData.entries())
        .map(([timestamp, values]) => {
          let total_in = values.total_in;
          let total_out = values.total_out;

          // Apply aggregation
          if (aggregationType === "avg" && values.count > 0) {
            total_in = total_in / values.count;
            total_out = total_out / values.count;
          } else if (aggregationType === "min" || aggregationType === "max") {
            // For min/max, we'd need the original data points, not just sums
            // This is a simplified implementation
            total_in = total_in / values.count; // Using average as approximation
            total_out = total_out / values.count;
          }
          // For 'sum' and 'none', we use the total as is

          return {
            timestamp,
            total_count_in: total_in,
            total_count_out: total_out,
          };
        })
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    },
    [aggregationType],
  );

  // Transform data to the format expected by the chart
  const transformData = useCallback(
    (data: SensorDataPoint[]): TransformedSensorData => {
      const timestamps = data.map((point) => {
        const date = parseISO(point.timestamp);
        return format(date, "MMM dd, HH:mm"); // Format for display
      });

      const inValues = data.map((point) => point.total_count_in);
      const outValues = data.map((point) => point.total_count_out);

      return {
        timestamps,
        in: inValues,
        out: outValues,
      };
    },
    [],
  );


  // Process data immediately when groupBy or aggregationType changes
  useEffect(() => {
    if (!dateRange || !rawData.length) return;

    // Filter existing data to match the requested date range
    const dataToProcess = rawData.filter((point) => {
      const pointDate = parseISO(point.timestamp);
      return (
        !isBefore(pointDate, dateRange.start) &&
        !isAfter(pointDate, dateRange.end)
      );
    });

    // Group and aggregate the data
    const groupedData = groupDataByTime(dataToProcess, groupBy);

    // Transform the data for the chart
    const transformedData = transformData(groupedData);
    setData(transformedData);
  }, [
    groupBy,
    aggregationType,
    dateRange,
    rawData,
    groupDataByTime,
    transformData,
  ]);

  // Main effect to fetch data when needed
  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!dateRange || sensorIds.length === 0) return;

      let dataToProcess: SensorDataPoint[] = [];
      setNeedToFetch(false);

      // Check if we need to fetch new data or can use existing data
      if (!fetchedDateRange) {
        // First fetch
        console.log("First fetch - no previously fetched data");
        setNeedToFetch(true);
      } else if (
        isBefore(dateRange!.start, fetchedDateRange.start) ||
        (isAfter(dateRange!.end, fetchedDateRange.end) && !isAfter(dateRange!.end, new Date()))
      ) {
        // Only fetch if the new range extends beyond the already fetched range
        console.log("New range extends beyond fetched range");
        setNeedToFetch(true);
      }

      // Check if we have data in the requested range
      const dataInRange = rawData.filter((point) => {
        const pointDate = parseISO(point.timestamp);
        return (
          !isBefore(pointDate, dateRange!.start) &&
          !isAfter(pointDate, dateRange!.end)
        );
      });
      const hasDataInRange = dataInRange.length > 0;
      console.log("Data points in requested range:", dataInRange.length);

      // If we have data in the requested range and the new range is within the fetched range,
      // we don't need to fetch new data
      if (fetchedDateRange) {
        const isSameRange =
          dateRange!.start.getTime() ===
          fetchedDateRange.start.getTime() &&
          dateRange!.end.getTime() === fetchedDateRange.end.getTime();

        if (isSameRange) {
          setNeedToFetch(false);
          console.log(
            "Skipping API request - date range is the same as previously fetched",
          );
        }
        if (
          hasDataInRange &&
          !isBefore(dateRange!.start, fetchedDateRange.start) &&
          !isAfter(dateRange!.end, fetchedDateRange.end)
        ) {
          setNeedToFetch(false);
          console.log(
            "Skipping API request - data already available client-side (range within fetched range)",
          );
        }
      }

      if (needToFetch) {
        // Determine what date range to fetch
        let fetchStart = dateRange!.start;
        let fetchEnd = dateRange!.end;

        if (fetchedDateRange) {
          // Check if we need to fetch data for the start of the range
          const needFetchStart = isBefore(
            dateRange!.start,
            fetchedDateRange.start,
          );
          // Check if we need to fetch data for the end of the range
          const needFetchEnd = isAfter(
            dateRange!.end,
            fetchedDateRange.end,
          );

          console.log("Need fetch start:", needFetchStart);
          console.log("Need fetch end:", needFetchEnd);


          // If both conditions are false, we don't need to fetch anything
          if (!needFetchStart && !needFetchEnd) {
            // The new range is completely within the already fetched range
            setNeedToFetch(false);
            return;
          } else if (needFetchStart && !needFetchEnd) {
            // Only need to fetch data for the start of the range
            fetchStart = dateRange!.start;
            fetchEnd = new Date(fetchedDateRange.start);
            fetchEnd.setDate(fetchEnd.getDate() - 1);
          } else if (!needFetchStart && needFetchEnd) {
            // Only need to fetch data for the end of the range
            fetchStart = new Date(fetchedDateRange.end);
            fetchStart.setDate(fetchStart.getDate() + 1);
            fetchEnd = dateRange!.end;
          }
          // If both conditions are true, we fetch the entire range (default behavior)
        }

        if (needToFetch) {
          console.log(
            "Making API request for date range:",
            fetchStart,
            "to",
            fetchEnd,
          );
          console.log("Sensor IDs to fetch:", sensorIds);
          console.log("Date range to fetch:", dateRange);
          console.log("Fetched date range:", fetchedDateRange);
          console.log("Raw data length:", rawData.length);
          console.log("Need to fetch:", needToFetch);
          console.log("Data in range:", dataInRange.length);
          console.log("Has data in range:", hasDataInRange);
          console.log("Fetching new data...");
          const newData = await fetchData(fetchStart, fetchEnd, sensorIds);

          if (fetchedDateRange) {
            // Merge with existing data
            dataToProcess = [...rawData, ...newData];

            // Update the fetched date range
            const newStart = isBefore(dateRange!.start, fetchedDateRange.start)
              ? dateRange!.start
              : fetchedDateRange.start;

            const newEnd = isAfter(dateRange!.end, fetchedDateRange.end)
              ? dateRange!.end
              : fetchedDateRange.end;

            setFetchedDateRange({ start: newStart, end: newEnd });
          } else {
            // First fetch
            dataToProcess = newData;
            setFetchedDateRange(dateRange);
          }
          setLoading(true);
          setRawData(dataToProcess);
          setLoading(false);
        } else {
          // If we don't need to fetch, just use the existing data
          dataToProcess = rawData;
        }

        // Whether we fetched new data or not, we need to filter the data to match the current date range
        const filteredData = dataToProcess.filter((point) => {
          const pointDate = parseISO(point.timestamp);
          return (
            !isBefore(pointDate, dateRange!.start) &&
            !isAfter(pointDate, dateRange!.end)
          );
        });

        const groupedData = groupDataByTime(filteredData, groupBy);
        const transformedData = transformData(groupedData);
        setData(transformedData);
      } else {
        // Filter existing data to match the requested date range
        dataToProcess = rawData.filter((point) => {
          const pointDate = parseISO(point.timestamp);
          return (
            !isBefore(pointDate, dateRange!.start) &&
            !isAfter(pointDate, dateRange!.end)
          );
        });

        // Group and aggregate the data
        const groupedData = groupDataByTime(dataToProcess, groupBy);

        // Transform the data for the chart
        const transformedData = transformData(groupedData);
        setData(transformedData);
      }
    };

    fetchAndProcessData();
  }, [
    sensorIds,
    needToFetch,
    dateRange,
  ]);

  // Function to manually refetch data

  return { data, loading, error };
}
