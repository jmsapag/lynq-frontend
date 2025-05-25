import React from "react";
import { BaseChart } from "./base-chart.tsx";
import type { EChartsOption } from "echarts";

type LineChartDataItem = {
  in: number;
  out: number;
};

interface LineChartProps {
  data: {
    categories: string[];
    values: LineChartDataItem[];
  };
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, className }) => {
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
        start: 0,
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

  return <BaseChart option={option} className={className} />;
};
