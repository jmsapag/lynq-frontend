import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  Input,
  Spinner,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { AIAnalysisChart } from "../components/dashboard/charts/ai-chart";
import { SensorDataCard } from "../components/dashboard/charts/card";
import { useForecasting } from "../hooks/ai/useForecasting";
import { ForecastGranularity } from "../types/forecasting";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon, UsersIcon } from "@heroicons/react/16/solid";

type TimePeriod = "daily" | "weekly" | "monthly" | "quarterly";

const granularityMap: Record<TimePeriod, ForecastGranularity> = {
  daily: 30,
  weekly: 60,
  monthly: 360,
  quarterly: 1440,
};

const AIPage: React.FC = () => {
  const { t } = useTranslation();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  const granularity = granularityMap[timePeriod];
  const {
    forecastData,
    modelStatus,
    loading,
    hasError,
    isReady,
    error,
    refetch,
  } = useForecasting(granularity);

  const handleTimePeriodChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0] as TimePeriod;
    setTimePeriod(selectedKey);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    console.log("AI Search Query:", searchQuery);

    setTimeout(() => {
      setSearchLoading(false);
    }, 1000);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getMetrics = () => {
    if (!forecastData?.intervals) return null;

    const intervals = forecastData.intervals;
    if (intervals.length === 0) return null;

    const avgP50 =
      intervals.reduce((sum: number, item) => sum + item.p50, 0) /
      intervals.length;
    const avgP10 =
      intervals.reduce((sum: number, item) => sum + item.p10, 0) /
      intervals.length;
    const avgP90 =
      intervals.reduce((sum: number, item) => sum + item.p90, 0) /
      intervals.length;

    const confidenceRange = ((avgP90 - avgP10) / avgP50) * 100;
    const confidence = Math.max(0, Math.min(100, 100 - confidenceRange));

    return {
      averageP50: Math.round(avgP50),
      rangeP10P90: `${Math.round(avgP10)} - ${Math.round(avgP90)}`,
      confidence: Math.round(confidence),
    };
  };

  const metrics = getMetrics();
  const dateRange =
    forecastData?.intervals && forecastData.intervals.length > 0
      ? {
          start: new Date(forecastData.intervals[0].timestamp),
          end: new Date(
            forecastData.intervals[forecastData.intervals.length - 1].timestamp,
          ),
        }
      : undefined;

  // Show simple loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="w-full">
          <CardBody className="text-center py-20">
            <Spinner size="lg" className="mb-4" />
            <p className="text-lg text-gray-600">{t("ai.loadingForecasts")}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {modelStatus && isReady && (
            <div className="text-sm text-gray-600">
              {modelStatus.last_training && (
                <span className="text-xs text-gray-500 ml-2">
                  {t("ai.lastTraining")}:{" "}
                  {new Date(modelStatus.last_training).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Select
            size="md"
            className="w-48"
            selectedKeys={new Set([timePeriod])}
            onSelectionChange={handleTimePeriodChange}
            aria-label={t("ai.timePeriodLabel")}
          >
            <SelectItem key="daily">{t("ai.periods.daily")}</SelectItem>
            <SelectItem key="weekly">{t("ai.periods.weekly")}</SelectItem>
            <SelectItem key="monthly">{t("ai.periods.monthly")}</SelectItem>
            <SelectItem key="quarterly">{t("ai.periods.quarterly")}</SelectItem>
          </Select>

          <Button
            color="primary"
            size="md"
            startContent={<SparklesIcon className="w-4 h-4" />}
            onClick={refetch}
          >
            {t("ai.update")}
          </Button>
        </div>
      </div>

      {/* AI Search Bar */}
      <Card shadow="none" className="border border-gray-200">
        <CardBody className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder={t("ai.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              startContent={
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
              }
              className="flex-1"
              isDisabled={!isReady}
            />
            <Button
              color="primary"
              onClick={handleSearch}
              isLoading={searchLoading}
              isDisabled={!searchQuery.trim() || !isReady}
            >
              {t("ai.ask")}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Error Display */}
      {hasError && error && (
        <Card className="w-full border-red-200 bg-red-50">
          <CardBody className="text-center py-8">
            <div className="text-red-600 mb-4">
              <h3 className="text-lg font-semibold mb-2">
                {t("ai.forecastError")}
              </h3>
              <p>{error}</p>
            </div>
            <Button color="danger" variant="bordered" onClick={refetch}>
              {t("ai.retry")}
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Results Section */}
      {isReady && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SensorDataCard
                title={t("ai.metrics.expectedAverage")}
                value={metrics.averageP50.toLocaleString()}
                icon={<ChartBarIcon className="w-6 h-6" />}
                unit={t("ai.metrics.visitors")}
                dateRange={dateRange}
                hideExport={true}
              />

              <SensorDataCard
                title={t("ai.metrics.predictionRange")}
                value={metrics.rangeP10P90}
                icon={<ShieldCheckIcon className="w-6 h-6" />}
                unit={t("ai.metrics.visitors")}
                dateRange={dateRange}
                hideExport={true}
              />

              <SensorDataCard
                title={t("ai.metrics.modelConfidence")}
                value={`${metrics.confidence}%`}
                icon={<UsersIcon className="w-6 h-6" />}
                dateRange={dateRange}
                hideExport={true}
              />
            </div>
          )}

          {/* Forecast Chart - Full Width */}
          <div className="w-full">
            <AIAnalysisChart data={forecastData} loading={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPage;
