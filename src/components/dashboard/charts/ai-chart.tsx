import React, { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { Card, CardBody } from "@heroui/react";
import { AIAnalysisResult } from "../../../types/ai.ts";

// Register ECharts components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
]);

interface AIAnalysisChartProps {
  data: AIAnalysisResult | null;
  loading: boolean;
}

export const AIAnalysisChart: React.FC<AIAnalysisChartProps> = ({
  data,
  loading,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // Initialize chart
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      // Handle window resize
      const handleResize = () => {
        chartInstance.current?.resize();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chartInstance.current?.dispose();
        chartInstance.current = null;
      };
    }
  }, []);

  useEffect(() => {
    if (!chartInstance.current || !data) return;

    const isBackcast = data.analysisType === "BACKCAST";

    // Prepare data for the chart
    const dates = data.data.map((item) =>
      new Date(item.timestamp).toLocaleDateString(),
    );
    const actualData = data.data.map((item) =>
      item.predicted ? null : item.value,
    );
    const predictedData = data.data.map((item) =>
      item.predicted ? item.value : null,
    );

    // Configure chart options
    const option = {
      title: {
        text: isBackcast ? "Análisis Retrospectivo" : "Pronóstico",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["Datos actuales", "Datos previstos"],
        bottom: 0,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "Datos actuales",
          type: "line",
          data: actualData,
          symbol: "circle",
          symbolSize: 6,
          itemStyle: {
            color: "#3B82F6",
          },
        },
        {
          name: "Datos previstos",
          type: "line",
          data: predictedData,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            type: "dashed",
          },
          itemStyle: {
            color: "#10B981",
          },
        },
      ],
    };

    chartInstance.current.setOption(option);
  }, [data]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardBody>
          <div className="animate-pulse h-80 bg-gray-100 rounded"></div>
        </CardBody>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardBody>
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500">
              No hay datos disponibles para visualizar.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-none border-1">
      <CardBody>
        <div ref={chartRef} className="h-80 w-full"></div>
      </CardBody>
    </Card>
  );
};
