import { TransformedSensorData } from "../../../../types/sensorDataResponse";

/**
 * Constants for days and hours
 */
export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * Date parsing and processing functions
 */

/**
 * Parses a timestamp in various formats including "May 24, 00:00"
 * @param timestamp The timestamp to parse
 * @returns Parsed Date object or null if parsing fails
 */
export function parseTimestamp(timestamp: string): Date | null {
  try {
    // Custom parsing for timestamps in format "May 24, 00:00"
    if (typeof timestamp === "string" && timestamp.includes(",")) {
      const parts = timestamp.split(", ");
      if (parts.length === 2) {
        const datePart = parts[0]; // e.g. "May 24"
        const timePart = parts[1]; // e.g. "00:00"

        // Parse the time
        const [hours, minutes] = timePart.split(":").map(Number);

        // Parse the date - we'll assume current year since it's not in the string
        const currentYear = new Date().getFullYear();
        const monthDay = datePart.split(" ");

        // Map month name to number (0-based)
        const months: Record<string, number> = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };

        const month = months[monthDay[0]];
        const day = parseInt(monthDay[1], 10);

        if (!isNaN(month) && !isNaN(day) && !isNaN(hours) && !isNaN(minutes)) {
          return new Date(currentYear, month, day, hours, minutes);
        } else {
          console.warn(`Cannot parse timestamp parts: ${timestamp}`);
          return null;
        }
      } else {
        console.warn(`Unexpected timestamp format: ${timestamp}`);
        return null;
      }
    } else {
      // Try standard date parsing for other formats
      const date = new Date(timestamp);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid timestamp after parsing: ${timestamp}`);
        return null;
      }

      return date;
    }
  } catch (error) {
    console.error(`Error processing timestamp ${timestamp}:`, error);
    return null;
  }
}

/**
 * Process the data for the heat map
 * @param data The sensor data
 * @param displayMetric Which metric to display (in or out)
 * @returns Processed heatmap data and maximum value
 */
export function processDataForHeatMap(
  data: TransformedSensorData,
  displayMetric: "in" | "out"
): { heatmapData: [number, number, number][]; maxValue: number } {
  // Initialize a 7x24 matrix (7 days x 24 hours) filled with zeros
  const heatmapData: [number, number, number][] = [];
  const hourlyTotals: number[][] = Array(7)
    .fill(0)
    .map(() => Array(24).fill(0));

  // Count the data points for each day and hour
  if (data && data.timestamps && data.timestamps.length > 0) {
    data.timestamps.forEach((timestamp, i) => {
      const date = parseTimestamp(timestamp);

      if (!date) return; // Skip if timestamp parsing failed

      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const hour = date.getHours();

      // Validate dayOfWeek and hour are within expected ranges
      if (dayOfWeek < 0 || dayOfWeek > 6 || hour < 0 || hour > 23) {
        console.warn(
          `Invalid day/hour: ${dayOfWeek}/${hour} from timestamp ${timestamp}`
        );
        return; // Skip this iteration
      }

      // Get the value based on selected metric (in or out)
      const value = data[displayMetric][i] || 0;

      // Accumulate the value for this day and hour
      hourlyTotals[dayOfWeek][hour] += value;
    });
  }

  // Convert the accumulated data to the format expected by ECharts
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      heatmapData.push([hour, day, hourlyTotals[day][hour]]);
    }
  }

  const maxValue = Math.max(...heatmapData.map((item) => item[2]), 10);

  return {
    heatmapData,
    maxValue,
  };
}
