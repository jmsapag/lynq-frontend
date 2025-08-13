import { ChartCard } from "../../charts/chart-card";
import { LineChart } from "../../charts/line-chart";
import { CumulativeChart } from "../../charts/cumulative-chart";
import { EntryRateChart } from "../../charts/entry-rate/entry-rate-chart";
import { ChartHeatMap } from "../../charts/heat-map/chart-heat-map";
import { WidgetConfig, WidgetFactoryParams } from "./types";

const NoDataMessage = () => (
  <div className="flex items-center justify-center h-64 text-gray-500">
    No data available. Please select sensors and date range.
  </div>
);

export const ChartWidgets = {
  createPeopleFlowChartWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "people-flow-chart",
    type: "people-flow-chart",
    title: "People Flow Chart",
    translationKey: "dashboard.charts.peopleFlow",
    category: "chart",
    component: (
      <ChartCard
        title="Flujo de Personas (In/Out)"
        translationKey="dashboard.charts.peopleFlow"
      >
        {params.chartData.categories.length === 0 ? (
          <NoDataMessage />
        ) : (
          <LineChart
            data={params.chartData}
            groupBy={params.sensorRecordsFormData.groupBy}
          />
        )}
      </ChartCard>
    ),
  }),

  createTrafficHeatmapWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "traffic-heatmap",
    type: "traffic-heatmap",
    title: "Traffic Heatmap",
    translationKey: "dashboard.charts.trafficHeatmap",
    category: "chart",
    component: (
      <ChartCard
        title="Traffic Heatmap (By Day & Hour)"
        translationKey="dashboard.charts.trafficHeatmap"
      >
        {params.chartData.categories.length === 0 ? (
          <NoDataMessage />
        ) : (
          <ChartHeatMap data={params.sensorData} />
        )}
      </ChartCard>
    ),
  }),

  createEntryRateChartWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "entry-rate-chart",
    type: "entry-rate-chart",
    title: "Entry Rate Chart",
    translationKey: "dashboard.charts.entryRateOverTime",
    category: "chart",
    component: (
      <ChartCard
        title="Entry Rate Over Time"
        translationKey="dashboard.charts.entryRateOverTime"
      >
        {params.chartData.categories.length === 0 ? (
          <NoDataMessage />
        ) : (
          <EntryRateChart
            data={params.chartData}
            groupBy={params.sensorRecordsFormData.groupBy}
          />
        )}
      </ChartCard>
    ),
  }),

  createCumulativePeopleChartWidget: (
    params: WidgetFactoryParams,
  ): WidgetConfig => ({
    id: "cumulative-people-chart",
    type: "cumulative-people-chart",
    title: "People in Store",
    translationKey: "dashboard.charts.peopleInStore",
    category: "chart",
    component: (
      <ChartCard
        title="People in Store (Cumulative)"
        translationKey="dashboard.charts.peopleInStore"
      >
        {params.chartData.categories.length === 0 ? (
          <NoDataMessage />
        ) : (
          <CumulativeChart
            data={params.chartData}
            groupBy={params.sensorRecordsFormData.groupBy}
          />
        )}
      </ChartCard>
    ),
  }),
};
