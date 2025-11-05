import { useEffect, useState } from "react";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { getUnifiedReports } from "../services/reportsService.ts";
import {
  ReportLayoutConfiguration,
  UnifiedReportsResponse,
} from "../types/reports.ts";

const ReportConfigsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<UnifiedReportsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getUnifiedReports()
      .then((res: UnifiedReportsResponse) => {
        if (isMounted) setData(res);
      })
      .catch((e: any) => {
        if (isMounted)
          setError(
            e?.response?.data?.message || t("reports.configs.fetchError"),
          );
      })
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [t]);

  const handleView = (config: ReportLayoutConfiguration) => {
    navigate(`/reports/${config.layoutId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("reports.configs.title", "Report Configurations")}
          </h1>
          <p className="text-gray-600">
            {t(
              "reports.configs.subtitle",
              "Browse, inspect and manage your saved report layouts.",
            )}
          </p>
        </div>
        <Button as={Link} to="/reports/create" color="primary">
          {t("reports.configs.createCta", "Create Report")}
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <Spinner label={t("common.loading", "Loading...")} />
        </div>
      )}

      {!loading && error && <div className="text-danger-500">{error}</div>}

      {!loading && !error && data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.layouts.map((cfg: ReportLayoutConfiguration) => (
            <Card
              key={cfg.layoutId}
              isPressable
              onPress={() => handleView(cfg)}
              className="hover:shadow-md transition-shadow"
            >
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{cfg.layoutId}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    v{cfg.version}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {t("reports.configs.widgets", "Widgets")}:{" "}
                  {Object.keys(cfg.widgetPlacements).length}
                </div>
                <div className="text-xs text-gray-400">
                  {t("reports.configs.lastModified", "Last modified")}:{" "}
                  {new Date(cfg.lastModified).toLocaleString()}
                </div>
                <div>
                  <span className="text-primary-600 text-sm underline">
                    {t("reports.configs.viewDetails", "View Details")}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
          {data.layouts.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              {t(
                "reports.configs.empty",
                "No configurations found. Create your first report.",
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportConfigsPage;
