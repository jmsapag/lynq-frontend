import React, { useMemo } from "react";
import { SensorDataCard } from "../charts/card.tsx";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { TransformedSensorData } from "../../../types/sensorDataResponse.ts";

interface AffluenceCardProps {
  data: TransformedSensorData;
  dateRange?: { start: Date; end: Date };
  className?: string;
}

export const AffluenceCard: React.FC<AffluenceCardProps> = ({
  data,
  dateRange,
  className = "",
}) => {
  // Calculate average affluence
  const avgAffluence = useMemo(() => {
    const validAffluence = data.affluence.filter(val => val > 0);
    return validAffluence.length > 0 
      ? validAffluence.reduce((sum, val) => sum + val, 0) / validAffluence.length 
      : 0;
  }, [data.affluence]);

  return (
    <SensorDataCard
      title="Afluencia"
      value={avgAffluence.toFixed(2)}
      unit="%"
      icon={<ChartBarIcon className="w-6 h-6 text-amber-600" />}
      translationKey="dashboard.metrics.affluence"
      description="Porcentaje de entradas respecto al tráfico exterior (Entradas/Tráfico exterior)"
      descriptionTranslationKey="dashboard.metrics.affluence.description"
      dateRange={dateRange}
      data={{ affluence: data.affluence }}
      className={`bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 ${className}`}
    />
  );
};
