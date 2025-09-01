import React from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@heroui/react";

interface FootfallCamBadgeProps {
  className?: string;
}

export const FootfallCamBadge: React.FC<FootfallCamBadgeProps> = ({ 
  className = "" 
}) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      content={t("sensors.provider.footfallcam", "Proveedor: FootfallCam")}
      placement="top"
      showArrow
    >
      <div 
        className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200 ${className}`}
        title={t("sensors.provider.footfallcam", "Proveedor: FootfallCam")}
      >
        <span className="font-bold">FFC</span>
      </div>
    </Tooltip>
  );
};
