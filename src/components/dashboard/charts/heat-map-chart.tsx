import React, { useState } from "react";
import { BaseChart } from "./base-chart.tsx";
import type { EChartsOption } from "echarts";
import { TransformedSensorData } from "../../../types/sensorDataResponse.ts";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface HeatMapChartProps {
  data: TransformedSensorData;
  className?: string;
  selectedMetric?: "in" | "out"; // Allow user to switch between in and out data
}

export const HeatMapChart: React.FC<HeatMapChartProps> = ({
  data,
  className = "",
  selectedMetric = "in",
}) => {
  const [displayMetric, setDisplayMetric] = useState<"in" | "out">(
    selectedMetric,
  );

  // Process the raw data into a format suitable for the heat map
  // This will aggregate the data by day of week and hour
  const processDataForHeatMap = () => {
    // Initialize a 7x24 matrix (7 days x 24 hours) filled with zeros
    const heatmapData: [number, number, number][] = [];
    const hourlyTotals: number[][] = Array(7)
      .fill(0)
      .map(() => Array(24).fill(0));

    // Count the data points for each day and hour
    if (data && data.timestamps && data.timestamps.length > 0) {
      data.timestamps.forEach((timestamp, i) => {
        try {
          // Custom parsing for timestamps in format "May 24, 00:00"
          let date: Date;

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
                date = new Date(currentYear, month, day, hours, minutes);
              } else {
                console.warn(`Cannot parse timestamp parts: ${timestamp}`);
                return; // Skip this iteration
              }
            } else {
              console.warn(`Unexpected timestamp format: ${timestamp}`);
              return; // Skip this iteration
            }
          } else {
            // Try standard date parsing for other formats
            date = new Date(timestamp);
          }

          // Check if the date is valid
          if (isNaN(date.getTime())) {
            console.warn(`Invalid timestamp after parsing: ${timestamp}`);
            return; // Skip this iteration
          }

          const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
          const hour = date.getHours();

          // Validate dayOfWeek and hour are within expected ranges
          if (dayOfWeek < 0 || dayOfWeek > 6 || hour < 0 || hour > 23) {
            console.warn(
              `Invalid day/hour: ${dayOfWeek}/${hour} from timestamp ${timestamp}`,
            );
            return; // Skip this iteration
          }

          // Get the value based on selected metric (in or out)
          const value = data[displayMetric][i] || 0;

          // Accumulate the value for this day and hour
          hourlyTotals[dayOfWeek][hour] += value;
        } catch (error) {
          console.error(`Error processing timestamp ${timestamp}:`, error);
        }
      });
    }

    // Convert the accumulated data to the format expected by ECharts
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData.push([hour, day, hourlyTotals[day][hour]]);
      }
    }

    return heatmapData;
  };

  const heatmapData = processDataForHeatMap();

  const toggleMetric = () => {
    setDisplayMetric((prev) => (prev === "in" ? "out" : "in"));
  };

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: any) => {
        const day = DAYS[params.value[1]];
        const hour = params.value[0];
        const value = params.value[2];
        return `${day}, ${hour}:00 - ${hour + 1}:00<br/>${
          displayMetric === "in" ? "Entries" : "Exits"
        }: ${value}`;
      },
    },
    grid: {
      height: "70%",
      top: "15%",
    },
    xAxis: {
      type: "category",
      data: HOURS.map((h) => `${h}:00`),
      splitArea: {
        show: true,
      },
      name: "Hour of Day",
      nameLocation: "middle",
      nameGap: 35,
    },
    yAxis: {
      type: "category",
      data: DAYS,
      splitArea: {
        show: true,
      },
      name: "Day of Week",
      nameLocation: "middle",
      nameGap: 50,
    },
    visualMap: {
      min: 0,
      max: Math.max(...heatmapData.map((item) => item[2]), 10),
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "5%",
      textStyle: {
        color: "#333",
      },
    },
    series: [
      {
        name: displayMetric === "in" ? "Entries" : "Exits",
        type: "heatmap",
        data: heatmapData,
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
    title: {
      text: `${displayMetric === "in" ? "Entries" : "Exits"} by Day and Hour`,
      left: "center",
      top: 0,
    },
    toolbox: {
      feature: {
        dataZoom: {},
        saveAsImage: {},
      },
      right: "5%",
    },
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleMetric}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Show {displayMetric === "in" ? "Exits" : "Entries"}
        </button>
      </div>
      <div className="h-[400px]">
        <BaseChart option={option} className={className} />
      </div>
    </div>
  );
};
