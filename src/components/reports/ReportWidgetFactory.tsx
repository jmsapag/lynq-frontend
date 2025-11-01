import React from "react";
import { ReportWidgetType } from "../../types/reportLayout";

// Import dashboard widgets to reuse them
import { SensorDataCard } from "../dashboard/charts/card";
import IngressMixedChart from "../dashboard/charts/ingress-mixed-chart";
import { ChartHeatMap } from "../dashboard/charts/heat-map/chart-heat-map";
import { EntryRateChart } from "../dashboard/charts/entry-rate/entry-rate-chart";
import { CumulativeChart } from "../dashboard/charts/cumulative-chart";
import { ReturningCustomersChart } from "../dashboard/charts/returning-customers-chart";
import { AffluenceChart } from "../dashboard/charts/affluence-chart";
import { format } from "date-fns";

interface ReportWidgetInfo {
  id: string;
  type: ReportWidgetType;
  title: string;
  category: "metric" | "chart";
  component: React.ReactNode;
}

interface ReportWidgetFactoryParams {
  metrics: {
    totalIn: number;
    totalOut: number;
    entryRate: number;
    dailyAverageIn: number;
    dailyAverageOut: number;
    percentageChange: number;
    mostCrowdedDay: { date: Date; value: number } | null;
    leastCrowdedDay: { date: Date; value: number } | null;
    returningCustomers: number;
    affluence: number;
  };
  chartData: {
    categories: string[];
    values: Array<{ in: number; out: number }>;
  };
  sensorData: any;
  sensorRecordsFormData: any;
  dateRange: { start: Date; end: Date };
  sensorIdsList: string;
  getSensorDetails: () => any[];
}

export const createReportWidgets = (
  params: ReportWidgetFactoryParams,
): ReportWidgetInfo[] => {
  const commonData = {
    date_range_start: format(params.dateRange.start, "yyyy-MM-dd"),
    date_range_end: format(params.dateRange.end, "yyyy-MM-dd"),
    sensors: params.sensorIdsList,
    sensorDetails: params.getSensorDetails(),
  };

  return [
    // Metric Widgets
    {
      id: "total-in",
      type: "total-in",
      title: "Total In",
      category: "metric",
      component: (
        <SensorDataCard
          title="Total In"
          value={params.metrics.totalIn.toLocaleString()}
          translationKey="dashboard.metrics.totalIn"
          descriptionTranslationKey="dashboard.metrics.totalInDescription"
          unit="people"
          dateRange={params.dateRange}
          data={{ ...commonData, total_in: params.metrics.totalIn }}
        />
      ),
    },
    {
      id: "total-out",
      type: "total-out",
      title: "Total Out",
      category: "metric",
      component: (
        <SensorDataCard
          title="Total Out"
          value={params.metrics.totalOut.toLocaleString()}
          translationKey="dashboard.metrics.totalOut"
          descriptionTranslationKey="dashboard.metrics.totalOutDescription"
          unit="people"
          dateRange={params.dateRange}
          data={{ ...commonData, total_out: params.metrics.totalOut }}
        />
      ),
    },
    {
      id: "entry-rate",
      type: "entry-rate",
      title: "Entry Rate",
      category: "metric",
      component: (
        <SensorDataCard
          title="Entry Rate"
          value={params.metrics.entryRate}
          translationKey="dashboard.metrics.entryRate"
          descriptionTranslationKey="dashboard.metrics.entryRateDescription"
          unit="%"
          dateRange={params.dateRange}
          data={{ ...commonData, entry_rate: params.metrics.entryRate }}
        />
      ),
    },
    {
      id: "daily-average-in",
      type: "daily-average-in",
      title: "Daily Average In",
      category: "metric",
      component: (
        <SensorDataCard
          title="Daily Average In"
          value={params.metrics.dailyAverageIn.toLocaleString()}
          translationKey="dashboard.metrics.dailyAverageIn"
          descriptionTranslationKey="dashboard.metrics.dailyAverageInDescription"
          unit="people/day"
          dateRange={params.dateRange}
          data={{
            ...commonData,
            daily_average_in: params.metrics.dailyAverageIn,
          }}
        />
      ),
    },
    {
      id: "daily-average-out",
      type: "daily-average-out",
      title: "Daily Average Out",
      category: "metric",
      component: (
        <SensorDataCard
          title="Daily Average Out"
          value={params.metrics.dailyAverageOut.toLocaleString()}
          translationKey="dashboard.metrics.dailyAverageOut"
          descriptionTranslationKey="dashboard.metrics.dailyAverageOutDescription"
          unit="people/day"
          dateRange={params.dateRange}
          data={{
            ...commonData,
            daily_average_out: params.metrics.dailyAverageOut,
          }}
        />
      ),
    },
    {
      id: "most-crowded-day",
      type: "most-crowded-day",
      title: "Most Crowded Day",
      category: "metric",
      component: (
        <SensorDataCard
          title="Most Crowded Day"
          value={
            params.metrics.mostCrowdedDay
              ? format(params.metrics.mostCrowdedDay.date, "d MMM")
              : "-"
          }
          translationKey="dashboard.metrics.mostCrowdedDay"
          descriptionTranslationKey="dashboard.metrics.mostCrowdedDayDescription"
          unit={
            params.metrics.mostCrowdedDay
              ? `(${params.metrics.mostCrowdedDay.value.toLocaleString()} people)`
              : ""
          }
          dateRange={params.dateRange}
          data={{
            ...commonData,
            most_crowded_day: params.metrics.mostCrowdedDay
              ? format(params.metrics.mostCrowdedDay.date, "yyyy-MM-dd")
              : "-",
            most_crowded_value: params.metrics.mostCrowdedDay?.value || 0,
          }}
        />
      ),
    },
    {
      id: "least-crowded-day",
      type: "least-crowded-day",
      title: "Least Crowded Day",
      category: "metric",
      component: (
        <SensorDataCard
          title="Least Crowded Day"
          value={
            params.metrics.leastCrowdedDay
              ? format(params.metrics.leastCrowdedDay.date, "d MMM")
              : "-"
          }
          translationKey="dashboard.metrics.leastCrowdedDay"
          descriptionTranslationKey="dashboard.metrics.leastCrowdedDayDescription"
          unit={
            params.metrics.leastCrowdedDay
              ? `(${params.metrics.leastCrowdedDay.value.toLocaleString()} people)`
              : ""
          }
          dateRange={params.dateRange}
          data={{
            ...commonData,
            least_crowded_day: params.metrics.leastCrowdedDay
              ? format(params.metrics.leastCrowdedDay.date, "yyyy-MM-dd")
              : "-",
            least_crowded_value: params.metrics.leastCrowdedDay?.value || 0,
          }}
        />
      ),
    },
    {
      id: "percentage-change",
      type: "percentage-change",
      title: "Percentage Change",
      category: "metric",
      component: (
        <SensorDataCard
          title="Percentage Increase/Decrease"
          value={
            (params.metrics.percentageChange > 0 ? "+" : "") +
            params.metrics.percentageChange.toLocaleString()
          }
          translationKey="dashboard.metrics.percentageChange"
          descriptionTranslationKey="dashboard.metrics.percentageChangeDescription"
          unit="%"
          dateRange={params.dateRange}
          data={{
            ...commonData,
            percentage_change: params.metrics.percentageChange,
          }}
        />
      ),
    },
    // FootfallCam Metrics
    {
      id: "returning-customers",
      type: "returning-customers",
      title: "Returning Customers",
      category: "metric",
      component: (
        <SensorDataCard
          title="Returning Customers"
          value={
            params.metrics.returningCustomers > 0
              ? params.metrics.returningCustomers.toLocaleString()
              : "N/A"
          }
          translationKey="dashboard.metrics.returningCustomers"
          descriptionTranslationKey="dashboard.metrics.returningCustomersDescription"
          unit={params.metrics.returningCustomers > 0 ? "customers" : ""}
          dateRange={params.dateRange}
          data={{
            ...commonData,
            returning_customers: params.metrics.returningCustomers,
          }}
        />
      ),
    },
    {
      id: "affluence",
      type: "affluence",
      title: "Affluence",
      category: "metric",
      component: (
        <SensorDataCard
          title="Affluence"
          value={
            params.metrics.affluence > 0
              ? params.metrics.affluence.toFixed(2)
              : "N/A"
          }
          translationKey="dashboard.metrics.affluence"
          descriptionTranslationKey="dashboard.metrics.affluenceDescription"
          unit={params.metrics.affluence > 0 ? "%" : ""}
          dateRange={params.dateRange}
          data={{ ...commonData, affluence: params.metrics.affluence }}
        />
      ),
    },
    // Chart Widgets
    {
      id: "people-flow-chart",
      type: "people-flow-chart",
      title: "People Flow Chart",
      category: "chart",
      component: (
        <IngressMixedChart
          data={params.chartData}
          groupBy={params.sensorRecordsFormData.groupBy}
          rawData={params.sensorData}
        />
      ),
    },
    {
      id: "traffic-heatmap",
      type: "traffic-heatmap",
      title: "Traffic Heatmap",
      category: "chart",
      component: <ChartHeatMap data={params.sensorData} />,
    },
    {
      id: "entry-rate-chart",
      type: "entry-rate-chart",
      title: "Entry Rate Chart",
      category: "chart",
      component: (
        <EntryRateChart
          data={params.chartData}
          groupBy={params.sensorRecordsFormData.groupBy}
          rawData={params.sensorData}
        />
      ),
    },
    {
      id: "cumulative-people-chart",
      type: "cumulative-people-chart",
      title: "Cumulative People Chart",
      category: "chart",
      component: (
        <CumulativeChart
          data={params.chartData}
          groupBy={params.sensorRecordsFormData.groupBy}
        />
      ),
    },
    // FootfallCam Charts
    {
      id: "returning-customers-chart",
      type: "returning-customers-chart",
      title: "Returning Customers Chart",
      category: "chart",
      component: (
        <ReturningCustomersChart
          data={params.sensorData}
          groupBy={params.sensorRecordsFormData.groupBy}
        />
      ),
    },
    {
      id: "affluence-chart",
      type: "affluence-chart",
      title: "Affluence Chart",
      category: "chart",
      component: (
        <AffluenceChart
          data={params.sensorData}
          groupBy={params.sensorRecordsFormData.groupBy}
        />
      ),
    },
  ];
};

export type { ReportWidgetInfo, ReportWidgetFactoryParams };
