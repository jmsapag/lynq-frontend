import { Spinner, Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Time } from "@internationalized/date";

import ReportConfigModal from "../components/reports/ReportsConfigModal.tsx";
import { useReportConfig } from "../hooks/reports/useReportsConfigs.ts";
import { ReportDragDropInterface } from "../components/reports/ReportDragDropInterface";
import {
  DashboardFilters,
  PredefinedPeriod,
} from "../components/dashboard/filter";
import { useSensorData } from "../hooks/useSensorData";
import { useSensorRecords } from "../hooks/useSensorRecords";
import { useGroupLocations } from "../hooks/useGroupLocations";
import { useOverviewMetrics } from "../hooks/dashboard/useOverviewMetrics";
import { sensorResponse } from "../types/deviceResponse";
import { sensorMetadata } from "../types/sensorMetadata";
import { GroupByTimeAmount } from "../types/sensorDataResponse";
import { SensorRecordsFormData } from "../types/sensorRecordsFormData";

function getInitialDateRange() {
  return {
    start: new Date(new Date().setDate(new Date().getDate() - 14)),
    end: new Date(),
  };
}

const ReportsPage = () => {
  const { t } = useTranslation();
  const {
    isModalOpen,
    openModal,
    closeModal,
    saveConfig,
    isLoading: isConfigLoading,
  } = useReportConfig();

  const [sensorMap, setSensorMap] = useState<Map<number, string>>(new Map());
  const [selectedPeriod, setSelectedPeriod] =
    useState<PredefinedPeriod>("last7Days");

  const {
    locations,
    loading: sensorsLoading,
    error: sensorsError,
  } = useSensorData();

  const [sensorRecordsFormData, setSensorRecordsFormData] =
    useState<SensorRecordsFormData>({
      sensorIds: [],
      fetchedDateRange: null,
      dateRange: getInitialDateRange(),
      hourRange: { start: new Time(0, 0), end: new Time(23, 59) },
      rawData: [],
      groupBy: "day",
      aggregationType: "sum",
      needToFetch: true,
    });

  const {
    data: sensorDataByLocation,
    loading: dataLoading,
    error: dataError,
  } = useSensorRecords(sensorRecordsFormData, setSensorRecordsFormData);

  const sensorData = useGroupLocations(sensorDataByLocation);

  const { metrics, getSensorDetails, sensorIdsList } = useOverviewMetrics(
    sensorData,
    sensorRecordsFormData.dateRange,
    sensorMap,
    locations || [],
    sensorRecordsFormData.sensorIds,
    undefined,
  );

  useEffect(() => {
    const newSensorMap = new Map<number, string>();
    locations?.forEach((location: sensorResponse) => {
      location.sensors.forEach((sensor: sensorMetadata) => {
        newSensorMap.set(sensor.id, sensor.position);
      });
    });
    setSensorMap(newSensorMap);
  }, [locations]);

  useEffect(() => {
    if (locations && locations.length > 0) {
      const allSensorIds = locations.flatMap((location) =>
        location.sensors.map((sensor) => sensor.id),
      );
      setSensorRecordsFormData((prev) => ({
        ...prev,
        sensorIds: allSensorIds,
        needToFetch: true,
      }));
    }
  }, [locations]);

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      dateRange: { start: startDate, end: endDate },
      needToFetch: true,
    }));
  };

  const handleSensorsChange = (sensors: number[]) => {
    setSensorRecordsFormData((prev: SensorRecordsFormData) => {
      return {
        ...prev,
        sensorIds: sensors
          .map((sensor) => {
            const sensorEntry = Array.from(sensorMap.entries()).find(
              ([id]) => id === sensor,
            );
            return sensorEntry ? sensorEntry[0] : null;
          })
          .filter((id): id is number => id !== null),
      };
    });
  };

  const handlePredefinedPeriodChange = (period: PredefinedPeriod) => {
    setSelectedPeriod(period);
  };

  const chartData = useMemo(() => {
    if (
      !sensorData ||
      !sensorData.timestamps ||
      sensorData.timestamps.length === 0
    ) {
      return { categories: [], values: [] };
    }
    return {
      categories: sensorData.timestamps,
      values: sensorData.in.map((value, index) => ({
        in: value,
        out: sensorData.out[index],
      })),
    };
  }, [sensorData]);

  const isLoading = sensorsLoading || dataLoading;
  const hasError = sensorsError || dataError;

  const handleSaveConfiguration = (reportConfig: any, layoutConfig: any) => {
    console.log("Report configuration saved:", {
      reportConfig,
      layoutConfig,
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
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

      <div className="mb-4">
        <DashboardFilters
          onDateRangeChange={handleDateRangeChange}
          currentDateRange={sensorRecordsFormData.dateRange}
          onSensorsChange={handleSensorsChange}
          currentSensors={
            sensorRecordsFormData.sensorIds?.map((id) => id) || []
          }
          hourRange={sensorRecordsFormData.hourRange}
          onHourRangeChange={(start, end) =>
            setSensorRecordsFormData((prev) => ({
              ...prev,
              hourRange: { start, end },
            }))
          }
          locations={locations}
          showPredefinedPeriods={true}
          currentPredefinedPeriod={selectedPeriod}
          onPredefinedPeriodChange={handlePredefinedPeriodChange}
          showComparison={false}
          isComparisonEnabled={false}
          onComparisonToggle={() => {}}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : hasError ? (
        <div className="flex items-center justify-center h-64 text-red-500">
          Error loading data. Please try again.
        </div>
      ) : (
        <div className="h-[calc(100vh-260px)]">
          <ReportDragDropInterface
            metrics={metrics.current}
            chartData={chartData}
            sensorData={sensorData}
            sensorRecordsFormData={sensorRecordsFormData}
            dateRange={sensorRecordsFormData.dateRange}
            sensorIdsList={sensorIdsList}
            getSensorDetails={getSensorDetails}
            onSaveConfiguration={handleSaveConfiguration}
          />
        </div>
      )}

      <ReportConfigModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={saveConfig}
        isLoading={isConfigLoading}
      />
    </>
  );
};

export default ReportsPage;
