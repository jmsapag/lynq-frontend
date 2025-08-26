import { format } from "date-fns";
import { SensorDataCard } from "../../charts/card";
import { WidgetConfig, WidgetFactoryParams } from "./types";

export const MetricWidgets = {
  // Keep existing widgets
  createTotalInWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "total-in",
    type: "total-in",
    title: "Total In",
    translationKey: "dashboard.metrics.totalIn",
    category: "metric",
    component: (
      <SensorDataCard
        title="Total In"
        value={params.metrics.totalIn.toLocaleString()}
        translationKey="dashboard.metrics.totalIn"
        descriptionTranslationKey="dashboard.metrics.totalInDescription"
        unit="people"
        dateRange={params.dateRange}
        comparison={params.comparisons?.totalIn}
        comparisonPeriod={params.comparisonPeriod}
        data={{
          total_in: params.metrics.totalIn,
          date_range_start: params.dateRange
            ? format(params.dateRange.start, "yyyy-MM-dd")
            : "",
          date_range_end: params.dateRange
            ? format(params.dateRange.end, "yyyy-MM-dd")
            : "",
          sensors: params.sensorIdsList || "",
          sensorDetails: params.getSensorDetails
            ? params.getSensorDetails()
            : [],
        }}
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
        value={params.metrics.totalOut.toLocaleString()}
        translationKey="dashboard.metrics.totalOut"
        descriptionTranslationKey="dashboard.metrics.totalOutDescription"
        unit="people"
        dateRange={params.dateRange}
        comparison={params.comparisons?.totalOut}
        comparisonPeriod={params.comparisonPeriod}
        data={{
          total_out: params.metrics.totalOut,
          date_range_start: params.dateRange
            ? format(params.dateRange.start, "yyyy-MM-dd")
            : "",
          date_range_end: params.dateRange
            ? format(params.dateRange.end, "yyyy-MM-dd")
            : "",
          sensors: params.sensorIdsList || "",
          sensorDetails: params.getSensorDetails
            ? params.getSensorDetails()
            : [],
        }}
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
        descriptionTranslationKey="dashboard.metrics.entryRateDescription"
        unit="%"
        dateRange={params.dateRange}
        comparison={params.comparisons?.entryRate}
        comparisonPeriod={params.comparisonPeriod}
        data={{
          entry_rate: params.metrics.entryRate,
          date_range_start: params.dateRange
            ? format(params.dateRange.start, "yyyy-MM-dd")
            : "",
          date_range_end: params.dateRange
            ? format(params.dateRange.end, "yyyy-MM-dd")
            : "",
          sensors: params.sensorIdsList || "",
          sensorDetails: params.getSensorDetails
            ? params.getSensorDetails()
            : [],
        }}
      />
    ),
  }),

  // Add new widgets
  createDailyAverageInWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "daily-average-in",
    type: "daily-average-in",
    title: "Daily Average In",
    translationKey: "dashboard.metrics.dailyAverageIn",
    category: "metric",
    component: (
      <SensorDataCard
        title="Daily Average In"
        value={params.metrics.dailyAverageIn.toLocaleString()}
        translationKey="dashboard.metrics.dailyAverageIn"
        descriptionTranslationKey="dashboard.metrics.dailyAverageInDescription"
        unit="people/day"
        dateRange={params.dateRange}
        comparison={params.comparisons?.dailyAverageIn}
        comparisonPeriod={params.comparisonPeriod}
        data={{
          daily_average_in: params.metrics.dailyAverageIn,
          date_range_start: params.dateRange
            ? format(params.dateRange.start, "yyyy-MM-dd")
            : "",
          date_range_end: params.dateRange
            ? format(params.dateRange.end, "yyyy-MM-dd")
            : "",
          sensors: params.sensorIdsList || "",
          sensorDetails: params.getSensorDetails
            ? params.getSensorDetails()
            : [],
        }}
      />
    ),
  }),

  createDailyAverageOutWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "daily-average-out",
    type: "daily-average-out",
    title: "Daily Average Out",
    translationKey: "dashboard.metrics.dailyAverageOut",
    category: "metric",
    component: (
      <SensorDataCard
        title="Daily Average Out"
        value={params.metrics.dailyAverageOut.toLocaleString()}
        translationKey="dashboard.metrics.dailyAverageOut"
        descriptionTranslationKey="dashboard.metrics.dailyAverageOutDescription"
        unit="people/day"
        dateRange={params.dateRange}
        comparison={params.comparisons?.dailyAverageOut}
        comparisonPeriod={params.comparisonPeriod}
        data={{
          daily_average_out: params.metrics.dailyAverageOut,
          date_range_start: params.dateRange
            ? format(params.dateRange.start, "yyyy-MM-dd")
            : "",
          date_range_end: params.dateRange
            ? format(params.dateRange.end, "yyyy-MM-dd")
            : "",
          sensors: params.sensorIdsList || "",
          sensorDetails: params.getSensorDetails
            ? params.getSensorDetails()
            : [],
        }}
      />
    ),
  }),

  createMostCrowdedDayWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "most-crowded-day",
    type: "most-crowded-day",
    title: "Most Crowded Day",
    translationKey: "dashboard.metrics.mostCrowdedDay",
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
          most_crowded_day: params.metrics.mostCrowdedDay
            ? format(params.metrics.mostCrowdedDay.date, "yyyy-MM-dd")
            : "-",
          most_crowded_value: params.metrics.mostCrowdedDay?.value || 0,
          date_range_start: params.dateRange
            ? format(params.dateRange.start, "yyyy-MM-dd")
            : "",
          date_range_end: params.dateRange
            ? format(params.dateRange.end, "yyyy-MM-dd")
            : "",
          sensors: params.sensorIdsList || "",
          sensorDetails: params.getSensorDetails
            ? params.getSensorDetails()
            : [],
        }}
      />
    ),
  }),

  createLeastCrowdedDayWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "least-crowded-day",
    type: "least-crowded-day",
    title: "Least Crowded Day",
    translationKey: "dashboard.metrics.leastCrowdedDay",
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
          least_crowded_day: params.metrics.leastCrowdedDay
            ? format(params.metrics.leastCrowdedDay.date, "yyyy-MM-dd")
            : "-",
          least_crowded_value: params.metrics.leastCrowdedDay?.value || 0,
          date_range_start: params.dateRange
            ? format(params.dateRange.start, "yyyy-MM-dd")
            : "",
          date_range_end: params.dateRange
            ? format(params.dateRange.end, "yyyy-MM-dd")
            : "",
          sensors: params.sensorIdsList || "",
          sensorDetails: params.getSensorDetails
            ? params.getSensorDetails()
            : [],
        }}
      />
    ),
  }),

  createPercentageChangeWidget: (
    params: WidgetFactoryParams,
  ): WidgetConfig => ({
    id: "percentage-change",
    type: "percentage-change",
    title: "Percentage Increase/Decrease",
    translationKey: "dashboard.metrics.percentageChange",
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
          percentage_change: params.metrics.percentageChange,
          date_range_start: params.dateRange
            ? format(params.dateRange.start, "yyyy-MM-dd")
            : "",
          date_range_end: params.dateRange
            ? format(params.dateRange.end, "yyyy-MM-dd")
            : "",
          sensors: params.sensorIdsList || "",
          sensorDetails: params.getSensorDetails
            ? params.getSensorDetails()
            : [],
        }}
      />
    ),
  }),

  // New FootfallCam metrics
  createReturningCustomersWidget: (
    params: WidgetFactoryParams,
  ): WidgetConfig => ({
    id: "returning-customers",
    type: "returning-customers",
    title: "Returning Customers",
    translationKey: "dashboard.metrics.returningCustomers",
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
        comparison={params.comparisons?.returningCustomers}
        comparisonPeriod={params.comparisonPeriod}
        data={{
          returning_customers: params.metrics.returningCustomers,
          date_range_start: params.dateRange
            ? format(params.dateRange.start, "yyyy-MM-dd")
            : "",
          date_range_end: params.dateRange
            ? format(params.dateRange.end, "yyyy-MM-dd")
            : "",
          sensors: params.sensorIdsList || "",
          sensorDetails: params.getSensorDetails
            ? params.getSensorDetails()
            : [],
        }}
      />
    ),
  }),

  createAvgVisitDurationWidget: (
    params: WidgetFactoryParams,
  ): WidgetConfig => ({
    id: "avg-visit-duration",
    type: "avg-visit-duration",
    title: "Average Visit Duration",
    translationKey: "dashboard.metrics.avgVisitDuration",
    category: "metric",
    component: (
      <SensorDataCard
        title="Average Visit Duration"
        value={
          params.metrics.avgVisitDuration > 0
            ? params.metrics.avgVisitDuration.toFixed(2)
            : "N/A"
        }
        translationKey="dashboard.metrics.avgVisitDuration"
        descriptionTranslationKey="dashboard.metrics.avgVisitDurationDescription"
        unit={params.metrics.avgVisitDuration > 0 ? "min" : ""}
        dateRange={params.dateRange}
        comparison={params.comparisons?.avgVisitDuration}
        comparisonPeriod={params.comparisonPeriod}
        data={{
          avg_visit_duration: params.metrics.avgVisitDuration,
          date_range_start: params.dateRange
            ? format(params.dateRange.start, "yyyy-MM-dd")
            : "",
          date_range_end: params.dateRange
            ? format(params.dateRange.end, "yyyy-MM-dd")
            : "",
          sensors: params.sensorIdsList || "",
          sensorDetails: params.getSensorDetails
            ? params.getSensorDetails()
            : [],
        }}
      />
    ),
  }),

  createAffluenceWidget: (params: WidgetFactoryParams): WidgetConfig => ({
    id: "affluence",
    type: "affluence",
    title: "Affluence",
    translationKey: "dashboard.metrics.affluence",
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
        comparison={params.comparisons?.affluence}
        comparisonPeriod={params.comparisonPeriod}
        data={{
          affluence: params.metrics.affluence,
          date_range_start: params.dateRange
            ? format(params.dateRange.start, "yyyy-MM-dd")
            : "",
          date_range_end: params.dateRange
            ? format(params.dateRange.end, "yyyy-MM-dd")
            : "",
          sensors: params.sensorIdsList || "",
          sensorDetails: params.getSensorDetails
            ? params.getSensorDetails()
            : [],
        }}
      />
    ),
  }),
};
