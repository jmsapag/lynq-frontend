// src/components/dashboard/layout-overview/widgets/widget-factory.ts
import {
  OverviewWidgetConfig,
  OverviewWidgetFactoryParams,
  OverviewWidgetType,
} from "./types";
import { TFunction } from "i18next";
import { format } from "date-fns";

export const createOverviewWidgetFactory = (
  params: OverviewWidgetFactoryParams,
  t: TFunction,
): Record<OverviewWidgetType, OverviewWidgetConfig> => {
  const { metrics, dateRange, sensorIdsList, getSensorDetails } = params;

  const commonData = {
    date_range_start: format(dateRange.start, "yyyy-MM-dd"),
    date_range_end: format(dateRange.end, "yyyy-MM-dd"),
    sensors: sensorIdsList,
    sensorDetails: getSensorDetails(),
  };

  return {
    "total-in": {
      id: "total-in",
      type: "total-in",
      title: t("dashboard.metrics.totalIn", "Total In"),
      translationKey: "dashboard.metrics.totalIn",
      descriptionTranslationKey: "dashboard.metrics.totalInDescription",
      category: "metric",
      value: metrics.totalIn.toLocaleString(),
      unit: t("common.people", "people"),
      data: { ...commonData, total_in: metrics.totalIn },
    },
    "total-out": {
      id: "total-out",
      type: "total-out",
      title: t("dashboard.metrics.totalOut", "Total Out"),
      translationKey: "dashboard.metrics.totalOut",
      descriptionTranslationKey: "dashboard.metrics.totalOutDescription",
      category: "metric",
      value: metrics.totalOut.toLocaleString(),
      unit: t("common.people", "people"),
      data: { ...commonData, total_out: metrics.totalOut },
    },
    "entry-rate": {
      id: "entry-rate",
      type: "entry-rate",
      title: t("dashboard.metrics.entryRate", "Entry Rate"),
      translationKey: "dashboard.metrics.entryRate",
      descriptionTranslationKey: "dashboard.metrics.entryRateDescription",
      category: "metric",
      value: metrics.entryRate,
      unit: "%",
      data: { ...commonData, entry_rate: metrics.entryRate },
    },
    "daily-average-in": {
      id: "daily-average-in",
      type: "daily-average-in",
      title: t("dashboard.metrics.dailyAverageIn", "Daily Average In"),
      translationKey: "dashboard.metrics.dailyAverageIn",
      descriptionTranslationKey: "dashboard.metrics.dailyAverageInDescription",
      category: "metric",
      value: metrics.dailyAverageIn.toLocaleString(),
      unit: t("common.peoplePerDay", "people/day"),
      data: { ...commonData, daily_average_in: metrics.dailyAverageIn },
    },
    "daily-average-out": {
      id: "daily-average-out",
      type: "daily-average-out",
      title: t("dashboard.metrics.dailyAverageOut", "Daily Average Out"),
      translationKey: "dashboard.metrics.dailyAverageOut",
      descriptionTranslationKey: "dashboard.metrics.dailyAverageOutDescription",
      category: "metric",
      value: metrics.dailyAverageOut.toLocaleString(),
      unit: t("common.peoplePerDay", "people/day"),
      data: { ...commonData, daily_average_out: metrics.dailyAverageOut },
    },
    "most-crowded-day": {
      id: "most-crowded-day",
      type: "most-crowded-day",
      title: t("dashboard.metrics.mostCrowdedDay", "Most Crowded Day"),
      translationKey: "dashboard.metrics.mostCrowdedDay",
      descriptionTranslationKey: "dashboard.metrics.mostCrowdedDayDescription",
      category: "metric",
      value: metrics.mostCrowdedDay
        ? format(metrics.mostCrowdedDay.date, "d MMM")
        : "-",
      unit: metrics.mostCrowdedDay
        ? `(${metrics.mostCrowdedDay.value.toLocaleString()} ${t("common.people", "people")})`
        : "",
      data: {
        ...commonData,
        most_crowded_day: metrics.mostCrowdedDay
          ? format(metrics.mostCrowdedDay.date, "yyyy-MM-dd")
          : "-",
        most_crowded_value: metrics.mostCrowdedDay?.value || 0,
      },
    },
    "least-crowded-day": {
      id: "least-crowded-day",
      type: "least-crowded-day",
      title: t("dashboard.metrics.leastCrowdedDay", "Least Crowded Day"),
      translationKey: "dashboard.metrics.leastCrowdedDay",
      descriptionTranslationKey: "dashboard.metrics.leastCrowdedDayDescription",
      category: "metric",
      value: metrics.leastCrowdedDay
        ? format(metrics.leastCrowdedDay.date, "d MMM")
        : "-",
      unit: metrics.leastCrowdedDay
        ? `(${metrics.leastCrowdedDay.value.toLocaleString()} ${t("common.people", "people")})`
        : "",
      data: {
        ...commonData,
        least_crowded_day: metrics.leastCrowdedDay
          ? format(metrics.leastCrowdedDay.date, "yyyy-MM-dd")
          : "-",
        least_crowded_value: metrics.leastCrowdedDay?.value || 0,
      },
    },
    "percentage-change": {
      id: "percentage-change",
      type: "percentage-change",
      title: t(
        "dashboard.metrics.percentageChange",
        "Percentage Increase/Decrease",
      ),
      translationKey: "dashboard.metrics.percentageChange",
      descriptionTranslationKey:
        "dashboard.metrics.percentageChangeDescription",
      category: "metric",
      value:
        (metrics.percentageChange > 0 ? "+" : "") +
        metrics.percentageChange.toLocaleString(),
      unit: "%",
      data: { ...commonData, percentage_change: metrics.percentageChange },
    },
  };
};
