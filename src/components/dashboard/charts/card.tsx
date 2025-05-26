// src/components/dashboard/charts/card.tsx
import React from "react";
import { useTranslation } from "react-i18next";

interface SensorDataCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
  translationKey?: string;
  unit?: string;
  translationParams?: Record<string, any>;
}

export const SensorDataCard: React.FC<SensorDataCardProps> = ({
  title,
  value,
  icon,
  className = "",
  translationKey,
  unit = "",
  translationParams,
}) => {
  const { t } = useTranslation();

  const displayTitle = translationKey
    ? t(translationKey, translationParams)
    : title;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">{displayTitle}</p>
          <p className="text-xl font-semibold mt-1">
            {value} {unit}
          </p>
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
};
