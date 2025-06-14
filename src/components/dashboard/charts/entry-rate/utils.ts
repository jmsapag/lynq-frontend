import { TransformedSensorData } from "../../../../types/sensorDataResponse";

/**
 * Process sensor data to calculate entry rate percentages
 * @param data TransformedSensorData containing 'in' and 'out' arrays
 * @returns Array of entry rate percentages
 */
export function calculateEntryRates(data: TransformedSensorData): number[] {
  if (!data || !data.in || !data.out || data.in.length === 0) {
    return [];
  }

  return data.in.map((inValue, index) => {
    const outValue = data.out[index] || 0;
    const total = inValue + outValue;
    // Handle division by zero - if no traffic, return 0
    return total > 0 ? Math.round((inValue / total) * 100) : 0;
  });
}
