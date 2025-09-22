import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EChartsOption } from "echarts";
import { BaseChart } from "./base-chart.tsx";

interface TurnInRatioDonutProps {
  data: {
    in?: number[];
    returningCustomers?: number[]; // decimals per timestep, e.g. 0.14
  };
  className?: string;
}

export const TurnInRatioDonut: React.FC<TurnInRatioDonutProps> = ({ data, className }) => {
  const { t } = useTranslation();

  const { newCount, returningCount, total } = useMemo(() => {
    const entries = data.in || [];
    const returning = data.returningCustomers || [];
    let totalEntries = 0;
    let weightedReturning = 0;

    for (let i = 0; i < Math.min(entries.length, returning.length); i++) {
      const e = entries[i] || 0;
      let r = returning[i] ?? 0;
      // Normalize if provided as percentage (e.g., 14 means 14%)
      if (r > 1) {
        r = r / 100;
      }
      totalEntries += e;
      weightedReturning += r * e;
    }

    const returningAbs = weightedReturning; // keep decimal for more accurate split
    const newAbs = Math.max(0, totalEntries - returningAbs);
    return { newCount: newAbs, returningCount: returningAbs, total: totalEntries };
  }, [data.in, data.returningCustomers]);

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        const name = params.name;
        const value = params.value as number;
        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
        return `${name}<br/>${t("dashboard.percentage")}: ${pct}%<br/>${t("dashboard.quantity")}: ${value}`;
      },
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      textStyle: { color: "#374151" },
    },
    series: [
      {
        name: t("dashboard.metrics.turnInRatio"),
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: "bold" },
        },
        labelLine: { show: false },
        data: [
          { value: newCount, name: t("dashboard.turnIn.newCustomer"), itemStyle: { color: "#60A5FA" } },
          { value: returningCount, name: t("dashboard.turnIn.returningCustomer"), itemStyle: { color: "#34D399" } },
        ],
      },
    ],
    graphic: total === 0 ? {
      type: "text",
      left: "center",
      top: "middle",
      style: {
        text: t("dashboard.errors.noDataAvailable"),
        fontSize: 16,
        fill: "#6B7280",
      },
    } : undefined,
  };

  return (
    <div
      className="w-full h-full"
      style={{ minWidth: "100px", height: "100%", minHeight: "300px" }}
    >
      <BaseChart option={option} className={className} />
    </div>
  );
};


