import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Spinner, Chip } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { getReports } from "../services/reportsService";
import { ReportsResponse, ReportEntry } from "../types/reports";

// Reports List (business requirement version) - shows core report info
export default function ReportsBusinessList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [scheduleSummary, setScheduleSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    setLoading(true);
    getReports()
      .then((res: ReportsResponse) => {
        setReports(res.reports);
        // attempt summary from first report that has schedule
        const withSchedule = res.reports.find((r) => r.schedule);
        if (withSchedule && withSchedule.schedule) {
          const s = withSchedule.schedule;
          const time = `${s.schedule.executionTime.hour.toString().padStart(2, "0")}:${s.schedule.executionTime.minute
            .toString()
            .padStart(2, "0")}`;
          const days = getDayNames(s.schedule.daysOfWeek).join(", ");
          setScheduleSummary(
            `${s.type} @ ${time} (${days}) ${s.enabled ? "" : "[disabled]"}`,
          );
        } else {
          setScheduleSummary(null);
        }
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || t("reports.configs.fetchError"),
        );
      })
      .finally(() => setLoading(false));
  }, [t]);

  const content = useMemo(() => {
    if (loading)
      return (
        <div className="flex justify-center py-10">
          <Spinner label={t("common.loading", "Loading...")} />
        </div>
      );
    if (error)
      return <div className="text-danger-500 text-sm py-4">{error}</div>;
    if (reports.length === 0) {
      return (
        <div className="text-gray-500 py-10 text-center space-y-2">
          <div>{t("reports.configs.empty")}</div>
          <div className="text-xs text-gray-400">
            {t(
              "reports.unified.noLayoutsNoSchedule",
              "Create a layout and configure scheduling to automate report delivery.",
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reports.map((r) => {
          const isScheduleOnly = r.id === "schedule-only";
          const widgetCount = Object.keys(r.widgetPlacements || {}).length;

          return (
            <Card
              key={r.id}
              isPressable
              onPress={() => navigate(`/reports/${r.id}`)}
              className="border border-default-200 hover:border-primary-300 transition-colors shadow-sm hover:shadow-md"
            >
              <CardBody className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-default-900">
                          {isScheduleOnly
                            ? t(
                                "reports.detail.scheduleOnlyTitle",
                                "Schedule Only",
                              )
                            : r.layoutId}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip size="sm" color="default" variant="flat">
                            v{r.version}
                          </Chip>
                          {r.schedule && (
                            <Chip
                              size="sm"
                              color={r.schedule.enabled ? "success" : "warning"}
                              variant="flat"
                            >
                              {r.schedule.enabled
                                ? t("common.active", "Active")
                                : t("common.inactive", "Inactive")}
                            </Chip>
                          )}
                          {!r.schedule && (
                            <Chip size="sm" color="warning" variant="flat">
                              {t(
                                "reports.unified.noScheduleConfigured",
                                "No schedule",
                              )}
                            </Chip>
                          )}
                          {widgetCount > 0 && (
                            <Chip size="sm" color="primary" variant="flat">
                              {widgetCount}{" "}
                              {widgetCount === 1 ? "widget" : "widgets"}
                            </Chip>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Schedule Details */}
                    {r.schedule && (
                      <div className="bg-default-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                            {t(
                              "reports.detail.scheduleDetails",
                              "Schedule Details",
                            )}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-default-600">
                              {t(
                                "reports.detail.executionTime",
                                "Execution Time",
                              )}
                              :
                            </span>
                            <span className="ml-2 font-medium text-default-900">
                              {r.schedule.schedule.executionTime.hour
                                .toString()
                                .padStart(2, "0")}
                              :
                              {r.schedule.schedule.executionTime.minute
                                .toString()
                                .padStart(2, "0")}
                            </span>
                          </div>
                          <div>
                            <span className="text-default-600">
                              {t("reports.detail.timezone", "Timezone")}:
                            </span>
                            <span className="ml-2 font-medium text-default-900">
                              {r.schedule.timezone}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {getDayNames(r.schedule.schedule.daysOfWeek).map(
                            (day, idx) => (
                              <Chip
                                key={idx}
                                size="sm"
                                color="primary"
                                variant="dot"
                              >
                                {day}
                              </Chip>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* Warning for schedule-only */}
                    {isScheduleOnly && (
                      <div className="flex items-start gap-2 p-3 bg-warning-50 border border-warning-200 rounded-lg">
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
                        <p className="text-xs text-warning-800">
                          {t(
                            "reports.unified.scheduleOnly",
                            "You have a schedule but no layout widgets yet.",
                          )}
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-default-500">
                      <span className="font-medium">ID:</span> {r.id} •
                      <span className="font-medium ml-2">
                        {t("reports.configs.lastModified", "Last modified")}:
                      </span>{" "}
                      {new Date(r.lastModified).toLocaleDateString()}{" "}
                      {new Date(r.lastModified).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => navigate(`/reports/${r.id}`)}
                      className="flex-1 md:flex-none"
                    >
                      {t("reports.configs.viewDetails", "View Details")}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    );
  }, [reports, loading, error, navigate, t]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-default-900">
            {t("reports.title", "Reports")}
          </h1>
          <p className="text-default-600 text-sm">
            {t(
              "reports.description",
              "Configure and generate reports for your business.",
            )}
          </p>
          {scheduleSummary && reports.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Chip size="sm" color="success" variant="dot">
                {t("reports.unified.activeSchedule", "Active schedule")}
              </Chip>
              <span className="text-xs text-default-600">
                {scheduleSummary}
              </span>
            </div>
          )}
          {!scheduleSummary && reports.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Chip size="sm" color="warning" variant="dot">
                {t(
                  "reports.unified.noScheduleConfigured",
                  "No schedule configured yet.",
                )}
              </Chip>
            </div>
          )}
        </div>
        <Button
          color="primary"
          size="lg"
          onPress={() => navigate("/reports/create")}
        >
          {t("reports.configs.createCta", "Create Report")}
        </Button>
      </div>
      {content}
    </div>
  );
}
