import { useEffect, useState } from "react";
import {
  SensorDataPoint,
  TransformedSensorData,
} from "../types/sensorDataResponse";
import { isAfter, isBefore } from "date-fns";
import { useTimeSeriesAggregator } from "./sensor-data/useTimeSeriesAggregator";
import { useTransformData } from "./sensor-data/useTransformData.ts";
import { useFetchNecessity } from "./sensor-data/useFetchNeccesity.ts";
import { useDataFiltering } from "./sensor-data/useDataFiltering.ts";
import { useDataProcessing } from "./sensor-data/useDataProcessing.ts";
import { calculateFetchRange } from "../utils/sensor-data/calculate-fetch-range.ts";
import { useFetchData } from "./sensor-data/useFetchData.ts";
import { SensorRecordsFormData } from "../types/sensorRecordsFormData";

interface UseSensorRecordsResult {
  data: TransformedSensorData;
  loading: boolean;
  error: string | null;
}

export function useSensorRecords(
  sensorRecordsFormData: SensorRecordsFormData,
  setSensorRecordsFormData: (
    formData: (prev: SensorRecordsFormData) => SensorRecordsFormData,
  ) => void,
): UseSensorRecordsResult {
  const {
    sensorIds,
    dateRange,
    fetchedDateRange,
    hourRange,
    rawData,
    groupBy,
    aggregationType,
    needToFetch,
  } = sensorRecordsFormData;
  const [data, setData] = useState<TransformedSensorData>({
    timestamps: [],
    in: [],
    out: [],
  });
  const [prevSensorIds, setPrevSensorIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Custom hooks
  const fetchData = useFetchData();
  const checkFetchNecessity = useFetchNecessity();
  const filterData = useDataFiltering();
  const timeSeriesAggregator = useTimeSeriesAggregator(aggregationType);
  const transformData = useTransformData();
  const processData = useDataProcessing(timeSeriesAggregator, transformData);

  // Process data when groupBy or aggregationType changes
  useEffect(() => {
    if (!dateRange || !rawData) return;

    const filteredData = filterData(rawData, dateRange);
    const processedData = processData(filteredData, groupBy);
    setData(processedData);
  }, [groupBy, aggregationType, dateRange, rawData, filterData, processData]);

  // Main effect to fetch data when needed
  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!dateRange || sensorIds.length === 0) return;

      // Filter data in the requested range
      const dataInRange = filterData(rawData, dateRange);

      // Check if we need to fetch new data
      const shouldFetch = checkFetchNecessity(
        dateRange,
        fetchedDateRange,
        dataInRange,
      );

      setSensorRecordsFormData((prev: SensorRecordsFormData) => {
        return {
          ...prev,
          needToFetch: shouldFetch,
        };
      });

      if (prevSensorIds !== sensorIds) {
        setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
          ...prev,
          fetchedDateRange: null,
          rawData: [],
        }));
        setPrevSensorIds(sensorIds);
      }

      if (shouldFetch) {
        // Calculate optimal fetch range
        const {
          fetchStart,
          fetchEnd,
          shouldFetch: confirmFetch,
        } = calculateFetchRange(dateRange, fetchedDateRange);

        if (!confirmFetch) {
          setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
            ...prev,
            needToFetch: false,
          }));
          return;
        }

        // Fetch and process data
        setLoading(true);
        const newData = await fetchData(
          fetchStart,
          fetchEnd,
          sensorIds,
          setError,
        );

        let dataToProcess: SensorDataPoint[] = [];

        if (fetchedDateRange) {
          // Merge with existing data
          dataToProcess = [...rawData, ...newData];

          // Update the fetched date range
          const newStart = isBefore(dateRange.start, fetchedDateRange.start)
            ? dateRange.start
            : fetchedDateRange.start;

          const newEnd = isAfter(dateRange.end, fetchedDateRange.end)
            ? dateRange.end
            : fetchedDateRange.end;

          setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
            ...prev,
            fetchedDateRange: { start: newStart, end: newEnd },
          }));
        } else {
          // First fetch
          dataToProcess = newData;
          setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
            ...prev,
            fetchedDateRange: { start: dateRange.start, end: dateRange.end },
          }));
        }

        setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
          ...prev,
          rawData: dataToProcess,
        }));
        setLoading(false);

        // Process the data
        const filteredData = filterData(dataToProcess, dateRange);
        const processedData = processData(filteredData, groupBy);
        setData(processedData);
      } else {
        // Use existing data
        const processedData = processData(dataInRange, groupBy);
        setData(processedData);
      }
    };

    fetchAndProcessData();
  }, [sensorIds, dateRange, groupBy, aggregationType, needToFetch, hourRange]);

  return { data, loading, error };
}
