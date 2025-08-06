import { useTranslation } from "react-i18next";
import { Tooltip } from "@heroui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface SensorDataCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
  translationKey?: string;
  unit?: string;
  translationParams?: Record<string, any>;
  description?: string;
  descriptionTranslationKey?: string;
}

export const SensorDataCard: React.FC<SensorDataCardProps> = ({
  title,
  value,
  icon,
  className = "",
  translationKey,
  unit = "",
  translationParams,
  description,
  descriptionTranslationKey,
}) => {
  const { t } = useTranslation();

  const displayTitle = translationKey
    ? t(translationKey, translationParams)
    : title;

  const displayDescription = descriptionTranslationKey
    ? t(descriptionTranslationKey, translationParams)
    : description;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500 font-medium">{displayTitle}</p>
            {displayDescription && (
              <Tooltip
                content={
                  <div className="max-w-xs p-1">
                    <p className="text-sm">{displayDescription}</p>
                  </div>
                }
                delay={200}
                placement="top"
                className="bg-gray-800 text-white rounded-lg border border-gray-700"
                motionProps={{
                  variants: {
                    exit: { opacity: 0, scale: 0.95 },
                    enter: { opacity: 1, scale: 1 },
                  },
                  transition: { duration: 0.2 },
                }}
              >
                <InformationCircleIcon className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-help transition-colors" />
              </Tooltip>
            )}
          </div>
          <p className="text-xl font-semibold mt-1">
            {value}{" "}
            {unit && (
              <span className="text-sm font-normal text-gray-500">{unit}</span>
            )}
          </p>
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
};
