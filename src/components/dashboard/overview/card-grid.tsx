import React from "react";
import { format } from "date-fns";
import { SensorDataCard } from "../charts/card";
import { useTranslation } from "react-i18next";

interface MetricsCardGridProps {
  metrics: {
    totalIn: number;
    totalOut: number;
    dailyAverageIn: number;
    dailyAverageOut: number;
    mostCrowdedDay: { date: Date; value: number } | null;
    leastCrowdedDay: { date: Date; value: number } | null;
    entryRate: number;
    percentageChange: number;
  };
  dateRange: { start: Date; end: Date };
  sensorIdsList: string;
  getSensorDetails: () => any[];
}

export const MetricsCardGrid: React.FC<MetricsCardGridProps> = ({
  metrics,
  dateRange,
  sensorIdsList,
  getSensorDetails,
}) => {
  useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SensorDataCard
          title="Total In"
          value={metrics.totalIn.toLocaleString()}
          translationKey="dashboard.metrics.totalIn"
          descriptionTranslationKey="dashboard.metrics.totalInDescription"
          unit="people"
          dateRange={dateRange}
          data={{
            total_in: metrics.totalIn,
            date_range_start: format(dateRange.start, "yyyy-MM-dd"),
            date_range_end: format(dateRange.end, "yyyy-MM-dd"),
            sensors: sensorIdsList,
            sensorDetails: getSensorDetails(),
          }}
        />

        <SensorDataCard
          title="Total Out"
          value={metrics.totalOut.toLocaleString()}
          translationKey="dashboard.metrics.totalOut"
          descriptionTranslationKey="dashboard.metrics.totalOutDescription"
          unit="people"
          dateRange={dateRange}
          data={{
            total_out: metrics.totalOut,
            date_range_start: format(dateRange.start, "yyyy-MM-dd"),
            date_range_end: format(dateRange.end, "yyyy-MM-dd"),
            sensors: sensorIdsList,
            sensorDetails: getSensorDetails(),
          }}
        />

        <SensorDataCard
          title="Daily Average In"
          value={metrics.dailyAverageIn.toLocaleString()}
          translationKey="dashboard.metrics.dailyAverageIn"
          descriptionTranslationKey="dashboard.metrics.dailyAverageInDescription"
          unit="people/day"
          dateRange={dateRange}
          data={{
            daily_average_in: metrics.dailyAverageIn,
            date_range_start: format(dateRange.start, "yyyy-MM-dd"),
            date_range_end: format(dateRange.end, "yyyy-MM-dd"),
            sensors: sensorIdsList,
            sensorDetails: getSensorDetails(),
          }}
        />

        <SensorDataCard
          title="Daily Average Out"
          value={metrics.dailyAverageOut.toLocaleString()}
          translationKey="dashboard.metrics.dailyAverageOut"
          descriptionTranslationKey="dashboard.metrics.dailyAverageOutDescription"
          unit="people/day"
          dateRange={dateRange}
          data={{
            daily_average_out: metrics.dailyAverageOut,
            date_range_start: format(dateRange.start, "yyyy-MM-dd"),
            date_range_end: format(dateRange.end, "yyyy-MM-dd"),
            sensors: sensorIdsList,
            sensorDetails: getSensorDetails(),
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SensorDataCard
          title="Most Crowded Day"
          value={
            metrics.mostCrowdedDay
              ? format(metrics.mostCrowdedDay.date, "d MMM")
              : "-"
          }
          translationKey="dashboard.metrics.mostCrowdedDay"
          descriptionTranslationKey="dashboard.metrics.mostCrowdedDayDescription"
          unit={
            metrics.mostCrowdedDay
              ? `(${metrics.mostCrowdedDay.value.toLocaleString()} people)`
              : ""
          }
          dateRange={dateRange}
          data={{
            most_crowded_day: metrics.mostCrowdedDay
              ? format(metrics.mostCrowdedDay.date, "yyyy-MM-dd")
              : "-",
            most_crowded_value: metrics.mostCrowdedDay?.value || 0,
            date_range_start: format(dateRange.start, "yyyy-MM-dd"),
            date_range_end: format(dateRange.end, "yyyy-MM-dd"),
            sensors: sensorIdsList,
            sensorDetails: getSensorDetails(),
          }}
        />

        <SensorDataCard
          title="Least Crowded Day"
          value={
            metrics.leastCrowdedDay
              ? format(metrics.leastCrowdedDay.date, "d MMM")
              : "-"
          }
          translationKey="dashboard.metrics.leastCrowdedDay"
          descriptionTranslationKey="dashboard.metrics.leastCrowdedDayDescription"
          unit={
            metrics.leastCrowdedDay
              ? `(${metrics.leastCrowdedDay.value.toLocaleString()} people)`
              : ""
          }
          dateRange={dateRange}
          data={{
            least_crowded_day: metrics.leastCrowdedDay
              ? format(metrics.leastCrowdedDay.date, "yyyy-MM-dd")
              : "-",
            least_crowded_value: metrics.leastCrowdedDay?.value || 0,
            date_range_start: format(dateRange.start, "yyyy-MM-dd"),
            date_range_end: format(dateRange.end, "yyyy-MM-dd"),
            sensors: sensorIdsList,
            sensorDetails: getSensorDetails(),
          }}
        />

        <SensorDataCard
          title="Entry Rate"
          value={metrics.entryRate}
          translationKey="dashboard.metrics.entryRate"
          descriptionTranslationKey="dashboard.metrics.entryRateDescription"
          unit="%"
          dateRange={dateRange}
          data={{
            entry_rate: metrics.entryRate,
            date_range_start: format(dateRange.start, "yyyy-MM-dd"),
            date_range_end: format(dateRange.end, "yyyy-MM-dd"),
            sensors: sensorIdsList,
            sensorDetails: getSensorDetails(),
          }}
        />

        <SensorDataCard
          title="Percentage Increase/Decrease"
          value={
            (metrics.percentageChange > 0 ? "+" : "") +
            metrics.percentageChange.toLocaleString()
          }
          translationKey="dashboard.metrics.percentageChange"
          descriptionTranslationKey="dashboard.metrics.percentageChangeDescription"
          unit="%"
          dateRange={dateRange}
          data={{
            percentage_change: metrics.percentageChange,
            date_range_start: format(dateRange.start, "yyyy-MM-dd"),
            date_range_end: format(dateRange.end, "yyyy-MM-dd"),
            sensors: sensorIdsList,
            sensorDetails: getSensorDetails(),
          }}
        />
      </div>
    </>
  );
};
