import React from "react";
import { Card, CardBody } from "@heroui/react";
import { AIAnalysisResult } from "../../../types/ai.ts";
import { AgentSummaryResponse } from "../../../pages/agents.ts";
import { useTranslation } from "react-i18next";

interface AIAnalysisWidgetProps {
  data: AIAnalysisResult | AgentSummaryResponse | null;
  loading: boolean;
}

export const AIAnalysisWidget: React.FC<AIAnalysisWidgetProps> = ({
  data,
  loading,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card className="w-full shadow-none border-1">
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
      <Card className="w-full shadow-none border-1">
        <CardBody>
          <p className="text-gray-500">{t("ai.summaryError")}</p>
        </CardBody>
      </Card>
    );
  }

  // Type guard to check if data is AgentSummaryResponse
  const isAgentSummary = (data: any): data is AgentSummaryResponse => {
    return "summary_text" in data;
  };

  // Handle Agent Summary Response
  if (isAgentSummary(data)) {
    return (
      <Card className="w-full shadow-none border-1">
        <CardBody>
          <h3 className="text-lg font-semibold mb-2">Resumen de IA</h3>
          <p className="text-sm text-gray-600 mb-3">
            {new Date().toLocaleDateString()}
          </p>
          <p className="mt-3 whitespace-pre-wrap">{data.summary_text}</p>
        </CardBody>
      </Card>
    );
  }

  // Handle AIAnalysisResult (existing functionality)
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
