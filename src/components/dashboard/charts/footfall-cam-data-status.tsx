import React from "react";
import { useTranslation } from "react-i18next";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { TransformedSensorData } from "../../../types/sensorDataResponse";

interface FootfallCamDataStatusProps {
  data: TransformedSensorData;
  className?: string;
}

export const FootfallCamDataStatus: React.FC<FootfallCamDataStatusProps> = ({
  data,
  className = "",
}) => {
  const { t } = useTranslation();

  // Check if we have any FootfallCam data
  const hasReturningCustomersData = data.returningCustomers.some(val => val > 0);
  const hasAvgVisitDurationData = data.avgVisitDuration.some(val => val > 0);
  const hasOutsideTrafficData = data.outsideTraffic.some(val => val > 0);
  
  const hasAnyFootfallCamData = hasReturningCustomersData || hasAvgVisitDurationData || hasOutsideTrafficData;

  // If we have data, don't show the status component
  if (hasAnyFootfallCamData) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            {t("dashboard.metrics.footfallcamDataRequired")}
          </h4>
          <p className="text-sm text-blue-700">
            Las métricas avanzadas (Clientes que Retornan, Tiempo Promedio en Local, y Afluencia) 
            requieren datos de analíticas FootfallCam que no están disponibles para este período.
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Estas métricas se mostrarán automáticamente cuando los datos estén disponibles desde el sensor.
          </p>
        </div>
      </div>
    </div>
  );
};
