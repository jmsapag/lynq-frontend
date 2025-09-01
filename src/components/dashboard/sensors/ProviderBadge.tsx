import React from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@heroui/react";

interface ProviderBadgeProps {
  provider: string;
  className?: string;
}

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({ 
  provider, 
  className = "" 
}) => {
  const { t } = useTranslation();

  // Define provider-specific styling and labels
  const getProviderConfig = (providerName: string) => {
    switch (providerName.toLowerCase()) {
      case "footfallcam":
      case "footfallcamv9api":
        return {
          label: "FFC",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          tooltip: t("sensors.provider.footfallcam", "Proveedor: FootfallCam")
        };
      case "xovis":
        return {
          label: "XOV",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
          tooltip: t("sensors.provider.xovis", "Proveedor: Xovis")
        };
      case "hella":
        return {
          label: "HEL",
          bgColor: "bg-purple-100",
          textColor: "text-purple-800",
          borderColor: "border-purple-200",
          tooltip: t("sensors.provider.hella", "Proveedor: Hella")
        };
      default:
        return {
          label: providerName.substring(0, 3).toUpperCase(),
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          tooltip: t("sensors.provider.unknown", "Proveedor: {{provider}}", { provider: providerName })
        };
    }
  };

  const config = getProviderConfig(provider);

  return (
    <Tooltip
      content={config.tooltip}
      placement="top"
      showArrow
    >
      <div 
        className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
        title={config.tooltip}
      >
        <span className="font-bold">{config.label}</span>
      </div>
    </Tooltip>
  );
};
