import { sensorResponse } from "../types/deviceResponse";
import { SensorDataPoint } from "../types/sensorDataResponse.ts";

export const mockSensorData: sensorResponse[] = [
  {
    id: "1",
    name: "Street market",
    sensors: [
      {
        id: 7,
        position: "South Wing 1",
        provider: "FootFallCam",
      },
      {
        id: 8,
        position: "North Wing 2",
        provider: "Xovis",
      },
      {
        id: 9,
        position: "South Wing 3",
        provider: "FootFallCam",
      },
      {
        id: 10,
        position: "Exit Door 1",
        provider: "Xovis",
      },
      {
        id: 11,
        position: "Emergency Exit 2",
        provider: "Xovis",
      },
    ],
  },
  {
    id: "4",
    name: "Riverside Outlets",
    sensors: [
      {
        id: 18,
        position: "North Wing 1",
        provider: "FootFallCam",
      },
      {
        id: 19,
        position: "Entertainment Zone 2",
        provider: "FootFallCam",
      },
      {
        id: 20,
        position: "Side Entrance 1",
        provider: "Xovis",
      },
      {
        id: 21,
        position: "Exit Door 2",
        provider: "Xovis",
      },
    ],
  },
];

export const generateMockSensorData = (
  startDate: Date,
  endDate: Date,
  sensorIds: number[],
): SensorDataPoint[] => {
  const mockData: SensorDataPoint[] = [];
  const currentDate = new Date(startDate);

  // Find the relevant locations for the requested sensors
  const relevantLocations = mockSensorData.filter((location) =>
    location.sensors.some((sensor) => sensorIds.includes(sensor.id)),
  );

  while (currentDate <= endDate) {
    // Generate data for each 5-minute interval
    const timestamp = currentDate.toISOString();

    // Generate realistic random data based on number of relevant locations
    // This simulates the merging behavior that happens in useFetchData
    const locationMultiplier = relevantLocations.length || 1;

    const total_count_in =
      Math.floor(Math.random() * 25 * locationMultiplier) + 5;
    const total_count_out =
      Math.floor(Math.random() * 20 * locationMultiplier) + 3;
    const outsideTraffic =
      Math.floor(Math.random() * 100 * locationMultiplier) + 50;
    const avgVisitDuration = Math.random() * 30 + 10; // Average doesn't multiply
    const returningCustomer = Math.floor(Math.random() * 60) + 20; // Percentage doesn't multiply

    mockData.push({
      timestamp,
      total_count_in,
      total_count_out,
      outsideTraffic,
      avgVisitDuration,
      returningCustomer,
    });

    // Increment by 5 minutes
    currentDate.setMinutes(currentDate.getMinutes() + 5);
  }

  return mockData;
};
