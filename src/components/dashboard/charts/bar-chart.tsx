import React from "react";
import { BaseChart } from "./base-chart.tsx";
import type { EChartsOption } from "echarts";

interface BarChartProps {
  data: {
    categories: string[];
    values: number[];
  };
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, className }) => {
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
        type: "bar",
        itemStyle: {
          color: "#00A5B1",
        },
      },
    ],
  };

  return <BaseChart option={option} className={className} />;
};
