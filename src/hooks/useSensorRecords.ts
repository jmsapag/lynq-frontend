import { useEffect, useState, useCallback, useRef } from "react";
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
  } = sensorRecordsFormData;
  const [data, setData] = useState<TransformedSensorData>({
    timestamps: [],
    in: [],
    out: [],
  });
  const [prevSensorIds, setPrevSensorIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Custom hooks
  const fetchData = useFetchData();
  const checkFetchNecessity = useFetchNecessity();
  const filterData = useDataFiltering();
  const timeSeriesAggregator = useTimeSeriesAggregator(aggregationType);
  const transformData = useTransformData();
  const processData = useDataProcessing(timeSeriesAggregator, transformData);

  // Stable process function to avoid dependency issues
  const processDataCallback = useCallback(
    async (
      currentDateRange: { start: Date; end: Date },
      currentSensorIds: number[],
      currentRawData: SensorDataPoint[],
      currentFetchedDateRange: { start: Date; end: Date } | null,
    ) => {
      // Early return if already processing
      if (isProcessingRef.current) {
        console.log("Already processing, skipping...");
        return;
      }

      isProcessingRef.current = true;
      console.log("Checking if data fetch is needed...");

      try {
        // Handle sensor IDs change
        if (prevSensorIds.length > 0 && prevSensorIds.join(',') !== currentSensorIds.join(',')) {
          setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
            ...prev,
            fetchedDateRange: null,
            rawData: [],
          }));
          setPrevSensorIds(currentSensorIds);
          return; // Exit early, will re-trigger with new data
        }

        // Set prevSensorIds on first run
        if (prevSensorIds.length === 0) {
          setPrevSensorIds(currentSensorIds);
        }

        // Filter data in the requested range
        const dataInRange = filterData(currentRawData, currentDateRange);

        // Check if we need to fetch new data
        const shouldFetch = checkFetchNecessity(
          currentDateRange,
          currentFetchedDateRange,
          dataInRange,
        );

        if (shouldFetch) {
          console.log("New range extends beyond fetched range");
          // Calculate optimal fetch range
          const {
            fetchStart,
            fetchEnd,
            shouldFetch: confirmFetch,
          } = calculateFetchRange(currentDateRange, currentFetchedDateRange);

          if (!confirmFetch) {
            // Process existing data
            const processedData = processData(dataInRange, groupBy);
            setData(processedData);
            return;
          }

          // Fetch and process data
          setLoading(true);
          const newData = await fetchData(
            fetchStart,
            fetchEnd,
            currentSensorIds,
            setError,
          );

          let dataToProcess: SensorDataPoint[] = [];

          if (currentFetchedDateRange) {
            // Merge with existing data
            dataToProcess = [...currentRawData, ...newData];

            // Update the fetched date range
            const newStart = isBefore(currentDateRange.start, currentFetchedDateRange.start)
              ? currentDateRange.start
              : currentFetchedDateRange.start;

            const newEnd = isAfter(currentDateRange.end, currentFetchedDateRange.end)
              ? currentDateRange.end
              : currentFetchedDateRange.end;

            setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
              ...prev,
              fetchedDateRange: { start: newStart, end: newEnd },
              rawData: dataToProcess,
            }));
          } else {
            // First fetch
            dataToProcess = newData;
            setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
              ...prev,
              fetchedDateRange: { start: currentDateRange.start, end: currentDateRange.end },
              rawData: dataToProcess,
            }));
          }

          setLoading(false);

          // Process the data
          const filteredData = filterData(dataToProcess, currentDateRange);
          const processedData = processData(filteredData, groupBy);
          setData(processedData);
        } else {
          // Use existing data - reprocess when groupBy or aggregationType changes
          console.log("groupBy or aggregationType changed, reprocessing data");
          const processedData = processData(dataInRange, groupBy);
          setData(processedData);
        }
      } finally {
        isProcessingRef.current = false;
      }
    },
    [
      fetchData,
      checkFetchNecessity,
      filterData,
      processData,
      setSensorRecordsFormData,
      prevSensorIds,
      groupBy,
    ]
  );

  // Effect to handle data changes
  useEffect(() => {
    if (!dateRange || sensorIds.length === 0) return;

    processDataCallback(dateRange, sensorIds, rawData, fetchedDateRange);
  }, [
    dateRange?.start.getTime(),
    dateRange?.end.getTime(),
    sensorIds.join(','),
    groupBy,
    aggregationType,
    hourRange?.start,
    hourRange?.end,
    processDataCallback,
  ]);

  return { data, loading, error };
}
