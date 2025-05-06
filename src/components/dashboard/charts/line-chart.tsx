import React from "react";
import { BaseChart } from "./base-chart.tsx";
import type { EChartsOption } from "echarts";

interface LineChartProps {
  data: {
    categories: string[];
    values: number[];
  };
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, className }) => {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: data.categories,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: data.values,
        type: "line",
        smooth: true,
        itemStyle: {
          color: "#00A5B1",
        },
      },
    ],
  };

  return <BaseChart option={option} className={className} />;
};
