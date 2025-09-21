import { useEffect, useState, useCallback, useRef } from "react";
import {
  SensorDataResponse,
  TransformedSensorDataByLocation,
} from "../types/sensorDataResponse";
import { isAfter, isBefore } from "date-fns";
import { useTimeSeriesAggregatorByLocation } from "./sensor-data/useTimeSeriesAggregatorByLocation";
import { useTransformDataByLocation } from "./sensor-data/useTransformDataByLocation.ts";
import { useFetchNecessity } from "./sensor-data/useFetchNeccesity.ts";
import { useDataFilteringByLocation } from "./sensor-data/useDataFilteringByLocation.ts";
import { useDataProcessingByLocation } from "./sensor-data/useDataProcessingByLocation.ts";
import { calculateFetchRange } from "../utils/sensor-data/calculate-fetch-range.ts";
import { useFetchDataByLocation } from "./sensor-data/useFetchDataByLocation.ts";
import { SensorRecordsFormData } from "../types/sensorRecordsFormData";
import { getUserRoleFromToken } from "./auth/useAuth";
import { generateMockSensorDataByLocation } from "../utils/dataUtils";

interface UseSensorRecordsResult {
  data: TransformedSensorDataByLocation[];
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

  const [data, setData] = useState<TransformedSensorDataByLocation[]>([]);
  const [rawDataByLocation, setRawDataByLocation] = useState<
    SensorDataResponse[]
  >([]);
  const [prevSensorIds, setPrevSensorIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Custom hooks
  const fetchData = useFetchDataByLocation();
  const checkFetchNecessity = useFetchNecessity();
  const filterData = useDataFilteringByLocation();
  const timeSeriesAggregator =
    useTimeSeriesAggregatorByLocation(aggregationType);
  const transformData = useTransformDataByLocation();
  const processData = useDataProcessingByLocation(
    timeSeriesAggregator,
    transformData,
  );

  // Use refs for values that don't need to trigger callback recreation
  const processDataRef = useRef(processData);
  const groupByRef = useRef(groupBy);

  processDataRef.current = processData;
  groupByRef.current = groupBy;

  // Mock data fetching function for unauthenticated users
  const fetchMockData = useCallback(
    async (
      startDate: Date,
      endDate: Date,
      sensorIds: number[],
      setError: (error: string) => void,
    ): Promise<SensorDataResponse[]> => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        return generateMockSensorDataByLocation(startDate, endDate, sensorIds);
      } catch (error) {
        console.error("Error generating mock sensor data:", error);
        setError("Error generating mock data");
        return [];
      }
    },
    [],
  );

  // Helper function to convert SensorDataPoint[] to SensorDataResponse[] for compatibility
  const convertRawDataToByLocation = useCallback(
    (rawData: any[]): SensorDataResponse[] => {
      // If rawData is already in the correct format, return as is
      if (rawData.length > 0 && "location_id" in rawData[0]) {
        return rawData as SensorDataResponse[];
      }

      // Otherwise, we need to convert from the old format
      // For now, create a single location with all data
      return [
        {
          location_id: 0,
          location_name: "Combined Location",
          data: rawData,
        },
      ];
    },
    [],
  );

  // Stable process function to avoid dependency issues
  const processDataCallback = useCallback(
    async (
      currentDateRange: { start: Date; end: Date },
      currentSensorIds: number[],
      currentRawDataByLocation: SensorDataResponse[],
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
        if (
          prevSensorIds.length > 0 &&
          prevSensorIds.join(",") !== currentSensorIds.join(",")
        ) {
          setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
            ...prev,
            fetchedDateRange: null,
            rawData: [],
          }));
          setRawDataByLocation([]);
          setPrevSensorIds(currentSensorIds);
          return; // Exit early, will re-trigger with new data
        }

        // Set prevSensorIds on first run
        if (prevSensorIds.length === 0) {
          setPrevSensorIds(currentSensorIds);
        }

        // Filter data in the requested range
        const dataInRange = filterData(
          currentRawDataByLocation,
          currentDateRange,
        );

        // Check if we need to fetch new data (using flat data for compatibility)
        const flatData = currentRawDataByLocation.flatMap(
          (location) => location.data,
        );
        const shouldFetch = checkFetchNecessity(
          currentDateRange,
          currentFetchedDateRange,
          flatData,
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
            const processedData = processDataRef.current(
              dataInRange,
              groupByRef.current,
            );
            setData(processedData);
            return;
          }

          // Check if user is authenticated
          const userRole = getUserRoleFromToken();

          // Fetch and process data
          setLoading(true);

          let newData: SensorDataResponse[];

          if (userRole) {
            // Use real API for authenticated users (not free trial)
            newData = await fetchData(
              fetchStart,
              fetchEnd,
              currentSensorIds,
              setError,
            );
          } else {
            // Use mock data for unauthenticated users and free trial users
            newData = await fetchMockData(
              fetchStart,
              fetchEnd,
              currentSensorIds,
              setError,
            );
          }

          let dataToProcess: SensorDataResponse[] = [];

          if (currentFetchedDateRange) {
            // Merge with existing data by location
            const locationMap = new Map<number, SensorDataResponse>();

            // Add existing data
            currentRawDataByLocation.forEach((location) => {
              locationMap.set(location.location_id, { ...location });
            });

            // Merge new data
            newData.forEach((newLocation) => {
              if (locationMap.has(newLocation.location_id)) {
                const existing = locationMap.get(newLocation.location_id)!;
                locationMap.set(newLocation.location_id, {
                  ...existing,
                  data: [...existing.data, ...newLocation.data],
                });
              } else {
                locationMap.set(newLocation.location_id, { ...newLocation });
              }
            });

            dataToProcess = Array.from(locationMap.values());

            // Update the fetched date range
            const newStart = isBefore(
              currentDateRange.start,
              currentFetchedDateRange.start,
            )
              ? currentDateRange.start
              : currentFetchedDateRange.start;

            const newEnd = isAfter(
              currentDateRange.end,
              currentFetchedDateRange.end,
            )
              ? currentDateRange.end
              : currentFetchedDateRange.end;

            setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
              ...prev,
              fetchedDateRange: { start: newStart, end: newEnd },
              rawData: dataToProcess.flatMap((location) => location.data), // Keep as SensorDataPoint[] for compatibility
            }));
          } else {
            // First fetch
            dataToProcess = newData;
            setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
              ...prev,
              fetchedDateRange: {
                start: currentDateRange.start,
                end: currentDateRange.end,
              },
              rawData: dataToProcess.flatMap((location) => location.data), // Keep as SensorDataPoint[] for compatibility
            }));
          }

          setRawDataByLocation(dataToProcess);
          setLoading(false);

          // Process the data
          const filteredData = filterData(dataToProcess, currentDateRange);
          const processedData = processDataRef.current(
            filteredData,
            groupByRef.current,
          );
          setData(processedData);
        } else {
          // Use existing data - reprocess when groupBy or aggregationType changes
          console.log("groupBy or aggregationType changed, reprocessing data");
          const processedData = processDataRef.current(
            dataInRange,
            groupByRef.current,
          );
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
      setSensorRecordsFormData,
      prevSensorIds,
      fetchMockData,
    ],
  );

  // Effect to handle data changes
  useEffect(() => {
    if (!dateRange || sensorIds.length === 0) return;

    // Use existing rawDataByLocation if available, otherwise convert rawData
    const currentRawDataByLocation =
      rawDataByLocation.length > 0
        ? rawDataByLocation
        : convertRawDataToByLocation(rawData);

    if (rawDataByLocation.length === 0) {
      setRawDataByLocation(currentRawDataByLocation);
    }

    processDataCallback(
      dateRange,
      sensorIds,
      currentRawDataByLocation,
      fetchedDateRange,
    );
  }, [
    dateRange?.start.getTime(),
    dateRange?.end.getTime(),
    sensorIds.join(","),
    groupBy,
    aggregationType,
    hourRange?.start.toString(),
    hourRange?.end.toString(),
    rawData.length,
    rawDataByLocation.length,
    fetchedDateRange?.start.getTime(),
    fetchedDateRange?.end.getTime(),
    processDataCallback,
    convertRawDataToByLocation,
  ]);

  return { data, loading, error };
}
