import React from "react";
import { BaseChart } from "./base-chart.tsx";
import type { EChartsOption } from "echarts";
import { useTranslation } from "react-i18next";
import { GroupByTimeAmount } from "../../../types/sensorDataResponse.ts";

interface AffluenceChartProps {
  data: {
    categories: string[];
    values: number[];
  };
  groupBy: GroupByTimeAmount;
  className?: string;
}

export const AffluenceChart: React.FC<AffluenceChartProps> = ({
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
        const percentage = parseFloat(param.value).toFixed(2);
        return `${param.axisValue}<br/>${t("dashboard.affluence.title")}: ${percentage}%`;
      },
    },
    legend: {
      data: [t("dashboard.charts.affluence.title")],
    },
    xAxis: {
      type: "category",
      data: data.categories,
    },
    yAxis: {
      type: "value",
      name: t("dashboard.percentage"),
      nameLocation: "middle",
      nameGap: 40,
      min: 0,
      max: hasData ? undefined : 100, // Only set max if no data to show scale
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
        name: t("dashboard.charts.affluence.title"),
        type: "line",
        data: data.values,
        smooth: true,
        itemStyle: {
          color: hasData ? "#F59E0B" : "#D1D5DB", // Amber for data, gray for no data
        },
        lineStyle: {
          color: hasData ? "#F59E0B" : "#D1D5DB",
          width: 3,
        },
        areaStyle: hasData
          ? {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(245, 158, 11, 0.3)",
                  },
                  {
                    offset: 1,
                    color: "rgba(245, 158, 11, 0.1)",
                  },
                ],
              },
            }
          : undefined,
      },
    ],
    // Show empty data message if no data
    graphic: !hasData
      ? {
          type: "text",
          left: "center",
          top: "middle",
          style: {
            text: `${t("dashboard.noDataAvailable")}\n(${t("dashboard.footfallcamDataRequired")})`,
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
