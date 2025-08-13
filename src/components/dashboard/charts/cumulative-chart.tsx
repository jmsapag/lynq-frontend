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

  // Calculate cumulative data (running total of in - out)
  const cumulativeData = data.values.reduce((acc, current, index) => {
    const netFlow = current.in - current.out;
    const previousTotal = index > 0 ? acc[index - 1] : 0;
    const currentTotal = Math.max(0, previousTotal + netFlow); // Ensure non-negative
    acc.push(currentTotal);
    return acc;
  }, [] as number[]);

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
        const netFlow = currentIn - currentOut;
        const totalPeople = cumulativeData[dataIndex];

        return `
          <div class="text-sm">
            <div class="font-semibold">${category}</div>
            <div class="mt-1">
              <div>${t("dashboard.charts.entries")}: <span class="text-green-500">${currentIn}</span></div>
              <div>${t("dashboard.charts.exits")}: <span class="text-red-500">${currentOut}</span></div>
              <div>${t("dashboard.charts.netFlow")}: <span class="${netFlow >= 0 ? "text-green-500" : "text-red-500"}">${netFlow > 0 ? "+" : ""}${netFlow}</span></div>
              <div class="font-semibold border-t pt-1 mt-1">${t("dashboard.charts.peopleInStoreTitle")}: <span class="text-blue-500">${totalPeople}</span></div>
            </div>
          </div>
        `;
      },
    },
    legend: {
      data: [t("dashboard.charts.peopleInStoreTitle")],
    },
    xAxis: {
      type: "category",
      data: data.categories,
    },
    yAxis: {
      type: "value",
      name: t("dashboard.charts.numberOfPeople"),
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
        name: t("dashboard.charts.peopleInStoreTitle"),
        type: "line",
        data: cumulativeData,
        smooth: true,
        areaStyle: {
          opacity: 0.3,
        },
        lineStyle: {
          color: "#3b82f6",
          width: 2,
        },
        itemStyle: {
          color: "#3b82f6",
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
