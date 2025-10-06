import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  Spinner,
  Pagination,
} from "@heroui/react";
import { getReports } from "../services/reportsService";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getReports(page)
      .then((res) => {
        setReports(res.data);
        setTotalPages(res.totalPages || 1);
        setError(null);
      })
      .catch(() => setError("Error loading reports"))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Spinner className="mx-auto mt-10" />;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardBody>
        <h2 className="text-xl font-bold mb-4">Reports</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Status/Schedule</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r: any) => (
              <TableRow
                key={r.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/reports/${r.id}`)}
              >
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.title || r.name}</TableCell>
                <TableCell>
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                </TableCell>
                <TableCell>{r.status || r.schedule || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default ReportsPage;
