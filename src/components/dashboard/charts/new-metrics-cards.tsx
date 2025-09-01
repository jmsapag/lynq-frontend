import React, { useMemo } from "react";
import { SensorDataCard } from "./card.tsx";
import {
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { TransformedSensorData } from "../../../types/sensorDataResponse.ts";

interface NewMetricsCardsProps {
  data: TransformedSensorData;
  dateRange?: { start: Date; end: Date };
  className?: string;
}

export const NewMetricsCards: React.FC<NewMetricsCardsProps> = ({
  data,
  dateRange,
  className = "",
}) => {
  // Calculate aggregate values
  const aggregatedMetrics = useMemo(() => {
    const totalReturningCustomers = data.returningCustomers.reduce(
      (sum, val) => sum + val,
      0,
    );

    // Only calculate average if we have valid data points
    const validAvgDurations = data.avgVisitDuration.filter((val) => val > 0);
    const avgVisitDuration =
      validAvgDurations.length > 0
        ? validAvgDurations.reduce((sum, val) => sum + val, 0) /
          validAvgDurations.length
        : 0;

    // Only calculate average affluence if we have valid data points
    const validAffluence = data.affluence.filter((val) => val > 0);
    const avgAffluence =
      validAffluence.length > 0
        ? validAffluence.reduce((sum, val) => sum + val, 0) /
          validAffluence.length
        : 0;

    return {
      totalReturningCustomers,
      avgVisitDuration,
      avgAffluence,
      hasReturningCustomersData: data.returningCustomers.some((val) => val > 0),
      hasAvgVisitDurationData: validAvgDurations.length > 0,
      hasAffluenceData: validAffluence.length > 0,
    };
  }, [data]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {/* Returning Customers Card */}
      <SensorDataCard
        title="Tasa de Retorno"
        value={
          aggregatedMetrics.hasReturningCustomersData
            ? aggregatedMetrics.totalReturningCustomers
            : "N/A"
        }
        icon={<UserGroupIcon className="w-6 h-6 text-green-600" />}
        translationKey="dashboard.metrics.returningCustomers"
        description={
          aggregatedMetrics.hasReturningCustomersData
            ? "El porcentaje de visitantes que habían realizado previamente una visita a la misma tienda dentro de los últimos 60 días"
            : "Datos no disponibles para este período"
        }
        descriptionTranslationKey="dashboard.metrics.returningCustomers.description"
        dateRange={dateRange}
        data={{ returningCustomers: data.returningCustomers }}
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
      />

      {/* Average Visit Duration Card */}
      <SensorDataCard
        title="Tiempo Promedio en Local"
        value={
          aggregatedMetrics.hasAvgVisitDurationData
            ? aggregatedMetrics.avgVisitDuration.toFixed(2)
            : "N/A"
        }
        unit={aggregatedMetrics.hasAvgVisitDurationData ? "min" : ""}
        icon={<ClockIcon className="w-6 h-6 text-purple-600" />}
        translationKey="dashboard.metrics.avgVisitDuration"
        description={
          aggregatedMetrics.hasAvgVisitDurationData
            ? "Tiempo promedio que los clientes permanecen en el establecimiento"
            : "Datos no disponibles para este período"
        }
        descriptionTranslationKey="dashboard.metrics.avgVisitDuration.description"
        dateRange={dateRange}
        data={{ avgVisitDuration: data.avgVisitDuration }}
        className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
      />

      {/* Affluence Card */}
      <SensorDataCard
        title="Afluencia"
        value={
          aggregatedMetrics.hasAffluenceData
            ? aggregatedMetrics.avgAffluence.toFixed(2)
            : "N/A"
        }
        unit={aggregatedMetrics.hasAffluenceData ? "%" : ""}
        icon={<ChartBarIcon className="w-6 h-6 text-amber-600" />}
        translationKey="dashboard.metrics.affluence"
        description={
          aggregatedMetrics.hasAffluenceData
            ? "Porcentaje de entradas respecto al tráfico exterior (Entradas/Tráfico exterior)"
            : "Datos no disponibles para este período"
        }
        descriptionTranslationKey="dashboard.metrics.affluence.description"
        dateRange={dateRange}
        data={{ affluence: data.affluence }}
        className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
      />
    </div>
  );
};
