import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  translationKey?: string;
  translationParams?: Record<string, any>;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  className = "",
  translationKey,
  translationParams,
}) => {
  const { t } = useTranslation();

  const displayTitle = translationKey
    ? t(translationKey, translationParams)
    : title;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col ${className}`}
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex-shrink-0">
        {displayTitle}
      </h3>
      <div className=" flex-1 min-h-0">{children}</div>
    </div>
  );
};
