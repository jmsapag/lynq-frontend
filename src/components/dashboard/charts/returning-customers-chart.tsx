import React, { useMemo } from "react";
import { BaseChart } from "./base-chart.tsx";
import type { EChartsOption } from "echarts";
import { useTranslation } from "react-i18next";
import { GroupByTimeAmount } from "../../../types/sensorDataResponse.ts";

// Helper function to validate returning customer values (filter scattered zeros)
function isValidReturningCustomerValue(
  currentValue: number | null | undefined,
  previousValue: number | null | undefined,
  index: number,
): boolean {
  // Handle null/undefined as invalid
  if (currentValue == null) return false;

  // First element: 0 is valid (no previous to compare)
  if (index === 0) return true;

  // If current is 0 and previous was also 0 → valid (consecutive zeros/cluster)
  if (currentValue === 0 && previousValue === 0) return true;

  // If current is 0 and previous was non-zero → invalid (scattered zero/error)
  if (currentValue === 0 && previousValue != null && previousValue !== 0)
    return false;

  // Non-zero values are always valid
  return true;
}

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

  // Process data to filter scattered zeros and convert to percentages
  const processedData = useMemo(() => {
    const filteredData: number[] = [];
    const validCategories: string[] = [];

    for (let i = 0; i < data.values.length; i++) {
      const currentValue = data.values[i];
      const previousValue = i > 0 ? data.values[i - 1] : null;

      const isValid = isValidReturningCustomerValue(
        currentValue,
        previousValue,
        i,
      );

      if (isValid) {
        // Convert decimal to percentage (0.14 -> 14%)
        const percentageValue = currentValue * 100;
        filteredData.push(Math.round(percentageValue * 10) / 10); // Round to 1 decimal
        validCategories.push(data.categories[i]);
      }
      // Skip invalid scattered zeros entirely - don't add to arrays
    }

    return {
      values: filteredData,
      categories: validCategories,
      hasValidData: filteredData.some((val) => val > 0),
    };
  }, [data.values, data.categories]);

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
        return `${param.axisValue}<br/>${t("dashboard.returningCustomers.title")}: ${param.value}%`;
      },
    },
    legend: {
      data: [t("dashboard.charts.returningCustomers.title")],
    },
    xAxis: {
      type: "category",
      data: processedData.categories,
    },
    yAxis: {
      type: "value",
      name: "Percentage (%)",
      nameLocation: "middle",
      nameGap: 40,
      axisLabel: {
        formatter: "{value}%",
      },
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
        name: t("dashboard.charts.returningCustomers.title"),
        type: "line",
        data: processedData.values,
        smooth: true,
        lineStyle: {
          color: processedData.hasValidData ? "#10B981" : "#D1D5DB",
          width: 2,
        },
        itemStyle: {
          color: processedData.hasValidData ? "#10B981" : "#D1D5DB",
        },
        symbol: "circle",
        symbolSize: 4,
        emphasis: {
          itemStyle: {
            color: processedData.hasValidData ? "#059669" : "#9CA3AF",
          },
          lineStyle: {
            color: processedData.hasValidData ? "#059669" : "#9CA3AF",
          },
        },
      },
    ],
    // Show empty data message if no data
    graphic: !processedData.hasValidData
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
