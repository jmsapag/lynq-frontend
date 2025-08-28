import React from "react";
import { BaseChart } from "./base-chart.tsx";
import type { EChartsOption } from "echarts";
import { useTranslation } from "react-i18next";
import { GroupByTimeAmount } from "../../../types/sensorDataResponse.ts";

interface ReturningCustomersChartProps {
  data: {
    categories: string[];
    values: number[];
  };
  groupBy: GroupByTimeAmount;
  className?: string;
}

export const ReturningCustomersChart: React.FC<
  ReturningCustomersChartProps
> = ({ data, groupBy, className }) => {
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

  // Check if we have any meaningful data
  const hasData = data.values.some((val) => val > 0);

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
        const param = Array.isArray(params) ? params[0] : params;
        return `${param.axisValue}<br/>${t("dashboard.returningCustomers.title")}: ${param.value}`;
      },
    },
    legend: {
      data: [t("dashboard.charts.returningCustomers.title")],
    },
    xAxis: {
      type: "category",
      data: data.categories,
    },
    yAxis: {
      type: "value",
      name: t("dashboard.quantity"),
      nameLocation: "middle",
      nameGap: 40,
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
        name: t("dashboard.charts.returningCustomers.title"),
        type: "bar",
        data: data.values,
        itemStyle: {
          color: hasData ? "#10B981" : "#D1D5DB", // Green for data, gray for no data
        },
        emphasis: {
          itemStyle: {
            color: hasData ? "#059669" : "#9CA3AF",
          },
        },
      },
    ],
    // Show empty data message if no data
    graphic: !hasData
      ? {
          type: "text",
          left: "center",
          top: "middle",
          style: {
            text: "Datos no disponibles",
            fontSize: 16,
            fill: "#6B7280",
          },
        }
      : undefined,
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
