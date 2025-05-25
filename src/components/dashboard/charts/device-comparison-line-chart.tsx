import React from "react";
import { BaseChart } from "./base-chart";
import type { EChartsOption } from "echarts";

interface DeviceComparisonChartProps {
  data: {
    categories: string[];
    devices: {
      name: string;
      values: number[];
    }[];
  };
  className?: string;
}

export const DeviceComparisonChart: React.FC<DeviceComparisonChartProps> = ({
  data,
  className,
}) => {
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
      data: data.devices.map((device) => device.name),
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
    series: data.devices.map((device) => ({
      name: device.name,
      type: "line",
      data: device.values,
      smooth: true,
    })),
  };

  return <BaseChart option={option} className={className} />;
};
