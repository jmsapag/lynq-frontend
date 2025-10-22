import { WidgetConfig, WidgetFactoryParams } from "./types";
import { MetricWidgets } from "./MetricWidgets";
import { ChartWidgets } from "./ChartWidgets";

export const createWidgetConfig = (
  params: WidgetFactoryParams,
): WidgetConfig[] => {
  return [
    // All metric widgets
    MetricWidgets.createTotalInWidget(params),
    MetricWidgets.createTotalOutWidget(params),
    MetricWidgets.createEntryRateWidget(params),
    MetricWidgets.createDailyAverageInWidget(params),
    MetricWidgets.createDailyAverageOutWidget(params),
    MetricWidgets.createMostCrowdedDayWidget(params),
    MetricWidgets.createLeastCrowdedDayWidget(params),
    MetricWidgets.createPercentageChangeWidget(params),
    MetricWidgets.createReturningCustomersWidget(params),
    MetricWidgets.createAvgVisitDurationWidget(params),
    MetricWidgets.createAffluenceWidget(params),
    // All chart widgets
    ChartWidgets.createPeopleFlowChartWidget(params),
    ChartWidgets.createCumulativePeopleChartWidget(params),
    ChartWidgets.createTrafficHeatmapWidget(params),
    ChartWidgets.createEntryRateChartWidget(params),
    ChartWidgets.createReturningCustomersChartWidget(params),
    ChartWidgets.createAvgVisitDurationChartWidget(params),
    ChartWidgets.createVisitDurationDistributionWidget(params),
    ChartWidgets.createLocationComparisonWidget(params),
    ChartWidgets.createTopStoresChartWidget(params),
  ];
};

export const createWidgetConfigOverview = (
  params: WidgetFactoryParams,
): WidgetConfig[] => {
  return [
    MetricWidgets.createTotalInWidget(params),
    MetricWidgets.createTotalOutWidget(params),
    MetricWidgets.createEntryRateWidget(params),
    MetricWidgets.createDailyAverageInWidget(params),
    MetricWidgets.createDailyAverageOutWidget(params),
    MetricWidgets.createMostCrowdedDayWidget(params),
    MetricWidgets.createLeastCrowdedDayWidget(params),
    MetricWidgets.createPercentageChangeWidget(params),
    // FootfallCam Metric Widgets
    MetricWidgets.createReturningCustomersWidget(params),
    MetricWidgets.createAvgVisitDurationWidget(params),
    MetricWidgets.createAffluenceWidget(params),
  ];
};
