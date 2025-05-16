import React from "react";
import ReactECharts from "echarts-for-react";

type BarChartDataItem = {
  in: number;
  out: number;
};

type BarChartProps = {
  data: {
    categories: string[];
    values: BarChartDataItem[];
  };
};

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["Entradas", "Salidas"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
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
        name: "Entradas",
        type: "bar",
        data: data.values.map((item) => item.in),
      },
      {
        name: "Salidas",
        type: "bar",
        data: data.values.map((item) => item.out),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: "300px" }} />;
};
