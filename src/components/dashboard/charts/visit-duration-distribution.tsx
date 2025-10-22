import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { EChartsOption } from "echarts";
import { BaseChart } from "./base-chart.tsx";

type TransformedData = {
  avgVisitDuration: number[];
  in: number[];
};

type ComparisonData = {
  avgVisitDuration: number[];
  in: number[];
} | null;

const DEFAULT_BINS = [
  { key: "0-5m", min: 0, max: 5 * 60 },
  { key: "5-10m", min: 5 * 60, max: 10 * 60 },
  { key: "10-20m", min: 10 * 60, max: 20 * 60 },
  { key: "20-30m", min: 20 * 60, max: 30 * 60 },
  { key: "30-60m", min: 30 * 60, max: 60 * 60 },
  { key: ">60m", min: 60 * 60, max: Infinity },
] as const;

function formatSecondsToMmSs(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds <= 0) return "00m00s";
  const seconds = Math.round(totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(remaining).padStart(2, "0");
  return `${mm}m${ss}s`;
}

interface VisitDurationDistributionProps {
  data: TransformedData;
  comparisonData?: ComparisonData;
  className?: string;
}

export const VisitDurationDistribution: React.FC<
  VisitDurationDistributionProps
> = ({ data, comparisonData = null, className }) => {
  const { t } = useTranslation();

  const { bins, totalVisits, avgSeconds, changePct } = useMemo(() => {
    const visits = data.in || [];
    const durations = data.avgVisitDuration || [];
    const length = Math.min(visits.length, durations.length);

    const binCounts = DEFAULT_BINS.map(() => 0);
    let total = 0;
    let weightedDurationSum = 0;
    // For simple average (unweighted), accumulate durations regardless of visit counts
    let simpleDurationSum = 0;
    let simpleDurationCount = 0;

    for (let i = 0; i < length; i++) {
      const v = visits[i] || 0;
      const secs = durations[i] || 0;
      if (secs <= 0) continue;
      // Track totals for distribution (visit-weighted bins)
      if (v > 0) {
        total += v;
        weightedDurationSum += v * secs;
      }
      // Track for simple average (unweighted)
      simpleDurationSum += secs;
      simpleDurationCount += 1;
      const binIndex = DEFAULT_BINS.findIndex(
        (b) => secs >= b.min && secs < b.max,
      );
      if (binIndex >= 0) binCounts[binIndex] += Math.max(v, 0);
    }

    // Comparison change
    let change = 0;
    if (comparisonData) {
      const cVisits = comparisonData.in || [];
      const cDurations = comparisonData.avgVisitDuration || [];
      const clen = Math.min(cVisits.length, cDurations.length);
      let cSimpleSum = 0;
      let cSimpleCount = 0;
      for (let i = 0; i < clen; i++) {
        const secs = cDurations[i] || 0;
        if (secs <= 0) continue;
        cSimpleSum += secs;
        cSimpleCount += 1;
      }
      const currentAvg =
        simpleDurationCount > 0 ? simpleDurationSum / simpleDurationCount : 0;
      const prevAvg = cSimpleCount > 0 ? cSimpleSum / cSimpleCount : 0;
      change = prevAvg > 0 ? ((currentAvg - prevAvg) / prevAvg) * 100 : 0;
    }

    return {
      bins: binCounts,
      totalVisits: total,
      // Use simple average (unweighted) to match card
      avgSeconds:
        simpleDurationCount > 0 ? simpleDurationSum / simpleDurationCount : 0,
      changePct: change,
    };
  }, [data, comparisonData]);

  const categories = DEFAULT_BINS.map((b) => b.key);
  const percentages = bins.map((count) =>
    totalVisits > 0 ? (count / totalVisits) * 100 : 0,
  );

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        const idx = p.dataIndex as number;
        const abs = bins[idx] || 0;
        const pct = percentages[idx] || 0;
        return `${categories[idx]}<br/>${t("dashboard.quantity")}: ${abs.toLocaleString()}<br/>${t("dashboard.percentage")}: ${pct.toFixed(1)}%`;
      },
    },
    grid: { left: 8, right: 8, top: 12, bottom: 8, containLabel: true },
    xAxis: {
      type: "value",
      max: 100,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    yAxis: { type: "category", data: categories },
    series: [
      {
        name: t("dashboard.percentage"),
        type: "bar",
        stack: "distribution",
        label: { show: false },
        itemStyle: { color: "#60A5FA" },
        data: percentages.map((v) => Number(v.toFixed(2))),
      },
    ],
  };

  const avgLabel = formatSecondsToMmSs(avgSeconds);
  const changeUp = changePct > 0;
  const changeColor =
    changePct === 0
      ? "text-gray-500"
      : changeUp
        ? "text-green-600"
        : "text-red-600";

  return (
    <div className={`w-full h-full flex flex-col ${className || ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">
          {t("dashboard.metrics.avgVisitDuration")}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold text-gray-900">{avgLabel}</div>
          {comparisonData && (
            <div className={`text-sm font-medium ${changeColor}`}>
              {changePct !== 0 && (
                <span className="mr-1">{changeUp ? "↑" : "↓"}</span>
              )}
              {Math.abs(changePct).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px]">
        <BaseChart option={option} className="" />
      </div>
    </div>
  );
};
