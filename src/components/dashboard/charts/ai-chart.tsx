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
import { ForecastResponse } from "../../../types/forecasting";

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
  data: ForecastResponse | null;
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
    if (!chartInstance.current || !data?.intervals) return;

    // Prepare data for the chart
    const dates = data.intervals.map((item) =>
      new Date(item.timestamp).toLocaleString("es-ES", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );

    const p10Data = data.intervals.map((item) => item.p10);
    const p50Data = data.intervals.map((item) => item.p50);
    const p90Data = data.intervals.map((item) => item.p90);

    // Get model type label
    const getModelLabel = (modelType: string) => {
      return `${modelType} - IA`;
    };

    // Configure chart options
    const option = {
      title: {
        text: getModelLabel(data.modelType),
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
        formatter: (params: any) => {
          const date = params[0].axisValue;
          let tooltipContent = `<strong>${date}</strong><br/>`;

          params.forEach((param: any) => {
            const color = param.color;
            const name = param.seriesName;
            const value = param.value;
            tooltipContent += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>${name}: <strong>${value}</strong> visitantes<br/>`;
          });

          return tooltipContent;
        },
      },
      legend: {
        data: ["P10", "P50", "P90"],
        bottom: 0,
        textStyle: {
          fontSize: 12,
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLabel: {
          rotate: 45,
          fontSize: 10,
        },
      },
      yAxis: {
        type: "value",
        name: "Visitantes",
        nameLocation: "middle",
        nameGap: 50,
        axisLabel: {
          formatter: "{value}",
        },
      },
      series: [
        {
          name: "P10",
          type: "line",
          data: p10Data,
          symbol: "circle",
          symbolSize: 4,
          smooth: true,
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: "#EF4444", // Red
          },
          areaStyle: {
            opacity: 0.1,
            color: "#EF4444",
          },
        },
        {
          name: "P50",
          type: "line",
          data: p50Data,
          symbol: "circle",
          symbolSize: 5,
          smooth: true,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: "#3B82F6", // Blue
          },
          emphasis: {
            lineStyle: {
              width: 4,
            },
          },
        },
        {
          name: "P90",
          type: "line",
          data: p90Data,
          symbol: "circle",
          symbolSize: 4,
          smooth: true,
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: "#10B981", // Green
          },
          areaStyle: {
            opacity: 0.1,
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
              No hay datos de pronóstico disponibles para visualizar.
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
