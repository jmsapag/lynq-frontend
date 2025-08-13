import React, { useEffect, useRef, useCallback } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

interface BaseChartProps {
  option: EChartsOption;
  className?: string;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  option,
  className = "",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const handleResize = useCallback(() => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);

      // Set up ResizeObserver for more reliable resize detection
      resizeObserver.current = new ResizeObserver(() => {
        handleResize();
      });

      resizeObserver.current.observe(chartRef.current);
    }

    return () => {
      resizeObserver.current?.disconnect();
      chartInstance.current?.dispose();
    };
  }, [handleResize]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, true); // true for merge option
      // Force resize after setting option to ensure proper rendering
      setTimeout(() => {
        chartInstance.current?.resize();
      }, 100);
    }
  }, [option]);

  // Keep window resize handler as backup
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return <div ref={chartRef} className={`w-full h-full ${className}`} />;
};
