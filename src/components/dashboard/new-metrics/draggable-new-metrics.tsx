import React from "react";
import Draggable from "../drag-drop/draggable/draggable";
import {
  TransformedSensorData,
  GroupByTimeAmount,
} from "../../../types/sensorDataResponse.ts";
import { ReturningCustomersCard } from "../charts/returning-customers-card.tsx";
import { AvgVisitDurationCard } from "../charts/avg-visit-duration-card.tsx";
import { AffluenceCard } from "../charts/affluence-card.tsx";
import { ReturningCustomersChartCard } from "../charts/returning-customers-chart-card.tsx";
import { AvgVisitDurationChartCard } from "../charts/avg-visit-duration-chart-card.tsx";
import { AffluenceChartCard } from "../charts/affluence-chart-card.tsx";

interface DraggableNewMetricsProps {
  data: TransformedSensorData;
  groupBy: GroupByTimeAmount;
  dateRange?: { start: Date; end: Date };
}

// Draggable Metric Cards
export const DraggableReturningCustomersCard: React.FC<
  DraggableNewMetricsProps
> = ({ data, dateRange }) => (
  <Draggable id="returning-customers-card" type="card">
    <ReturningCustomersCard
      data={data}
      dateRange={dateRange}
      className="w-full h-full"
    />
  </Draggable>
);

export const DraggableAvgVisitDurationCard: React.FC<
  DraggableNewMetricsProps
> = ({ data, dateRange }) => (
  <Draggable id="avg-visit-duration-card" type="card">
    <AvgVisitDurationCard
      data={data}
      dateRange={dateRange}
      className="w-full h-full"
    />
  </Draggable>
);

export const DraggableAffluenceCard: React.FC<DraggableNewMetricsProps> = ({
  data,
  dateRange,
}) => (
  <Draggable id="affluence-card" type="card">
    <AffluenceCard
      data={data}
      dateRange={dateRange}
      className="w-full h-full"
    />
  </Draggable>
);

// Draggable Chart Cards
export const DraggableReturningCustomersChartCard: React.FC<
  DraggableNewMetricsProps
> = ({ data, groupBy, dateRange }) => (
  <Draggable id="returning-customers-chart" type="chart-card">
    <ReturningCustomersChartCard
      data={data}
      groupBy={groupBy}
      dateRange={dateRange}
      className="w-full h-full"
    />
  </Draggable>
);

export const DraggableAvgVisitDurationChartCard: React.FC<
  DraggableNewMetricsProps
> = ({ data, groupBy, dateRange }) => (
  <Draggable id="avg-visit-duration-chart" type="chart-card">
    <AvgVisitDurationChartCard
      data={data}
      groupBy={groupBy}
      dateRange={dateRange}
      className="w-full h-full"
    />
  </Draggable>
);

export const DraggableAffluenceChartCard: React.FC<
  DraggableNewMetricsProps
> = ({ data, groupBy, dateRange }) => (
  <Draggable id="affluence-chart" type="chart-card">
    <AffluenceChartCard
      data={data}
      groupBy={groupBy}
      dateRange={dateRange}
      className="w-full h-full"
    />
  </Draggable>
);

// Small cards for the draggable items list
export const DraggableReturningCustomersSmallCard: React.FC = () => (
  <Draggable id="returning-customers" type="small-card">
    <div className="text-center">
      <div className="text-2xl mb-2">👥</div>
      <div className="text-sm font-medium">Clientes que Retornan</div>
    </div>
  </Draggable>
);

export const DraggableAvgVisitDurationSmallCard: React.FC = () => (
  <Draggable id="avg-visit-duration" type="small-card">
    <div className="text-center">
      <div className="text-2xl mb-2">⏱️</div>
      <div className="text-sm font-medium">Tiempo Promedio</div>
    </div>
  </Draggable>
);

export const DraggableAffluenceSmallCard: React.FC = () => (
  <Draggable id="affluence" type="small-card">
    <div className="text-center">
      <div className="text-2xl mb-2">📊</div>
      <div className="text-sm font-medium">Afluencia</div>
    </div>
  </Draggable>
);

export const DraggableReturningCustomersChartSmallCard: React.FC = () => (
  <Draggable id="returning-customers-chart-small" type="small-card">
    <div className="text-center">
      <div className="text-2xl mb-2">📈</div>
      <div className="text-sm font-medium">Gráfico Clientes</div>
    </div>
  </Draggable>
);

export const DraggableAvgVisitDurationChartSmallCard: React.FC = () => (
  <Draggable id="avg-visit-duration-chart-small" type="small-card">
    <div className="text-center">
      <div className="text-2xl mb-2">⏰</div>
      <div className="text-sm font-medium">Gráfico Tiempo</div>
    </div>
  </Draggable>
);

export const DraggableAffluenceChartSmallCard: React.FC = () => (
  <Draggable id="affluence-chart-small" type="small-card">
    <div className="text-center">
      <div className="text-2xl mb-2">📊</div>
      <div className="text-sm font-medium">Gráfico Afluencia</div>
    </div>
  </Draggable>
);
