import { Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import ReportConfigModal from "../components/reports/ReportsConfigModal.tsx";
import { useReportConfig } from "../hooks/reports/useReportsConfigs.ts";
import { ReportDragDropInterface } from "../components/reports/ReportDragDropInterface";
import { Time } from "@internationalized/date";

const ReportsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isModalOpen, openModal, closeModal, saveConfig, isLoading } =
    useReportConfig();

  // Mock data for the drag & drop interface
  const mockMetrics = {
    totalIn: 1250,
    totalOut: 1180,
    dailyAverageIn: 178.6,
    dailyAverageOut: 168.6,
    mostCrowdedDay: { date: new Date(), value: 250 },
    leastCrowdedDay: { date: new Date(), value: 95 },
    entryRate: 5.6,
    percentageChange: 12.5,
    returningCustomers: 85,
    avgVisitDuration: 45.2,
    affluence: 78,
  };

  const mockChartData = {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [
      { in: 120, out: 110 },
      { in: 150, out: 140 },
      { in: 180, out: 170 },
      { in: 200, out: 190 },
      { in: 250, out: 240 },
      { in: 220, out: 210 },
      { in: 130, out: 120 },
    ],
  };

  // Mock sensor records form data with proper structure
  const mockSensorRecordsFormData = {
    sensorIds: [1, 2, 3],
    fetchedDateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    hourRange: {
      start: new Time(0, 0),
      end: new Time(23, 59),
    },
    rawData: [],
    groupBy: "hour" as const,
    aggregationType: "sum" as const,
    needToFetch: false,
  };

  // Handle saving report configuration
  const handleSaveConfiguration = (reportConfig: any, layoutConfig: any) => {
    console.log("Report configuration saved:", {
      reportConfig,
      layoutConfig,
      note: "Configuration now includes complete widget placements per layout",
      example:
        "The saved structure now looks like: { default: { metric-1: 'total-in', metric-2: 'total-out', chart-1: 'people-flow-chart' }, 'metrics-grid': { metric-1: 'entry-rate', ... }, ... }",
    });

    // The system now automatically handles:
    // 1. Saving complete layout configurations (report config + widget placements) to API
    // 2. Auto-loading configurations when layouts are selected
    // 3. Falling back to localStorage if API fails
    // 4. No need for "Load Saved" button - configurations auto-load

    // Each layout type maintains its own widget placement configuration
    // When user switches layouts, their saved widget arrangements are automatically restored
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button
            color="primary"
            onPress={() => navigate("/reports")}
            className="mb-2"
          >
            ← {t("reports.detail.back", "Back to Reports")}
          </Button>
          <p className="text-gray-600 mt-1">
            {t("reports.dragDropDescription")}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button onPress={openModal} color="primary">
            {t("reports.configure")}
          </Button>
        </div>
      </div>

      <div className="h-[calc(100vh-200px)]">
        <ReportDragDropInterface
          metrics={mockMetrics}
          chartData={mockChartData}
          sensorRecordsFormData={mockSensorRecordsFormData}
          dateRange={{
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date(),
          }}
          sensorIdsList="1,2,3"
          onSaveConfiguration={handleSaveConfiguration}
        />
      </div>

      <ReportConfigModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={saveConfig}
        isLoading={isLoading}
      />
    </>
  );
};

export default ReportsPage;
