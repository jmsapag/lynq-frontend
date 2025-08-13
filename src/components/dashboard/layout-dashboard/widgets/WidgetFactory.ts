import { WidgetConfig, WidgetFactoryParams } from "./types";
import { MetricWidgets } from "./MetricWidgets";
import { ChartWidgets } from "./ChartWidgets";

export const createWidgetConfig = (params: WidgetFactoryParams): WidgetConfig[] => {
  return [
    MetricWidgets.createTotalInWidget(params),
    MetricWidgets.createTotalOutWidget(params),
    MetricWidgets.createEntryRateWidget(params),
    ChartWidgets.createPeopleFlowChartWidget(params),
    ChartWidgets.createCumulativePeopleChartWidget(params),
    ChartWidgets.createTrafficHeatmapWidget(params),
    ChartWidgets.createEntryRateChartWidget(params),
  ];
};
