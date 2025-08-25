import React, { useMemo } from "react";
import { SensorDataCard } from "../charts/card.tsx";
import { ClockIcon } from "@heroicons/react/24/outline";
import { TransformedSensorData } from "../../../types/sensorDataResponse.ts";

interface AvgVisitDurationCardProps {
  data: TransformedSensorData;
  dateRange?: { start: Date; end: Date };
  className?: string;
}

export const AvgVisitDurationCard: React.FC<AvgVisitDurationCardProps> = ({
  data,
  dateRange,
  className = "",
}) => {
  // Calculate average visit duration
  const avgVisitDuration = useMemo(() => {
    const validDurations = data.avgVisitDuration.filter(val => val > 0);
    return validDurations.length > 0 
      ? validDurations.reduce((sum, val) => sum + val, 0) / validDurations.length 
      : 0;
  }, [data.avgVisitDuration]);

  return (
    <SensorDataCard
      title="Tiempo Promedio en Local"
      value={avgVisitDuration.toFixed(2)}
      unit="min"
      icon={<ClockIcon className="w-6 h-6 text-purple-600" />}
      translationKey="dashboard.metrics.avgVisitDuration"
      description="Tiempo promedio que los clientes permanecen en el establecimiento"
      descriptionTranslationKey="dashboard.metrics.avgVisitDuration.description"
      dateRange={dateRange}
      data={{ avgVisitDuration: data.avgVisitDuration }}
      className={`bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 ${className}`}
    />
  );
};
