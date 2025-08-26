import React from "react";
import { ChartCard } from "../charts/chart-card.tsx";
import { AvgVisitDurationChart } from "../charts/avg-visit-duration-chart.tsx";
import {
  TransformedSensorData,
  GroupByTimeAmount,
} from "../../../types/sensorDataResponse.ts";

interface AvgVisitDurationChartCardProps {
  data: TransformedSensorData;
  groupBy: GroupByTimeAmount;
  dateRange?: { start: Date; end: Date };
  className?: string;
}

export const AvgVisitDurationChartCard: React.FC<
  AvgVisitDurationChartCardProps
> = ({ data, groupBy, dateRange, className }) => {
  const chartData = {
    categories: data.timestamps,
    values: data.avgVisitDuration,
  };

  const exportData = {
    timestamps: data.timestamps,
    avgVisitDuration: data.avgVisitDuration,
  };

  return (
    <ChartCard
      title="Tiempo Promedio en Local"
      translationKey="dashboard.charts.avgVisitDuration.title"
      description="Tiempo promedio que los clientes permanecen en el establecimiento"
      descriptionTranslationKey="dashboard.charts.avgVisitDuration.description"
      className={className}
      data={exportData}
      dateRange={dateRange}
    >
      <AvgVisitDurationChart
        data={chartData}
        groupBy={groupBy}
        className="w-full h-full"
      />
    </ChartCard>
  );
};
