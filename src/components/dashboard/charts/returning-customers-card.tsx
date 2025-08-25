import React, { useMemo } from "react";
import { SensorDataCard } from "../charts/card.tsx";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { TransformedSensorData } from "../../../types/sensorDataResponse.ts";

interface ReturningCustomersCardProps {
  data: TransformedSensorData;
  dateRange?: { start: Date; end: Date };
  className?: string;
}

export const ReturningCustomersCard: React.FC<ReturningCustomersCardProps> = ({
  data,
  dateRange,
  className = "",
}) => {
  // Calculate total returning customers
  const totalReturningCustomers = useMemo(() => {
    return data.returningCustomers.reduce((sum, val) => sum + val, 0);
  }, [data.returningCustomers]);

  return (
    <SensorDataCard
      title="Clientes que Retornan"
      value={totalReturningCustomers}
      icon={<UserGroupIcon className="w-6 h-6 text-green-600" />}
      translationKey="dashboard.metrics.returningCustomers"
      description="Total de clientes que han regresado al establecimiento"
      descriptionTranslationKey="dashboard.metrics.returningCustomers.description"
      dateRange={dateRange}
      data={{ returningCustomers: data.returningCustomers }}
      className={`bg-gradient-to-br from-green-50 to-green-100 border-green-200 ${className}`}
    />
  );
};
