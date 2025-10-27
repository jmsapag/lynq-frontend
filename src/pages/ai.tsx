import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  Input,
} from "@heroui/react";
import { AIAnalysisWidget } from "../components/dashboard/charts/ai-widget";
import { AIAnalysisChart } from "../components/dashboard/charts/ai-chart";
import { SensorDataCard } from "../components/dashboard/charts/card";
import { fetchAIAnalysis } from "../services/aiService";
import { AIAnalysisType, AIAnalysisResult } from "../types/ai";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon, UsersIcon } from "@heroicons/react/16/solid";

type TimePeriod = "daily" | "weekly" | "monthly";

const AIPage: React.FC = () => {
  const [analysisType] = useState<AIAnalysisType>("FORECAST");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  const handleTimePeriodChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0] as TimePeriod;
    setTimePeriod(selectedKey);
  };

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (timePeriod) {
        case "daily":
          startDate.setDate(endDate.getDate() - 1);
          break;
        case "weekly":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "monthly":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
      }

      const result = await fetchAIAnalysis({
        type: analysisType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      setAnalysisResult(result);
    } catch (err) {
      setError("Error al cargar los datos de análisis.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    loadAnalysis();
  }, [timePeriod]);

  const getMetrics = () => {
    if (!analysisResult) return null;

    const actualData = analysisResult.data.filter((item) => !item.predicted);
    const predictedData = analysisResult.data.filter((item) => item.predicted);

    const avgActual =
      actualData.length > 0
        ? actualData.reduce((sum, item) => sum + item.value, 0) /
          actualData.length
        : 0;

    const avgPredicted =
      predictedData.length > 0
        ? predictedData.reduce((sum, item) => sum + item.value, 0) /
          predictedData.length
        : avgActual;

    return {
      currentTraffic: Math.round(avgActual),
      predictedTraffic: Math.round(avgPredicted),
      confidence: 87,
    };
  };

  const metrics = getMetrics();
  const dateRange = analysisResult
    ? {
        start: new Date(analysisResult.data[0]?.timestamp),
        end: new Date(
          analysisResult.data[analysisResult.data.length - 1]?.timestamp,
        ),
      }
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-end gap-4">
        <Select
          size="md"
          className="w-32"
          selectedKeys={new Set([timePeriod])}
          onSelectionChange={handleTimePeriodChange}
          aria-label="Período de tiempo"
        >
          <SelectItem key="daily">Diario</SelectItem>
          <SelectItem key="weekly">Semanal</SelectItem>
          <SelectItem key="monthly">Mensual</SelectItem>
        </Select>

        <Button
          color="primary"
          size="md"
          startContent={<SparklesIcon className="w-4 h-4" />}
          onClick={loadAnalysis}
          isLoading={loading}
        >
          Predecir con IA
        </Button>
      </div>

      {/* AI Analysis Widget */}
      {(analysisResult || loading) && (
        <AIAnalysisWidget data={analysisResult} loading={loading} />
      )}

      {/* AI Search Bar */}
      <Card shadow="none" className="border border-gray-200">
        <CardBody className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Pregúntale algo a la IA sobre tus datos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              startContent={
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              }
              className="flex-1"
            />
            <Button
              color="primary"
              onClick={handleSearch}
              isLoading={searchLoading}
              isDisabled={!searchQuery.trim()}
            >
              Preguntar
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      {/* Results Section */}
      {(analysisResult || loading) && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          {metrics && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SensorDataCard
                title="Tráfico Promedio Actual"
                value={metrics.currentTraffic.toLocaleString()}
                icon={<ChartBarIcon className="w-6 h-6" />}
                unit="visitantes"
                dateRange={dateRange}
                hideExport={true}
              />

              <SensorDataCard
                title="Tráfico Predicho"
                value={metrics.predictedTraffic.toLocaleString()}
                icon={<ShieldCheckIcon className="w-6 h-6" />}
                unit="visitantes"
                dateRange={dateRange}
                hideExport={true}
              />

              <SensorDataCard
                title="Alfuencia"
                value={`${metrics.confidence}%`}
                icon={<UsersIcon className="w-6 h-6" />}
                dateRange={dateRange}
                hideExport={true}
              />
            </div>
          )}

          {/* Loading State for Metrics */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Chart - Full Width */}
          <div className="w-full">
            <AIAnalysisChart data={analysisResult} loading={loading} />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysisResult && !loading && !error && (
        <Card shadow="none" className="w-full border border-gray-200">
          <CardBody className="text-center py-12">
            <SparklesIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Análisis con IA
            </h3>
            <p className="text-gray-600 mb-4">
              Utiliza la inteligencia artificial para predecir tendencias y
              obtener insights de tus datos.
            </p>
            <Button
              color="primary"
              onClick={loadAnalysis}
              startContent={<StarIcon className="w-4 h-4" />}
            >
              Comenzar Análisis
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default AIPage;
