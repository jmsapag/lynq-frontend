import { ChartCard } from "../../charts/chart-card";
import { LineChart } from "../../charts/line-chart";
import { CumulativeChart } from "../../charts/cumulative-chart";
import { EntryRateChart } from "../../charts/entry-rate/entry-rate-chart";
import { ChartHeatMap } from "../../charts/heat-map/chart-heat-map";
import { ReturningCustomersChart } from "../../charts/returning-customers-chart";
import { AvgVisitDurationChart } from "../../charts/avg-visit-duration-chart";
import { AffluenceChart } from "../../charts/affluence-chart";
import { DeviceComparisonChart } from "../../charts/device-comparison.tsx";
import { TopStoresChartCard } from "../../charts/top-stores-chart-card";
import { WidgetConfig, WidgetFactoryParams } from "./types";
import { useTranslation } from "react-i18next";
import React from "react";
import { VisitDurationDistribution } from "../../charts/visit-duration-distribution";

const NoDataMessage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      {t("dashboard.errors.noDataAvailable")}
    </div>
  );
};

const HeatmapIncompatibleMessage: React.FC<{ groupBy: string }> = ({
  groupBy,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-64 text-orange-500">
      <div className="text-center">
        <div className="text-sm font-medium mb-2">
          {t("dashboard.errors.heatmapIncompatibleGrouping", { groupBy })}
        </div>
        <div className="text-xs text-gray-600">
          {t("dashboard.errors.heatmapIncompatibleInstructions")}
        </div>
      </div>
    </div>
  );
};

const LocationComparisonNoDataMessage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <div className="text-center">
        <div className="text-sm">
          {t("dashboard.noData.locationComparison")}
        </div>
      </div>
    </div>
  );
};

const ReturningCustomersNoDataMessage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      {t("dashboard.noData.returningCustomers")}
    </div>
  );
};

const VisitDurationNoDataMessage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      {t("dashboard.noData.visitDuration")}
    </div>
  );
};

const AffluenceNoDataMessage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      {t("dashboard.noData.affluence")}
    </div>
  );
};

const TopStoresNoDataMessage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <div className="text-center">
        <div className="text-sm font-medium mb-2">
          {t("dashboard.noData.topStores")}
        </div>
        <div className="text-xs text-gray-600">
          {t("dashboard.noData.topStoresDescription")}
        </div>
      </div>
    </div>
  );
};

const transformChartDataForExport = (chartData: {
  categories: string[];
  values: Array<{ in: number; out: number }>;
}): any[][] => {
  const headers = ["category", "in", "out"];
  const dataRows = chartData.categories.map((category, index) => [
    category,
    chartData.values[index]?.in ?? 0,
    chartData.values[index]?.out ?? 0,
  ]);
  return [headers, ...dataRows];
};

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
        data={transformChartDataForExport(params.chartData)}
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
        data={transformChartDataForExport(params.chartData)}
      >
        {(() => {
          // Check if data is available
          if (params.chartData.categories.length === 0) {
            return <NoDataMessage />;
          }

          // Check if groupBy is compatible with heatmap (only works well with hourly or smaller intervals)
          const groupBy = params.sensorRecordsFormData.groupBy;
          const incompatibleGroupings = ["day", "week", "month"];

          if (incompatibleGroupings.includes(groupBy)) {
            return <HeatmapIncompatibleMessage groupBy={groupBy} />;
          }

          return <ChartHeatMap data={params.sensorData} />;
        })()}
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
        data={transformChartDataForExport(params.chartData)}
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
        data={transformChartDataForExport(params.chartData)}
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
        title="Returning Customers Over Time"
        translationKey="dashboard.charts.returningCustomersChart"
        data={transformChartDataForExport(params.chartData)}
      >
        {!params.sensorData?.returningCustomers ||
        params.sensorData.returningCustomers.length === 0 ? (
          <ReturningCustomersNoDataMessage />
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

  createAvgVisitDurationChartWidget: (
    params: WidgetFactoryParams,
  ): WidgetConfig => ({
    id: "avg-visit-duration-chart",
    type: "avg-visit-duration-chart",
    title: "Avg Visit Duration Chart",
    translationKey: "dashboard.charts.avgVisitDurationChart",
    category: "chart",
    component: (
      <ChartCard
        title="Average Visit Duration Over Time"
        translationKey="dashboard.charts.avgVisitDurationChart"
        data={transformChartDataForExport(params.chartData)}
      >
        {!params.sensorData?.avgVisitDuration ||
        params.sensorData.avgVisitDuration.length === 0 ? (
          <VisitDurationNoDataMessage />
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

  createVisitDurationDistributionWidget: (
    params: WidgetFactoryParams,
  ): WidgetConfig => ({
    id: "visit-duration-distribution",
    type: "visit-duration-distribution",
    title: "Time in Store Distribution",
    translationKey: "dashboard.charts.timeInStoreDistribution",
    category: "chart",
    component: (
      <ChartCard
        title="Time in Store Distribution"
        translationKey="dashboard.charts.timeInStoreDistribution"
        data={{}}
      >
        {!params.sensorData?.avgVisitDuration ||
        params.sensorData.avgVisitDuration.length === 0 ? (
          <VisitDurationNoDataMessage />
        ) : (
          <VisitDurationDistribution
            data={{
              avgVisitDuration: params.sensorData.avgVisitDuration,
              in: params.sensorData.in,
            }}
            comparisonData={null}
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
        data={transformChartDataForExport(params.chartData)}
      >
        {!params.sensorData?.affluence ||
        params.sensorData.affluence.length === 0 ? (
          <AffluenceNoDataMessage />
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

  createLocationComparisonWidget: (
    params: WidgetFactoryParams,
  ): WidgetConfig => ({
    id: "location-comparison-chart",
    type: "location-comparison-chart",
    title: "Location Comparison",
    translationKey: "dashboard.charts.locationComparison",
    category: "chart",
    component: (
      <ChartCard
        title="Location Comparison"
        translationKey="dashboard.charts.locationComparison"
        data={[]}
      >
        {(() => {
          // Check if we have any sensor data by location
          if (
            !params.sensorDataByLocation ||
            params.sensorDataByLocation.length === 0
          ) {
            return <LocationComparisonNoDataMessage />;
          }

          // Get all unique timestamps from all locations (in case they differ)
          const allTimestamps = params.sensorDataByLocation
            .reduce((acc, location) => {
              if (location?.data?.timestamps) {
                location.data.timestamps.forEach((timestamp) => {
                  if (!acc.includes(timestamp)) {
                    acc.push(timestamp);
                  }
                });
              }
              return acc;
            }, [] as string[])
            .sort();

          // Filter locations that have valid data
          const validLocations = params.sensorDataByLocation.filter(
            (location) =>
              location?.data?.in &&
              location.data.in.length > 0 &&
              location.locationName &&
              location.data.in.some((value) => value > 0), // Check if there's at least one non-zero value
          );

          const chartData = {
            categories: allTimestamps.length > 0 ? allTimestamps : [],
            devices: validLocations.map((location) => ({
              name: location.locationName,
              values: location.data.in || [],
            })),
          };

          // If no valid locations with data, show specific no data message
          if (
            chartData.devices.length === 0 ||
            chartData.categories.length === 0
          ) {
            return <LocationComparisonNoDataMessage />;
          }

          console.log("Location Comparison Chart Data:", {
            locationsCount: params.sensorDataByLocation.length,
            validLocationsCount: validLocations.length,
            devicesCount: chartData.devices.length,
            categories: chartData.categories.length,
            devices: chartData.devices.map((d) => ({
              name: d.name,
              valueCount: d.values.length,
              hasData: d.values.some((v) => v > 0),
            })),
          });

          return (
            <DeviceComparisonChart data={chartData} className="h-[300px]" />
          );
        })()}
      </ChartCard>
    ),
  }),

  createTopStoresChartWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "top-stores-chart",
    type: "top-stores-chart",
    title: "Top Stores Chart",
    translationKey: "dashboard.charts.topStores",
    category: "chart",
    component: (() => {
      if (!params.topStoresData || params.topStoresData.length === 0) {
        return <TopStoresNoDataMessage />;
      }
      return (
        <TopStoresChartCard
          data={params.topStoresData}
          dateRange={params.dateRange}
        />
      );
    })(),
  }),
};
