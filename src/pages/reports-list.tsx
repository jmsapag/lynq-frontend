import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { getReportConfigurations } from "../services/reportsService";
import { adaptLayoutConfigToReport } from "../utils/reportAdapters";
import { Report } from "../types/reports";

// Reports List (business requirement version) - shows core report info
export default function ReportsBusinessList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getReportConfigurations()
      .then((res) => {
        const adapted = res.configurations.map(adaptLayoutConfigToReport);
        setReports(adapted);
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
    if (reports.length === 0)
      return (
        <div className="text-gray-500 py-10 text-center">
          {t("reports.configs.empty")}
        </div>
      );

    return (
      <div className="space-y-3">
        {reports.map((r) => (
          <Card
            key={r.id}
            isPressable
            onPress={() => navigate(`/reports/${r.id}`)}
            className="hover:shadow-sm"
          >
            <CardBody className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold truncate">
                    {r.title || r.name || r.id}
                  </h3>
                  <span className="text-xs bg-gray-100 rounded px-2 py-0.5">
                    {r.variables?.version ? `v${r.variables.version}` : ""}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                  <span>
                    <strong>ID:</strong> {r.id}
                  </span>
                  {r.createdAt && (
                    <span>
                      <strong>{t("common.created", "Created")}:</strong>{" "}
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  )}
                  {(r.status || r.schedule) && (
                    <span>
                      <strong>{t("common.status", "Status")}:</strong>{" "}
                      {r.status || r.schedule}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 self-start md:self-auto">
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onPress={() => navigate(`/reports/${r.id}`)}
                >
                  {t("reports.configs.viewDetails", "View Details")}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }, [reports, loading, error, navigate, t]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("reports.title", "Reports")}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {t(
              "reports.description",
              "Configure and generate reports for your business.",
            )}
          </p>
        </div>
        <Button color="primary" onPress={() => navigate("/reports/create")}>
          {t("reports.configs.createCta", "Create Report")}
        </Button>
      </div>
      {content}
    </div>
  );
}
