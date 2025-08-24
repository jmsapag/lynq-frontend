import React from "react";
import { BaseChart } from "./base-chart.tsx";
import type { EChartsOption } from "echarts";
import { useTranslation } from "react-i18next";
import { GroupByTimeAmount } from "../../../types/sensorDataResponse.ts";

type CumulativeChartDataItem = {
  in: number;
  out: number;
};

interface CumulativeChartProps {
  data: {
    categories: string[];
    values: CumulativeChartDataItem[];
  };
  groupBy: GroupByTimeAmount;
  className?: string;
}

/**
 * Utility function to detect day changes in timestamps
 * @param timestamp1 First timestamp string
 * @param timestamp2 Second timestamp string
 * @returns true if the timestamps are on different days
 */
const isDifferentDay = (timestamp1: string, timestamp2: string): boolean => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  
  return (
    date1.getFullYear() !== date2.getFullYear() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getDate() !== date2.getDate()
  );
};

/**
 * Calculate cumulative entries with daily reset functionality
 * @param categories Array of timestamp strings
 * @param values Array of in/out data
 * @returns Array of cumulative entry values that reset at the start of each day
 */
const calculateCumulativeWithDailyReset = (
  categories: string[],
  values: CumulativeChartDataItem[]
): number[] => {
  if (!categories.length || !values.length) return [];

  const cumulativeData: number[] = [];
  let dailyAccumulator = 0;

  values.forEach((current, index) => {
    // Only count entries (in), ignore exits (out)
    const entries = current.in;
    
    // Check if this is a new day (reset accumulator)
    if (index > 0 && isDifferentDay(categories[index - 1], categories[index])) {
      dailyAccumulator = 0; // Reset accumulator for new day
    }
    
    // Add current entries to daily accumulator
    dailyAccumulator += entries;
    
    // Store the cumulative entries for this time period
    cumulativeData.push(dailyAccumulator);
  });

  return cumulativeData;
};

export const CumulativeChart: React.FC<CumulativeChartProps> = ({
  data,
  groupBy,
  className,
}) => {
  const { t } = useTranslation();
  const start: number = (() => {
    switch (groupBy) {
      case "month":
        return 0;
      case "week":
        return 0;
      case "day":
        return 0;
      case "hour":
        return 50;
      case "30min":
        return 70;
      case "15min":
        return 85;
      case "10min":
        return 90;
      case "5min":
        return 95;
      default:
        return 0;
    }
  })();

  // Calculate cumulative data with daily reset functionality
  const cumulativeData = calculateCumulativeWithDailyReset(data.categories, data.values);

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex;
        const category = data.categories[dataIndex];
        const currentIn = data.values[dataIndex].in;
        const currentOut = data.values[dataIndex].out;
        const totalEntries = cumulativeData[dataIndex];
        
        // Check if this is the start of a new day (for visual indicator)
        const isNewDay = dataIndex > 0 && isDifferentDay(
          data.categories[dataIndex - 1], 
          data.categories[dataIndex]
        );
        
        const newDayIndicator = isNewDay 
          ? `<div class="text-xs text-orange-500 mb-1">📅 ${t("dashboard.charts.dailyReset", "Daily Reset")}</div>` 
          : '';

        return `
          <div class="text-sm">
            <div class="font-semibold">${category}</div>
            ${newDayIndicator}
            <div class="mt-1">
              <div>${t("dashboard.charts.entries")}: <span class="text-green-500">${currentIn}</span></div>
              <div>${t("dashboard.charts.exits")}: <span class="text-red-500">${currentOut}</span></div>
              <div class="font-semibold border-t pt-1 mt-1">${t("dashboard.charts.cumulativeEntries", "Cumulative Entries")}: <span class="text-blue-500">${totalEntries}</span></div>
              <div class="text-xs text-gray-500 mt-1">${t("dashboard.charts.cumulativeNote", "Cumulative count resets daily at midnight")}</div>
            </div>
          </div>
        `;
      },
    },
    legend: {
      data: [t("dashboard.charts.cumulativeEntries", "Cumulative Entries")],
    },
    xAxis: {
      type: "category",
      data: data.categories,
    },
    yAxis: {
      type: "value",
      name: t("dashboard.charts.cumulativeEntries", "Cumulative Entries"),
      nameLocation: "middle",
      nameGap: 50,
      min: 0,
    },
    dataZoom: [
      {
        type: "inside",
        start,
        end: 100,
        moveOnMouseMove: true,
      },
    ],
    series: [
      {
        name: t("dashboard.charts.cumulativeEntries", "Cumulative Entries"),
        type: "line",
        data: cumulativeData,
        smooth: true,
        areaStyle: {
          opacity: 0.3,
        },
        lineStyle: {
          color: "#10b981", // Green color for entries
          width: 2,
        },
        itemStyle: {
          color: "#10b981", // Green color for entries
        },
        // Add markers for daily resets
        markPoint: {
          symbol: "circle",
          symbolSize: 8,
          itemStyle: {
            color: "#f59e0b",
            borderColor: "#ffffff",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              formatter: t("dashboard.charts.dailyReset", "Daily Reset"),
              position: "top",
              fontSize: 10,
              color: "#f59e0b",
            },
          },
          data: data.categories
            .map((category, index) => {
              if (index > 0 && isDifferentDay(data.categories[index - 1], category)) {
                return {
                  coord: [index, cumulativeData[index]],
                  name: t("dashboard.charts.dailyReset", "Daily Reset"),
                };
              }
              return null;
            })
            .filter((item): item is { coord: number[]; name: string } => item !== null),
        },
      },
    ],
  };

  return (
    <div
      className="w-full h-full"
      style={{ minWidth: "100px", height: "100%", minHeight: "300px" }}
    >
      <BaseChart option={option} className={className} />
    </div>
  );
};
