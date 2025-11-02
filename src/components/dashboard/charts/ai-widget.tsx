import React from "react";
import { Card, CardBody } from "@heroui/react";
import { AIAnalysisResult } from "../../../types/ai.ts";

interface AIAnalysisWidgetProps {
  data: AIAnalysisResult | null;
  loading: boolean;
}

export const AIAnalysisWidget: React.FC<AIAnalysisWidgetProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardBody>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardBody>
          <p className="text-gray-500">
            No hay análisis disponibles para este rango de fechas.
          </p>
        </CardBody>
      </Card>
    );
  }

  const title =
    data.analysisType === "FORECAST" ? "Pronóstico" : "Análisis Retrospectivo";

  return (
    <Card className="w-full shadow-none border-1">
      <CardBody>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">
          {new Date(data.timestamp).toLocaleDateString()}
        </p>
        <p className="mt-3">{data.message}</p>
      </CardBody>
    </Card>
  );
};
