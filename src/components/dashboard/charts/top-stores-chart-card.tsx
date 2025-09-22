import React, { useState, useMemo } from "react";
import { ChartCard } from "./chart-card";
import { TopStoresData, MetricType } from "./top-stores-chart";
import { useTranslation } from "react-i18next";

interface TopStoresChartCardProps {
  data: TopStoresData[];
  dateRange?: { start: Date; end: Date };
  className?: string;
}

export const TopStoresChartCard: React.FC<TopStoresChartCardProps> = ({
  data,
  dateRange,
  className = "",
}) => {
  const { t } = useTranslation();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("footfall");
  const [topCount, setTopCount] = useState(5);

  // Transform data for export
  const exportData = useMemo(() => {
    if (!data || data.length === 0) return {};

    // Sort data by selected metric
    const sortedData = [...data].sort((a, b) => {
      const aValue = getMetricValue(a, selectedMetric);
      const bValue = getMetricValue(b, selectedMetric);
      return bValue - aValue;
    });

    // Take top N stores
    const topStores = sortedData.slice(0, topCount);

    return {
      metric: selectedMetric,
      topCount,
      stores: topStores.map((store, index) => ({
        rank: index + 1,
        locationName: store.locationName,
        locationId: store.locationId,
        footfall: store.footfall,
        salesRevenue: store.salesRevenue || 0,
        returningCustomers: store.returningCustomers,
        avgVisitDuration: store.avgVisitDuration,
        affluence: store.affluence,
        selectedMetricValue: getMetricValue(store, selectedMetric),
      })),
    };
  }, [data, selectedMetric, topCount]);

  // Build table model matching the provided screenshot
  const sorted = useMemo(() => {
    const s = [...data].sort(
      (a, b) =>
        getMetricValue(b, selectedMetric) - getMetricValue(a, selectedMetric),
    );
    return s.slice(0, topCount);
  }, [data, selectedMetric, topCount]);

  const total = useMemo(
    () => data.reduce((sum, d) => sum + getMetricValue(d, selectedMetric), 0),
    [data, selectedMetric],
  );

  return (
    <ChartCard
      title={t("dashboard.charts.topStores")}
      translationKey="dashboard.charts.topStores"
      description={t("dashboard.charts.topStoresDescription")}
      descriptionTranslationKey="dashboard.charts.topStoresDescription"
      dateRange={dateRange}
      data={exportData}
      className={className}
    >
      <div className="w-full">
        <div className="grid grid-cols-[1fr_200px_120px] px-4 py-2 text-sm text-gray-600">
          <div>Store</div>
          <div className="text-center">Distribution</div>
          <div className="text-right">
            {selectedMetric === "footfall" ? "Footfall" : "Value"}
          </div>
        </div>
        <div className="divide-y">
          {sorted.map((row) => {
            const value = getMetricValue(row, selectedMetric);
            const pct = total > 0 ? (value / total) * 100 : 0;
            return (
              <div
                key={row.locationId}
                className="grid grid-cols-[1fr_200px_120px] items-center px-4 py-3"
              >
                <div className="text-primary-600 hover:underline cursor-pointer">
                  {row.locationName}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-full bg-gray-200 rounded">
                    <div
                      className="h-2 bg-blue-500 rounded"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-gray-700 text-sm">
                    {pct.toFixed(0)}%
                  </div>
                </div>
                <div className="text-right font-medium">
                  {selectedMetric === "footfall"
                    ? value.toLocaleString()
                    : value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ChartCard>
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
