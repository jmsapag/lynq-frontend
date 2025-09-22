import React from "react";
import type { EChartsOption } from "echarts";
import { useTranslation } from "react-i18next";
import { BaseChart } from "./base-chart";
import {
  GroupByTimeAmount,
  TransformedSensorData,
} from "../../../types/sensorDataResponse";

type IngressMixedChartProps = {
  data: { categories: string[]; values: Array<{ in: number; out: number }> };
  groupBy: GroupByTimeAmount;
  rawData?: TransformedSensorData; // Needed for Outside Traffic (FootfallCam)
  className?: string;
};

export const IngressMixedChart: React.FC<IngressMixedChartProps> = ({
  data,
  groupBy,
  rawData,
  className,
}) => {
  const { t } = useTranslation();

  const start: number = (() => {
    switch (groupBy) {
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

  const peopleIn = data.values.map((v) => v.in);
  const outsideTraffic = rawData?.outsideTraffic ?? [];

  // Outside Traffic only available hourly and when there is at least one non-zero data point
  const isHourly = groupBy === "hour";
  const hasOutsideTrafficData =
    isHourly && outsideTraffic.some((v) => v && v > 0);

  const showLegendItems = [
    t("dashboard.charts.entries", "Entradas"),
    ...(hasOutsideTrafficData
      ? [t("dashboard.charts.outsideTraffic", "Outside Traffic")]
      : []),
  ];

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: showLegendItems,
    },
    xAxis: {
      type: "category",
      data: data.categories,
      axisLabel: {
        interval: "auto",
        rotate: 40,
        hideOverlap: true,
        formatter: (value: string) => {
          // Split date and time on comma to reduce overlap (e.g., "Sep 18, 00:00")
          const parts = String(value).split(", ");
          return parts.length === 2 ? `${parts[0]}\n${parts[1]}` : value;
        },
      },
    },
    yAxis: {
      type: "value",
    },
    grid: { left: 40, right: 20, top: 30, bottom: 70, containLabel: true },
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
        name: t("dashboard.charts.entries", "Entradas"),
        type: "bar",
        data: peopleIn,
        itemStyle: { color: "#3B82F6" },
        barMaxWidth: 20,
        barCategoryGap: "35%",
        barGap: "5%",
      },
      ...(hasOutsideTrafficData
        ? [
            {
              name: t("dashboard.charts.outsideTraffic", "Outside Traffic"),
              type: "line",
              data: outsideTraffic.slice(0, data.categories.length),
              smooth: true,
              yAxisIndex: 0,
              itemStyle: { color: "#22C55E" },
              lineStyle: { color: "#22C55E", width: 2 },
            } as any,
          ]
        : []),
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

export default IngressMixedChart;
