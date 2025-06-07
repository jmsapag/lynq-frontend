import React from "react";
import { BaseChart } from "./base-chart.tsx";
import type { EChartsOption } from "echarts";
import { GroupByTimeAmount } from "../../../types/sensorDataResponse.ts";

type LineChartDataItem = {
  in: number;
  out: number;
};

interface LineChartProps {
  data: {
    categories: string[];
    values: LineChartDataItem[];
  };
  groupBy: GroupByTimeAmount;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  groupBy,
  className,
}) => {
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
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    legend: {
      data: ["Entradas", "Salidas"],
    },
    xAxis: {
      type: "category",
      data: data.categories,
    },
    yAxis: {
      type: "value",
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
        name: "Entradas",
        type: "line",
        data: data.values.map((item) => item.in),
        smooth: true,
      },
      {
        name: "Salidas",
        type: "line",
        data: data.values.map((item) => item.out),
        smooth: true,
      },
    ],
  };

  return (
    <div className="h-[300px]">
      <BaseChart option={option} className={className} />
    </div>
  );
};
