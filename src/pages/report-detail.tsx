import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, Spinner, Button, Chip } from "@heroui/react";
import {
  getReportConfigurationById,
  getReports,
} from "../services/reportsService";
import {
  ReportScheduleConfig,
  ReportsResponse,
  ReportEntry,
} from "../types/reports";
import { useTranslation } from "react-i18next";
import { useLocations } from "../hooks/locations/useLocations";

export default function ReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { allLocations } = useLocations();
  const [report, setReport] = useState<ReportEntry | any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [schedule, setSchedule] = useState<ReportScheduleConfig | null>(null);

  const getDayNames = (dayNumbers: number[]) => {
    const dayKeys = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return dayNumbers.map((d) => t(`days.${dayKeys[d]}`));
  };

  const getLocationName = (locationId: number) => {
    const location = allLocations.find((loc) => loc.id === locationId);
    return location ? location.name : `Location ${locationId}`;
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getReportConfigurationById(reportId), // fallback legacy
      getReports().catch(() => null),
    ])
      .then(([legacyLayout, unified]) => {
        let entry: ReportEntry | null = null;
        if (unified && (unified as ReportsResponse).reports) {
          entry =
            (unified as ReportsResponse).reports.find(
              (r) => r.id === reportId || r.layoutId === reportId,
            ) || null;
        }

        if (entry) {
          setReport(entry);
          setSchedule(entry.schedule || null);
        } else if (legacyLayout) {
          setReport(legacyLayout);
        } else {
          setNotFound(true);
        }

        if (!entry && unified && (unified as ReportsResponse).reports.length) {
          const withSchedule = (unified as ReportsResponse).reports.find(
            (r) => r.schedule,
          );
          if (withSchedule?.schedule) setSchedule(withSchedule.schedule);
        }
        setError(null);
      })
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
        else setError("Error loading report");
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) return <Spinner className="mx-auto mt-10" />;
  if (notFound)
    return <div className="text-center mt-10">404 - Report not found</div>;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  // New detail layout for layout configuration
  const isScheduleOnly = report.id === "schedule-only";
  const widgetCount = Object.keys(report.widgetPlacements || {}).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border border-default-200 shadow-sm">
        <CardBody className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold text-default-900">
                  {isScheduleOnly
                    ? t("reports.detail.scheduleOnlyTitle", "Schedule Only")
                    : report.layoutId}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip color="default" variant="flat">
                    v{report.version}
                  </Chip>
                  <Chip color="primary" variant="flat">
                    ID: {report.id}
                  </Chip>
                  {schedule && (
                    <Chip
                      color={schedule.enabled ? "success" : "warning"}
                      variant="flat"
                    >
                      {schedule.enabled
                        ? t("common.active", "Active")
                        : t("common.inactive", "Inactive")}
                    </Chip>
                  )}
                  {widgetCount > 0 && (
                    <Chip color="primary" variant="dot">
                      {widgetCount} {widgetCount === 1 ? "widget" : "widgets"}
                    </Chip>
                  )}
                </div>
              </div>
            </div>

            {isScheduleOnly && (
              <div className="flex items-start gap-2 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <svg
                  className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-warning-800">
                  {t(
                    "reports.detail.scheduleOnlyHint",
                    "You have configured scheduling but no widget layout yet.",
                  )}
                </p>
              </div>
            )}

            <div className="text-sm text-default-600">
              <span className="font-medium">
                {t("reports.configs.lastModified", "Last modified")}:
              </span>{" "}
              {new Date(report.lastModified).toLocaleString()}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Widget Placements */}
      <Card className="border border-default-200 shadow-sm">
        <CardBody className="p-6">
          <h2 className="text-lg font-semibold text-default-900 mb-4">
            {t("reports.detail.widget", "Widget")}{" "}
            {t("common.placements", "Placements")}
          </h2>
          {widgetCount === 0 ? (
            <div className="flex items-center justify-center p-8 bg-default-50 border-2 border-dashed border-default-200 rounded-lg">
              <p className="text-default-500 text-sm">
                {t(
                  "reports.detail.noWidgets",
                  "No widgets assigned in this layout.",
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(report.widgetPlacements || {}).map(
                ([slot, widget]) => (
                  <div
                    key={slot}
                    className="flex items-center justify-between p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Chip size="sm" color="primary" variant="flat">
                        {slot}
                      </Chip>
                      <span className="text-sm font-medium text-default-700">
                        {String(widget)}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Schedule Details */}
      {schedule && (
        <Card className="border border-primary-200 shadow-sm bg-primary-50/30">
          <CardBody className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-default-900">
                  {t("reports.detail.scheduleDetails", "Schedule Details")}
                </h2>
                <Chip color="primary" variant="flat">
                  {schedule.type}
                </Chip>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <p className="text-xs font-semibold text-default-600 uppercase tracking-wide">
                      {t("reports.detail.executionTime", "Execution Time")}
                    </p>
                    <p className="text-2xl font-bold text-default-900">
                      {schedule.schedule.executionTime.hour
                        .toString()
                        .padStart(2, "0")}
                      :
                      {schedule.schedule.executionTime.minute
                        .toString()
                        .padStart(2, "0")}
                    </p>
                    <p className="text-xs text-default-600">
                      {schedule.timezone}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <p className="text-xs font-semibold text-default-600 uppercase tracking-wide">
                      {t("reports.detail.days", "Days")}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {getDayNames(schedule.schedule.daysOfWeek).map(
                        (day, idx) => (
                          <Chip
                            key={idx}
                            color="primary"
                            variant="flat"
                            size="sm"
                          >
                            {day}
                          </Chip>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <p className="text-xs font-semibold text-default-600 uppercase tracking-wide">
                      {t("reports.detail.dataDays", "Data Range Days")}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {getDayNames(schedule.dataFilter.daysOfWeek).map(
                        (day, idx) => (
                          <Chip
                            key={idx}
                            color="secondary"
                            variant="flat"
                            size="sm"
                          >
                            {day}
                          </Chip>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <p className="text-xs font-semibold text-default-600 uppercase tracking-wide">
                      {t("reports.detail.dataTimeRange", "Data Time Range")}
                    </p>
                    <p className="text-lg font-semibold text-default-900">
                      {schedule.dataFilter.timeRange.startHour
                        .toString()
                        .padStart(2, "0")}
                      :
                      {schedule.dataFilter.timeRange.startMinute
                        .toString()
                        .padStart(2, "0")}{" "}
                      -{" "}
                      {schedule.dataFilter.timeRange.endHour
                        .toString()
                        .padStart(2, "0")}
                      :
                      {schedule.dataFilter.timeRange.endMinute
                        .toString()
                        .padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </div>

              {schedule.dataFilter.locationIds.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-xs font-semibold text-default-600 uppercase tracking-wide mb-2">
                    {t("reports.detail.locations", "Locations")}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {schedule.dataFilter.locationIds.map((locId) => (
                      <Chip key={locId} size="sm" variant="flat">
                        {getLocationName(locId)}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {schedule.language && (
                <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-default-600 uppercase tracking-wide">
                    {t("reports.detail.language", "Language")}
                  </span>
                  <Chip color="default" variant="flat">
                    {schedule.language.toUpperCase()}
                  </Chip>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button color="primary" size="lg" onClick={() => navigate(`/reports`)}>
          {t("reports.detail.back", "Back to Reports")}
        </Button>
        <Button
          variant="bordered"
          size="lg"
          onClick={() => navigate(`/reports/create`)}
        >
          {t("reports.detail.createNew", "Create New Report")}
        </Button>
      </div>
    </div>
  );
}
