import { SensorDataCard } from "../../charts/card";
import { WidgetConfig, WidgetFactoryParams } from "./types";

export const MetricWidgets = {
  createTotalInWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "total-in",
    type: "total-in",
    title: "Total In",
    translationKey: "dashboard.metrics.totalIn",
    category: "metric",
    component: (
      <SensorDataCard
        title="Total In"
        value={params.metrics.totalIn}
        translationKey="dashboard.metrics.totalIn"
        unit="people"
      />
    ),
  }),

  createTotalOutWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "total-out",
    type: "total-out",
    title: "Total Out",
    translationKey: "dashboard.metrics.totalOut",
    category: "metric",
    component: (
      <SensorDataCard
        title="Total Out"
        value={params.metrics.totalOut}
        translationKey="dashboard.metrics.totalOut"
        unit="people"
      />
    ),
  }),

  createEntryRateWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "entry-rate",
    type: "entry-rate",
    title: "Entry Rate",
    translationKey: "dashboard.metrics.entryRate",
    category: "metric",
    component: (
      <SensorDataCard
        title="Entry Rate"
        value={params.metrics.entryRate}
        translationKey="dashboard.metrics.entryRate"
        unit="%"
      />
    ),
  }),
};
