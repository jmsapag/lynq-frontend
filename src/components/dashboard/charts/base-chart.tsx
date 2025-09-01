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
    if (chartInstance.current && chartRef.current) {
      // Force a resize with animation disabled for better performance during rapid resizing
      chartInstance.current.resize({
        animation: {
          duration: 0,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);

      // Set up ResizeObserver for more reliable resize detection
      resizeObserver.current = new ResizeObserver((entries) => {
        // Use requestAnimationFrame to debounce rapid resize events
        requestAnimationFrame(() => {
          handleResize();
        });
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
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (chartInstance.current) {
            chartInstance.current.resize({
              animation: {
                duration: 0,
              },
            });
          }
        }, 50);
      });
    }
  }, [option]);

  // Keep window resize handler as backup
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return (
    <div
      ref={chartRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        paddingTop: "56px",
      }}
    />
  );
};
