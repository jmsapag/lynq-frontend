import React, { useMemo } from "react";
import { BaseChart } from "./base-chart";
import type { EChartsOption } from "echarts";
import { useTranslation } from "react-i18next";
import { Select, SelectItem } from "@heroui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export type MetricType =
  | "footfall"
  | "sales-revenue"
  | "returning-customers"
  | "avg-visit-duration"
  | "affluence";

export interface TopStoresData {
  locationId: number;
  locationName: string;
  footfall: number;
  salesRevenue?: number;
  returningCustomers: number;
  avgVisitDuration: number;
  affluence: number;
}

interface TopStoresChartProps {
  data: TopStoresData[];
  selectedMetric: MetricType;
  onMetricChange: (metric: MetricType) => void;
  topCount: number;
  onTopCountChange: (count: number) => void;
  className?: string;
  showControls?: boolean; // when false, hides metric/top selectors
}

const metricOptions = [
  { key: "footfall" as MetricType, label: "Footfall", unit: "people" },
  { key: "sales-revenue" as MetricType, label: "Sales Revenue", unit: "$" },
  {
    key: "returning-customers" as MetricType,
    label: "Returning Customers",
    unit: "people",
  },
  {
    key: "avg-visit-duration" as MetricType,
    label: "Avg Visit Duration",
    unit: "min",
  },
  { key: "affluence" as MetricType, label: "Affluence", unit: "%" },
];

const topCountOptions = [3, 5, 10, 15, 20];

export const TopStoresChart: React.FC<TopStoresChartProps> = ({
  data,
  selectedMetric,
  onMetricChange,
  topCount,
  onTopCountChange,
  className,
  showControls = true,
}) => {
  const { t } = useTranslation();

  // Process and sort data based on selected metric
  const processedData = useMemo(() => {
    if (!data || data.length === 0)
      return { categories: [], values: [], percentages: [] };

    // Sort data by selected metric (descending)
    const sortedData = [...data].sort((a, b) => {
      const aValue = getMetricValue(a, selectedMetric);
      const bValue = getMetricValue(b, selectedMetric);
      return bValue - aValue;
    });

    // Take top N stores
    const topStores = sortedData.slice(0, topCount);

    // Calculate total for percentage calculation
    const total = data.reduce(
      (sum, store) => sum + getMetricValue(store, selectedMetric),
      0,
    );

    return {
      categories: topStores.map((store) => store.locationName),
      values: topStores.map((store) => getMetricValue(store, selectedMetric)),
      percentages: topStores.map((store) => {
        const value = getMetricValue(store, selectedMetric);
        return total > 0 ? (value / total) * 100 : 0;
      }),
      rawData: topStores,
    };
  }, [data, selectedMetric, topCount]);

  const selectedMetricInfo = metricOptions.find(
    (opt) => opt.key === selectedMetric,
  );

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: any) => {
        const param = Array.isArray(params) ? params[0] : params;
        const dataIndex = param.dataIndex;
        const store = processedData.rawData[dataIndex];
        const value = param.value;
        const percentage = processedData.percentages[dataIndex];

        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${param.axisValue}</div>
            <div style="margin-bottom: 2px;">
              <span style="color: #3B82F6;">${selectedMetricInfo?.label}:</span> 
              <span style="font-weight: bold;">${formatValue(value, selectedMetricInfo?.unit || "")}</span>
            </div>
            <div style="color: #6B7280; font-size: 12px;">
              ${percentage.toFixed(1)}% of total
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: processedData.categories,
      axisLabel: {
        rotate: 45,
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      name: selectedMetricInfo?.unit || "",
      nameLocation: "middle",
      nameGap: 50,
    },
    series: [
      {
        name: selectedMetricInfo?.label || "Metric",
        type: "bar",
        data: processedData.values,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "#3B82F6",
              },
              {
                offset: 1,
                color: "#1D4ED8",
              },
            ],
          },
        },
        label: {
          show: true,
          position: "top",
          formatter: (params: any) => {
            const value = params.value;
            const percentage = processedData.percentages[params.dataIndex];
            return `${formatValue(value, selectedMetricInfo?.unit || "")}\n(${percentage.toFixed(1)}%)`;
          },
          fontSize: 10,
        },
      },
    ],
  };

  // Show no data message if no data available
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-sm font-medium mb-2">
            {t("dashboard.noData.topStores")}
          </div>
          <div className="text-xs text-gray-600">
            {t("dashboard.noData.topStoresDescription")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {showControls && (
        <div className="flex gap-4 mb-4 flex-shrink-0">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("dashboard.topStores.metric")}
            </label>
            <Select
              selectedKeys={[selectedMetric]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as MetricType;
                onMetricChange(selected);
              }}
              placeholder={t("dashboard.topStores.selectMetric")}
              classNames={{
                trigger: "bg-white border border-gray-300 rounded-md",
              }}
              startContent={<ChevronDownIcon className="w-4 h-4" />}
            >
              {metricOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("dashboard.topStores.topCount")}
            </label>
            <Select
              selectedKeys={[topCount.toString()]}
              onSelectionChange={(keys) => {
                const selected = parseInt(Array.from(keys)[0] as string);
                onTopCountChange(selected);
              }}
              classNames={{
                trigger: "bg-white border border-gray-300 rounded-md",
              }}
              startContent={<ChevronDownIcon className="w-4 h-4" />}
            >
              {topCountOptions.map((count) => (
                <SelectItem key={count.toString()} value={count.toString()}>
                  Top {count}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <div
          className="w-full h-full"
          style={{ minWidth: "100px", height: "100%", minHeight: "300px" }}
        >
          <BaseChart option={option} className={className} />
        </div>
      </div>
    </div>
  );
};

// Helper function to get metric value from store data
function getMetricValue(store: TopStoresData, metric: MetricType): number {
  switch (metric) {
    case "footfall":
      return store.footfall;
    case "sales-revenue":
      return store.salesRevenue || 0;
    case "returning-customers":
      return store.returningCustomers;
    case "avg-visit-duration":
      return store.avgVisitDuration;
    case "affluence":
      return store.affluence;
    default:
      return 0;
  }
}

// Helper function to format values with units
function formatValue(value: number, unit: string): string {
  if (unit === "$") {
    return `$${value.toLocaleString()}`;
  } else if (unit === "%") {
    return `${value.toFixed(1)}%`;
  } else if (unit === "min") {
    return `${value.toFixed(1)} min`;
  } else {
    return value.toLocaleString();
  }
}
