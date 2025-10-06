import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  Spinner,
  Button,
} from "@heroui/react";
import { getReportById } from "../services/reportsService";

export default function ReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    getReportById(reportId)
      .then((res) => {
        if (!res) {
          setNotFound(true);
        } else {
          setReport(res);
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

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardBody>
        <h2 className="text-xl font-bold mb-2">
          {report.title || report.name}
        </h2>
        <div className="mb-2 text-gray-600">ID: {report.id}</div>
        <div className="mb-2">
          Created At:{" "}
          {report.createdAt ? new Date(report.createdAt).toLocaleString() : "-"}
        </div>
        {report.updatedAt && (
          <div className="mb-2">
            Updated At: {new Date(report.updatedAt).toLocaleString()}
          </div>
        )}
        {report.lastRunAt && (
          <div className="mb-2">
            Last Run: {new Date(report.lastRunAt).toLocaleString()}
          </div>
        )}
        <div className="mb-2">
          Status/Schedule: {report.status || report.schedule || "-"}
        </div>
        <h3 className="mt-6 mb-2 font-semibold">Variables</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.variables &&
              Object.entries(report.variables).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{String(value)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Button className="mt-6" onClick={() => navigate("/reports")}>
          Volver
        </Button>
      </CardBody>
    </Card>
  );
}
