import React from "react";
import { ChartCard } from "../charts/chart-card.tsx";
import { ReturningCustomersChart } from "../charts/returning-customers-chart.tsx";
import {
  TransformedSensorData,
  GroupByTimeAmount,
} from "../../../types/sensorDataResponse.ts";

interface ReturningCustomersChartCardProps {
  data: TransformedSensorData;
  groupBy: GroupByTimeAmount;
  dateRange?: { start: Date; end: Date };
  className?: string;
}

export const ReturningCustomersChartCard: React.FC<
  ReturningCustomersChartCardProps
> = ({ data, groupBy, dateRange, className }) => {
  const chartData = {
    categories: data.timestamps,
    values: data.returningCustomers,
  };

  const exportData = {
    timestamps: data.timestamps,
    returningCustomers: data.returningCustomers,
  };

  return (
    <ChartCard
      title="Tasa de Retorno"
      translationKey="dashboard.charts.returningCustomers.title"
      description="El porcentaje de visitantes que habían realizado previamente una visita a la misma tienda dentro de los últimos 60 días"
      descriptionTranslationKey="dashboard.charts.returningCustomers.description"
      className={className}
      data={exportData}
      dateRange={dateRange}
    >
      <ReturningCustomersChart
        data={chartData}
        groupBy={groupBy}
        className="w-full h-full"
      />
    </ChartCard>
  );
};
