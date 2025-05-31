# Modularizing the Large useEffect in useSensorRecords

The current implementation has a large useEffect with multiple responsibilities, making it difficult to maintain and test. Here's how to modularize it into smaller, focused components:

## 1. Split into Custom Hooks and Utility Functions

### A. Create a Hook for Determining Fetch Necessity

```typescript
// hooks/sensor-data/useFetchNecessity.ts
import { useCallback } from "react";
import { isBefore, isAfter } from "date-fns";

export function useFetchNecessity() {
  return useCallback(
    (
      dateRange: { start: Date; end: Date } | null,
      fetchedDateRange: { start: Date; end: Date } | null,
      rawData: SensorDataPoint[],
      pointsInRange: SensorDataPoint[],
    ): boolean => {
      // No need to fetch if no date range or already fetched
      if (!dateRange) return false;

      // First fetch case
      if (!fetchedDateRange) {
        console.log("First fetch - no previously fetched data");
        return true;
      }

      // Check if new range extends beyond fetched range
      if (
        isBefore(dateRange.start, fetchedDateRange.start) ||
        (isAfter(dateRange.end, fetchedDateRange.end) &&
          !isAfter(dateRange.end, new Date()))
      ) {
        console.log("New range extends beyond fetched range");
        return true;
      }

      // Check if it's the same range
      const isSameRange =
        dateRange.start.getTime() === fetchedDateRange.start.getTime() &&
        dateRange.end.getTime() === fetchedDateRange.end.getTime();

      if (isSameRange) {
        console.log(
          "Skipping API request - date range is the same as previously fetched",
        );
        return false;
      }

      // Check if we have data in the requested range and it's within the fetched range
      const hasDataInRange = pointsInRange.length > 0;
      if (
        hasDataInRange &&
        !isBefore(dateRange.start, fetchedDateRange.start) &&
        !isAfter(dateRange.end, fetchedDateRange.end)
      ) {
        console.log(
          "Skipping API request - data already available client-side",
        );
        return false;
      }

      return true;
    },
    [],
  );
}
```

### B. Create a Utility for Calculating Fetch Range

```typescript
// utils/calculateFetchRange.ts
import { isBefore, isAfter } from "date-fns";

export function calculateFetchRange(
  dateRange: { start: Date; end: Date },
  fetchedDateRange: { start: Date; end: Date } | null,
): { fetchStart: Date; fetchEnd: Date; shouldFetch: boolean } {
  let fetchStart = dateRange.start;
  let fetchEnd = dateRange.end;
  let shouldFetch = true;

  if (fetchedDateRange) {
    // Check if we need to fetch data for the start/end of the range
    const needFetchStart = isBefore(dateRange.start, fetchedDateRange.start);
    const needFetchEnd = isAfter(dateRange.end, fetchedDateRange.end);

    console.log("Need fetch start:", needFetchStart);
    console.log("Need fetch end:", needFetchEnd);

    if (!needFetchStart && !needFetchEnd) {
      // The new range is completely within the already fetched range
      shouldFetch = false;
    } else if (needFetchStart && !needFetchEnd) {
      // Only need to fetch data for the start of the range
      fetchStart = dateRange.start;
      fetchEnd = new Date(fetchedDateRange.start);
    } else if (!needFetchStart && needFetchEnd) {
      // Only need to fetch data for the end of the range
      fetchStart = new Date(fetchedDateRange.end);
      fetchEnd = dateRange.end;
    }
    // If both are true, fetch the entire range (default behavior)
  }

  return { fetchStart, fetchEnd, shouldFetch };
}
```

### C. Create a Hook for Data Filtering

```typescript
// hooks/sensor-data/useDataFiltering.ts
import { useCallback } from "react";
import { isBefore, isAfter, parseISO } from "date-fns";

export function useDataFiltering() {
  return useCallback(
    (
      data: SensorDataPoint[],
      dateRange: { start: Date; end: Date } | null,
    ): SensorDataPoint[] => {
      if (!dateRange || !data.length) return [];

      return data.filter((point) => {
        const pointDate = parseISO(point.timestamp);
        return (
          !isBefore(pointDate, dateRange.start) &&
          !isAfter(pointDate, dateRange.end)
        );
      });
    },
    [],
  );
}
```

### D. Create a Hook for Data Processing

```typescript
// hooks/sensor-data/useDataProcessing.ts
import { useCallback } from "react";

export function useDataProcessing(
  timeSeriesAggregator: any,
  transformData: any,
) {
  return useCallback(
    (
      filteredData: SensorDataPoint[],
      groupBy: GroupByTimeAmount,
    ): TransformedSensorData => {
      const groupedData = timeSeriesAggregator(filteredData, groupBy);
      return transformData(groupedData);
    },
    [timeSeriesAggregator, transformData],
  );
}
```

## 2. Refactored Main Hook

Now we can refactor the main hook to use these modular components:

```typescript
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

  // Custom hooks
  const fetchData = useFetchData();
  const checkFetchNecessity = useFetchNecessity();
  const filterData = useDataFiltering();
  const timeSeriesAggregator = useTimeSeriesAggregator(aggregationType);
  const transformData = useTransformData();
  const processData = useDataProcessing(timeSeriesAggregator, transformData);

  // Process data when groupBy or aggregationType changes
  useEffect(() => {
    if (!dateRange || !rawData.length) return;

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
        rawData,
        dataInRange,
      );

      setNeedToFetch(shouldFetch);

      if (shouldFetch) {
        // Calculate optimal fetch range
        const {
          fetchStart,
          fetchEnd,
          shouldFetch: confirmFetch,
        } = calculateFetchRange(dateRange, fetchedDateRange);

        if (!confirmFetch) {
          setNeedToFetch(false);
          return;
        }

        // Fetch and process data
        setLoading(true);
        const newData = await fetchData(fetchStart, fetchEnd, sensorIds);

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

          setFetchedDateRange({ start: newStart, end: newEnd });
        } else {
          // First fetch
          dataToProcess = newData;
          setFetchedDateRange(dateRange);
        }

        setRawData(dataToProcess);
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
  }, [sensorIds, dateRange, needToFetch]);

  return { data, loading, error };
}
```

## 3. Benefits of This Approach

1. **Single Responsibility**: Each hook or utility has a clear, focused purpose
2. **Testability**: Smaller functions are easier to test in isolation
3. **Reusability**: These hooks can be reused in other components
4. **Readability**: The main hook is now more concise and easier to understand
5. **Maintainability**: Changes to one aspect (e.g., fetch logic) won't affect other parts

This modular approach makes the code more maintainable and easier to reason about, while preserving all the original functionality.
