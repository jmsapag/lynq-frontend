import React, { useState, useEffect, useMemo } from "react";
import { BaseChart } from "../base-chart.tsx";
import { useTranslation } from "react-i18next";
import type { EChartsOption } from "echarts";
import { Button } from "@heroui/react";
import { TransformedSensorData } from "../../../../types/sensorDataResponse.ts";
import { DAYS, HOURS, processDataForHeatMap } from "./utils.ts";

interface HeatMapChartProps {
  data: TransformedSensorData;
  className?: string;
  selectedMetric?: "in" | "out";
  sensorIds?: number[];
  dateRange?: { start: Date; end: Date };
}

export const ChartHeatMap: React.FC<HeatMapChartProps> = ({
  data,
  className = "",
  selectedMetric = "in",
  sensorIds,
  dateRange,
}) => {
  const { t } = useTranslation();
  const [displayMetric, setDisplayMetric] = useState<"in" | "out">(
    selectedMetric,
  );
  const [previousData, setPreviousData] = useState<{
    heatmapData: [number, number, number][];
    maxValue: number;
  }>({
    heatmapData: [],
    maxValue: 10,
  });

  // Cache the processed data so it doesn't recompute on every render
  // Only update when data, dateRange or sensorIds change
  const processDataMemo = useMemo(() => {
    // Skip processing if we don't have data
    if (!data || !data.timestamps || data.timestamps.length === 0) {
      return previousData;
    }

    return processDataForHeatMap(data, displayMetric);
  }, [data, displayMetric, dateRange, sensorIds]);

  // Update cached data when the processed data changes
  useEffect(() => {
    if (processDataMemo.heatmapData.length > 0) {
      setPreviousData(processDataMemo);
    }
  }, [processDataMemo]);

  const toggleMetric = () => {
    setDisplayMetric((prev) => (prev === "in" ? "out" : "in"));
  };

  // Translate days of week
  const translatedDays = DAYS.map((day) => t(`days.${day.toLowerCase()}`));

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: any) => {
        const day = translatedDays[params.value[1]];
        const hour = params.value[0];
        const value = params.value[2];
        return `${day}, ${hour}:00 - ${hour + 1}:00<br/>${
          displayMetric === "in"
            ? t("dashboard.charts.entries")
            : t("dashboard.charts.exits")
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
      name: t("dashboard.charts.hourOfDay"),
      nameLocation: "middle",
      nameGap: 35,
    },
    yAxis: {
      type: "category",
      data: translatedDays,
      splitArea: {
        show: true,
      },
      name: t("dashboard.charts.dayOfWeek"),
      nameLocation: "middle",
      nameGap: 85,
    },
    visualMap: {
      min: 0,
      max: previousData.maxValue,
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
        name:
          displayMetric === "in"
            ? t("dashboard.charts.entries")
            : t("dashboard.charts.exits"),
        type: "heatmap",
        data: previousData.heatmapData,
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
      text:
        displayMetric === "in"
          ? t("dashboard.charts.entriesByDayAndHour")
          : t("dashboard.charts.exitsByDayAndHour"),
      left: "center",
      top: 0,
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button onPress={toggleMetric} variant="solid" className="w-24">
          {displayMetric === "in"
            ? t("dashboard.charts.showExits")
            : t("dashboard.charts.showEntries")}
        </Button>
      </div>
      <div className="h-[400px]">
        <BaseChart option={option} className={className} />
      </div>
    </div>
  );
};
