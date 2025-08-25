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
    title: "Cumulative Entries",
    translationKey: "dashboard.charts.cumulativeEntries",
    category: "chart",
    component: (
      <ChartCard
        title="Cumulative Entries (Daily Reset)"
        translationKey="dashboard.charts.cumulativeEntries"
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

  // FootfallCam Chart Widgets
  createReturningCustomersChartWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "returning-customers-chart",
    type: "returning-customers-chart",
    title: "Returning Customers Chart",
    translationKey: "dashboard.charts.returningCustomersChart",
    category: "chart",
    component: (
      <ChartCard
        title="Returning Customers Over Time"
        translationKey="dashboard.charts.returningCustomersChart"
      >
        {!params.sensorData?.returningCustomers || params.sensorData.returningCustomers.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No FootfallCam data available for returning customers.
          </div>
        ) : (
          <ReturningCustomersChart
            data={{
              categories: params.sensorData.timestamps || [],
              values: params.sensorData.returningCustomers || [],
            }}
            groupBy={params.sensorRecordsFormData.groupBy}
          />
        )}
      </ChartCard>
    ),
  }),

  createAvgVisitDurationChartWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "avg-visit-duration-chart",
    type: "avg-visit-duration-chart",
    title: "Avg Visit Duration Chart",
    translationKey: "dashboard.charts.avgVisitDurationChart",
    category: "chart",
    component: (
      <ChartCard
        title="Average Visit Duration Over Time"
        translationKey="dashboard.charts.avgVisitDurationChart"
      >
        {!params.sensorData?.avgVisitDuration || params.sensorData.avgVisitDuration.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No FootfallCam data available for visit duration.
          </div>
        ) : (
          <AvgVisitDurationChart
            data={{
              categories: params.sensorData.timestamps || [],
              values: params.sensorData.avgVisitDuration || [],
            }}
            groupBy={params.sensorRecordsFormData.groupBy}
          />
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
        title="Affluence Over Time"
        translationKey="dashboard.charts.affluenceChart"
      >
        {!params.sensorData?.affluence || params.sensorData.affluence.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No FootfallCam data available for affluence.
          </div>
        ) : (
          <AffluenceChart
            data={{
              categories: params.sensorData.timestamps || [],
              values: params.sensorData.affluence || [],
            }}
            groupBy={params.sensorRecordsFormData.groupBy}
          />
        )}
      </ChartCard>
    ),
  }),
};
