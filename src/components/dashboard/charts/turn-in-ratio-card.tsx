import React, { useMemo } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { SensorDataCard } from "../layout-dashboard/layout-dashboard/SensorDataCard";

interface TurnInRatioCardProps {
  data: {
    in?: number[];
    returningCustomers?: number[]; // decimals per timestep, e.g. 0.14
  };
  dateRange?: { start: Date; end: Date };
  className?: string;
}

export const TurnInRatioCard: React.FC<TurnInRatioCardProps> = ({
  data,
  dateRange,
  className = "",
}) => {
  const { t } = useTranslation();

  const { percentage, newCount, returningCount, hasData } = useMemo(() => {
    const entries = data.in || [];
    const returning = data.returningCustomers || [];

    if (!entries.length || !returning.length) {
      return { percentage: 0, newCount: 0, returningCount: 0, hasData: false };
    }

    let weightedSum = 0;
    let totalEntries = 0;

    for (let i = 0; i < Math.min(entries.length, returning.length); i++) {
      const e = entries[i] || 0;
      let r = returning[i] ?? 0; // decimal (0..1) or percent (0..100)
      if (r > 1) r = r / 100; // normalize percent to decimal
      totalEntries += e;
      weightedSum += r * e;
    }

    const returningAbs = Math.round(weightedSum);
    const newAbs = Math.max(0, totalEntries - returningAbs);
    const returningPct = totalEntries > 0 ? Math.round((returningAbs / totalEntries) * 100) : 0;

    return {
      percentage: returningPct,
      newCount: newAbs,
      returningCount: returningAbs,
      hasData: totalEntries > 0,
    };
  }, [data.in, data.returningCustomers]);

  return (
    <SensorDataCard
      title={t("dashboard.metrics.turnInRatio")} 
      value={hasData ? `${percentage}%` : "N/A"}
      unit=""
      icon={<ChartBarIcon className="w-6 h-6 text-amber-600" />}
      translationKey="dashboard.metrics.turnInRatio"
      description={t("dashboard.metrics.turnInRatioDescription")}
      descriptionTranslationKey="dashboard.metrics.turnInRatioDescription"
      dateRange={dateRange}
      data={{
        returning_percentage: percentage,
        returning_count: returningCount,
        new_count: newCount,
      }}
      className={`bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 ${className}`}
    />
  );
};


