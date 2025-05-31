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
  title?: string; // Make title optional
  className?: string;
}

export const DeviceComparisonChart: React.FC<DeviceComparisonChartProps> = ({
  data,
  title,
  className,
}) => {
  const option: EChartsOption = {
    title: title
      ? {
          text: title,
          left: "center",
        }
      : undefined,
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
      top: title ? 30 : 10, // Add some space if there's a title
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
