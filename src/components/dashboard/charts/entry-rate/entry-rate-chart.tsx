import React, { useMemo } from "react";
import { BaseChart } from "../base-chart.tsx";
import type { EChartsOption } from "echarts";
import { useTranslation } from "react-i18next";
import { TransformedSensorData } from "../../../../types/sensorDataResponse.ts";
import { GroupByTimeAmount } from "../../../../types/sensorDataResponse.ts";
import { calculateEntryRates } from "./utils.ts";

interface EntryRateChartProps {
  data: {
    categories: string[];
    values: Array<{ in: number; out: number }>;
  };
  groupBy: GroupByTimeAmount;
  className?: string;
  rawData?: TransformedSensorData;
}

export const EntryRateChart: React.FC<EntryRateChartProps> = ({
  data,
  groupBy,
  className,
  rawData,
}) => {
  const { t } = useTranslation();

  // Set dataZoom start position based on groupBy
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

  // Calculate entry rates from raw data or from the values
  const entryRates = useMemo(() => {
    if (rawData && rawData.in && rawData.out) {
      return calculateEntryRates(rawData);
    }

    // If no raw data provided, calculate from the values
    return data.values.map((item) => {
      const total = item.in + item.out;
      return total > 0 ? Math.round((item.in / total) * 100) : 0;
    });
  }, [data.values, rawData]);

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex;
        const timestamp = data.categories[dataIndex];
        const rate = params[0].value;
        return `${timestamp}<br/>${t("dashboard.charts.entryRate")}: ${rate}%`;
      },
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.categories,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: {
        formatter: "{value}%",
      },
    },
    dataZoom: [
      {
        type: "inside",
        start,
        end: 100,
      },
    ],
    series: [
      {
        name: t("dashboard.charts.entryRate"),
        type: "line",
        data: entryRates,
        areaStyle: {
          opacity: 0.2,
        },
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          color: "#1E40AF", // Blue color for entry rate
        },
        smooth: true,
        markLine: {
          silent: true,
          lineStyle: {
            color: "#888",
          },
          data: [
            {
              yAxis: 50,
              label: {
                formatter: "50%",
                position: "start",
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <div className="w-full h-full" style={{ minHeight: '300px', height: '100%' }}>
      <BaseChart option={option} className={className} />
    </div>
  );
};
