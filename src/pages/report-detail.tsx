import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, Spinner, Button, Chip } from "@heroui/react";
import {
  getReportConfigurationById,
  getUnifiedReports,
} from "../services/reportsService";
import { ReportScheduleConfig } from "../types/reports";

export default function ReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [schedule, setSchedule] = useState<ReportScheduleConfig | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getReportConfigurationById(reportId),
      getUnifiedReports().catch(() => null),
    ])
      .then(([layoutRes, unified]) => {
        if (!layoutRes) {
          setNotFound(true);
        } else {
          setReport(layoutRes);
        }
        if (unified && unified.schedule) {
          setSchedule(unified.schedule);
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
  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <CardBody className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Layout: {report.layoutId}</h2>
          <div className="text-gray-500 text-sm">
            Version: <Chip size="sm">v{report.version}</Chip>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Metadata</h3>
            <ul className="text-sm space-y-1">
              <li>
                <span className="font-medium">Last Modified:</span>{" "}
                {new Date(report.lastModified).toLocaleString()}
              </li>
              <li>
                <span className="font-medium">Widgets:</span>{" "}
                {Object.keys(report.widgetPlacements || {}).length}
              </li>
              {schedule && (
                <li className="mt-2">
                  <span className="font-medium">Schedule Type:</span>{" "}
                  {schedule.type}
                </li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Widget Placements</h3>
            <div className="border rounded-md p-3 max-h-64 overflow-auto bg-gray-50 text-xs">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-1 pr-4">Slot</th>
                    <th className="py-1">Widget</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.widgetPlacements || {}).map(
                    ([slot, widget]) => (
                      <tr key={slot} className="border-t border-gray-200">
                        <td className="py-1 pr-4 font-medium">{slot}</td>
                        <td className="py-1">{String(widget)}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {schedule && (
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="font-semibold mb-2 text-sm">Schedule Details</h3>
            <div className="text-xs space-y-1">
              <div>
                <span className="font-medium">Timezone:</span>{" "}
                {schedule.timezone}
              </div>
              <div>
                <span className="font-medium">Execution Time:</span>{" "}
                {schedule.schedule.executionTime.hour
                  .toString()
                  .padStart(2, "0")}
                :
                {schedule.schedule.executionTime.minute
                  .toString()
                  .padStart(2, "0")}
              </div>
              <div>
                <span className="font-medium">Days:</span>{" "}
                {schedule.schedule.daysOfWeek.join(", ")}
              </div>
              <div>
                <span className="font-medium">Data Range Days:</span>{" "}
                {schedule.dataFilter.daysOfWeek.join(", ")}
              </div>
              <div>
                <span className="font-medium">Data Time Range:</span>{" "}
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
              </div>
              <div>
                <span className="font-medium">Locations:</span>{" "}
                {schedule.dataFilter.locationIds.length > 0
                  ? schedule.dataFilter.locationIds.join(", ")
                  : "(none)"}
              </div>
              <div>
                <span className="font-medium">Enabled:</span>{" "}
                {schedule.enabled ? "Yes" : "No"}
              </div>
              {schedule.language && (
                <div>
                  <span className="font-medium">Language:</span>{" "}
                  {schedule.language}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button color="primary" onClick={() => navigate(`/reports`)}>
            Back to Reports
          </Button>
          <Button variant="flat" onClick={() => navigate(`/reports/create`)}>
            Create New Report
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
