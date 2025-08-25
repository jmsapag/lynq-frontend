import React from "react";
import { ChartCard } from "../charts/chart-card.tsx";
import { AffluenceChart } from "../charts/affluence-chart.tsx";
import { TransformedSensorData, GroupByTimeAmount } from "../../../types/sensorDataResponse.ts";

interface AffluenceChartCardProps {
  data: TransformedSensorData;
  groupBy: GroupByTimeAmount;
  dateRange?: { start: Date; end: Date };
  className?: string;
}

export const AffluenceChartCard: React.FC<AffluenceChartCardProps> = ({
  data,
  groupBy,
  dateRange,
  className,
}) => {
  const chartData = {
    categories: data.timestamps,
    values: data.affluence,
  };

  const exportData = {
    timestamps: data.timestamps,
    affluence: data.affluence,
  };

  return (
    <ChartCard
      title="Afluencia"
      translationKey="dashboard.charts.affluence.title"
      description="Porcentaje de entradas respecto al tráfico exterior (Entradas/Tráfico exterior)"
      descriptionTranslationKey="dashboard.charts.affluence.description"
      className={className}
      data={exportData}
      dateRange={dateRange}
    >
      <AffluenceChart
        data={chartData}
        groupBy={groupBy}
        className="w-full h-full"
      />
    </ChartCard>
  );
};
