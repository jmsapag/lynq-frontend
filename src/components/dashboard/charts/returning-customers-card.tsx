import React, { useMemo } from "react";
import { SensorDataCard } from "../charts/card.tsx";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { TransformedSensorData } from "../../../types/sensorDataResponse.ts";

// Helper function to validate returning customer values (filter scattered zeros)
function isValidReturningCustomerValue(
  currentValue: number | null | undefined,
  previousValue: number | null | undefined,
  index: number,
): boolean {
  // Handle null/undefined as invalid
  if (currentValue == null) return false;

  // First element: 0 is valid (no previous to compare)
  if (index === 0) return true;

  // If current is 0 and previous was also 0 → valid (consecutive zeros/cluster)
  if (currentValue === 0 && previousValue === 0) return true;

  // If current is 0 and previous was non-zero → invalid (scattered zero/error)
  if (currentValue === 0 && previousValue != null && previousValue !== 0)
    return false;

  // Non-zero values are always valid
  return true;
}

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
  // Calculate weighted average returning customer percentage and data availability
  const returningCustomerResult = useMemo(() => {
    if (
      !data.returningCustomers ||
      !data.in ||
      data.returningCustomers.length === 0
    ) {
      return { percentage: 0, hasData: false };
    }

    let weightedSum = 0;
    let totalWeight = 0;
    let hasValidData = false;

    for (let i = 0; i < data.returningCustomers.length; i++) {
      const decimalValue = data.returningCustomers[i]; // 0.14 means 14%
      const traffic = data.in[i];
      const previousValue = i > 0 ? data.returningCustomers[i - 1] : null;

      // Filter out scattered error zeros using validation logic
      const isValid = isValidReturningCustomerValue(
        decimalValue,
        previousValue,
        i,
      );

      if (
        isValid &&
        decimalValue !== null &&
        decimalValue !== undefined &&
        traffic > 0
      ) {
        hasValidData = true;
        // Use decimal value directly in weighted calculation
        weightedSum += decimalValue * traffic;
        totalWeight += traffic;
      }
    }

    // Convert final result to percentage for display (0.14 -> 14%)
    const calculatedPercentage =
      totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

    return {
      percentage: calculatedPercentage,
      hasData: hasValidData,
    };
  }, [data.returningCustomers, data.in]);

  return (
    <SensorDataCard
      title="Tasa de Retorno"
      value={
        returningCustomerResult.hasData
          ? `${returningCustomerResult.percentage}%`
          : "N/A"
      }
      icon={<UserGroupIcon className="w-6 h-6 text-green-600" />}
      translationKey="dashboard.metrics.returningCustomers"
      description={
        returningCustomerResult.hasData
          ? "El porcentaje de visitantes que habían realizado previamente una visita a la misma tienda dentro de los últimos 60 días"
          : "Datos no disponibles para este período"
      }
      descriptionTranslationKey="dashboard.metrics.returningCustomers.description"
      dateRange={dateRange}
      data={{ returningCustomers: data.returningCustomers }}
      className={`bg-gradient-to-br from-green-50 to-green-100 border-green-200 ${className}`}
    />
  );
};
