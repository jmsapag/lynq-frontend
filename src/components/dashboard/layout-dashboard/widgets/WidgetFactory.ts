import { WidgetConfig, WidgetFactoryParams } from "./types";
import { MetricWidgets } from "./MetricWidgets";
import { ChartWidgets } from "./ChartWidgets";

export const createWidgetConfig = (
  params: WidgetFactoryParams,
): WidgetConfig[] => {
  return [
    MetricWidgets.createTotalInWidget(params),
    MetricWidgets.createTotalOutWidget(params),
    MetricWidgets.createEntryRateWidget(params),
    ChartWidgets.createPeopleFlowChartWidget(params),
    ChartWidgets.createCumulativePeopleChartWidget(params),
    ChartWidgets.createTrafficHeatmapWidget(params),
    ChartWidgets.createEntryRateChartWidget(params),
    // FootfallCam Chart Widgets
    ChartWidgets.createReturningCustomersChartWidget(params),
    ChartWidgets.createAvgVisitDurationChartWidget(params),
    ChartWidgets.createAffluenceChartWidget(params),
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
