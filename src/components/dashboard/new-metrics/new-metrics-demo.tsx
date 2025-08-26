import React from "react";
import { NewMetricsCards } from "../charts/new-metrics-cards";
import { ReturningCustomersChartCard } from "../charts/returning-customers-chart-card";
import { AvgVisitDurationChartCard } from "../charts/avg-visit-duration-chart-card";
import { AffluenceChartCard } from "../charts/affluence-chart-card";
import { FootfallCamDataStatus } from "../charts/footfall-cam-data-status";
import {
  TransformedSensorData,
  GroupByTimeAmount,
} from "../../../types/sensorDataResponse";

interface NewMetricsDemoProps {
  data: TransformedSensorData;
  groupBy: GroupByTimeAmount;
  dateRange?: { start: Date; end: Date };
}

export const NewMetricsDemo: React.FC<NewMetricsDemoProps> = ({
  data,
  groupBy,
  dateRange,
}) => {
  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Nuevas Métricas del Dashboard
        </h2>

        {/* FootfallCam Data Status */}
        <FootfallCamDataStatus data={data} className="mb-6" />

        {/* Metric Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Tarjetas de Métricas
          </h3>
          <NewMetricsCards data={data} dateRange={dateRange} className="mb-6" />
        </div>

        {/* Chart Cards */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Gráficos de Métricas
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="h-96">
              <ReturningCustomersChartCard
                data={data}
                groupBy={groupBy}
                dateRange={dateRange}
              />
            </div>
            <div className="h-96">
              <AvgVisitDurationChartCard
                data={data}
                groupBy={groupBy}
                dateRange={dateRange}
              />
            </div>
            <div className="h-96">
              <AffluenceChartCard
                data={data}
                groupBy={groupBy}
                dateRange={dateRange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Cómo usar las nuevas métricas
        </h3>
        <div className="space-y-3 text-blue-800">
          <p>
            <strong>1. Clientes que Retornan:</strong> Muestra el total de
            clientes que han regresado al establecimiento.
          </p>
          <p>
            <strong>2. Tiempo Promedio en Local:</strong> Calcula el tiempo
            promedio que los clientes permanecen en el establecimiento (en
            minutos).
          </p>
          <p>
            <strong>3. Afluencia:</strong> Muestra el porcentaje de entradas
            respecto al tráfico exterior (Entradas/Tráfico exterior × 100).
          </p>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              <strong>⚠️ Métricas Opcionales:</strong> Estas métricas dependen
              de datos avanzados de FootfallCam. Si no están disponibles, los
              componentes mostrarán "N/A" o "Datos no disponibles"
              automáticamente.
            </p>
          </div>
          <p className="mt-4">
            <strong>Integración con Drag & Drop:</strong> Todos estos
            componentes pueden ser utilizados con el sistema de drag & drop
            existente. Importa los componentes draggables desde{" "}
            <code>/new-metrics/draggable-new-metrics</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
