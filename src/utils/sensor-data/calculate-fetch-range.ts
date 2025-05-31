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
