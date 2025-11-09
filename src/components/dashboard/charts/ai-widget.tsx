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
          <div className="text-center py-8">
            <p className="text-lg font-semibold text-gray-700">
              {t("ai.generatingSummary")}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t("ai.summaryWaitMessage")}
            </p>
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
    return data && "result" in data && data.result.type === "summary";
  };

  // Handle Agent Summary Response
  if (isAgentSummary(data)) {
    const { title, content, keyPoints } = data.result;
    return (
      <Card className="w-full shadow-none border-1">
        <CardBody>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">
            {content}
          </p>
          {keyPoints && keyPoints.length > 0 && (
            <div>
              <h4 className="font-semibold text-md mb-2">
                {t("ai.keyPoints")}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}
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
