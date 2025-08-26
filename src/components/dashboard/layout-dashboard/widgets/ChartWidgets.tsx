import { ChartCard } from "../../charts/chart-card";
import { LineChart } from "../../charts/line-chart";
import { CumulativeChart } from "../../charts/cumulative-chart";
import { EntryRateChart } from "../../charts/entry-rate/entry-rate-chart";
import { ChartHeatMap } from "../../charts/heat-map/chart-heat-map";
import { ReturningCustomersChart } from "../../charts/returning-customers-chart";
import { AvgVisitDurationChart } from "../../charts/avg-visit-duration-chart";
import { AffluenceChart } from "../../charts/affluence-chart";
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
        data={{
          categories: params.chartData.categories,
          devices: [
            {
              name: "In",
              values: params.chartData.values.map((v) => v.in),
            },
            {
              name: "Out",
              values: params.chartData.values.map((v) => v.out),
            },
          ],
        }}
        dateRange={params.dateRange}
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
        data={params.sensorData?.rawData || {}}
        dateRange={params.dateRange}
      >
        {params.sensorData?.rawData?.length > 0 ? (
          <ChartHeatMap data={params.sensorData.rawData} />
        ) : (
          <NoDataMessage />
        )}
      </ChartCard>
    ),
  }),

  createEntryRateChartWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "entry-rate-chart",
    type: "entry-rate-chart",
    title: "Entry Rate Chart",
    translationKey: "dashboard.charts.entryRateChart",
    category: "chart",
    component: (
      <ChartCard
        title="Entry Rate Chart"
        translationKey="dashboard.charts.entryRateChart"
        data={params.sensorData?.entryRateData || {}}
        dateRange={params.dateRange}
      >
        {params.sensorData?.entryRateData?.length > 0 ? (
          <EntryRateChart
            data={params.sensorData.entryRateData}
            groupBy={params.sensorRecordsFormData.groupBy}
          />
        ) : (
          <NoDataMessage />
        )}
      </ChartCard>
    ),
  }),

  createCumulativePeopleChartWidget: (
    params: WidgetFactoryParams,
  ): WidgetConfig => ({
    id: "cumulative-people-chart",
    type: "cumulative-people-chart",
    title: "Cumulative People Chart",
    translationKey: "dashboard.charts.cumulativePeople",
    category: "chart",
    component: (
      <ChartCard
        title="Cumulative People Chart"
        translationKey="dashboard.charts.cumulativePeople"
        data={{
          categories: params.chartData.categories,
          devices: [
            {
              name: "In",
              values: params.chartData.values.map((v) => v.in),
            },
            {
              name: "Out",
              values: params.chartData.values.map((v) => v.out),
            },
          ],
        }}
        dateRange={params.dateRange}
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

  createReturningCustomersChartWidget: (
    params: WidgetFactoryParams,
  ): WidgetConfig => ({
    id: "returning-customers-chart",
    type: "returning-customers-chart",
    title: "Returning Customers Chart",
    translationKey: "dashboard.charts.returningCustomersChart",
    category: "chart",
    component: (
      <ChartCard
        title="Returning Customers Chart"
        translationKey="dashboard.charts.returningCustomersChart"
        data={params.sensorData?.returningCustomersData || {}}
        dateRange={params.dateRange}
      >
        {params.sensorData?.returningCustomersData?.length > 0 ? (
          <ReturningCustomersChart
            data={params.sensorData.returningCustomersData}
            groupBy={params.sensorRecordsFormData.groupBy}
          />
        ) : (
          <NoDataMessage />
        )}
      </ChartCard>
    ),
  }),

  createAvgVisitDurationChartWidget: (
    params: WidgetFactoryParams,
  ): WidgetConfig => ({
    id: "avg-visit-duration-chart",
    type: "avg-visit-duration-chart",
    title: "Avg. Visit Duration Chart",
    translationKey: "dashboard.charts.avgVisitDurationChart",
    category: "chart",
    component: (
      <ChartCard
        title="Avg. Visit Duration Chart"
        translationKey="dashboard.charts.avgVisitDurationChart"
        data={params.sensorData?.avgVisitDurationData || {}}
        dateRange={params.dateRange}
      >
        {params.sensorData?.avgVisitDurationData?.length > 0 ? (
          <AvgVisitDurationChart
            data={params.sensorData.avgVisitDurationData}
            groupBy={params.sensorRecordsFormData.groupBy}
          />
        ) : (
          <NoDataMessage />
        )}
      </ChartCard>
    ),
  }),

  createAffluenceChartWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "affluence-chart",
    type: "affluence-chart",
    title: "Affluence Chart",
    translationKey: "dashboard.charts.affluenceChart",
    category: "chart",
    component: (
      <ChartCard
        title="Affluence Chart"
        translationKey="dashboard.charts.affluenceChart"
        data={params.sensorData?.affluenceData || {}}
        dateRange={params.dateRange}
      >
        {params.sensorData?.affluenceData?.length > 0 ? (
          <AffluenceChart
            data={params.sensorData.affluenceData}
            groupBy={params.sensorRecordsFormData.groupBy}
          />
        ) : (
          <NoDataMessage />
        )}
      </ChartCard>
    ),
  }),
};
