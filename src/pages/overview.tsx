import { useEffect, useState, useMemo } from "react";
import {
  DashboardFilters,
  PredefinedPeriod,
} from "../components/dashboard/filter";
import { Time } from "@internationalized/date";
import { useSensorData } from "../hooks/useSensorData";
import { useSensorRecords } from "../hooks/useSensorRecords";
import { useGroupLocations } from "../hooks/useGroupLocations";
import { sensorResponse } from "../types/deviceResponse";
import { sensorMetadata } from "../types/sensorMetadata";
import { SensorRecordsFormData } from "../types/sensorRecordsFormData";
import { getFirstFetchedDateRange } from "../utils/dateUtils";
import { useOverviewMetrics } from "../hooks/dashboard/useOverviewMetrics";
import { LoadingState } from "../components/loading/loading-state";
import { useTranslation } from "react-i18next";
import { useComparison } from "../hooks/dashboard/useComparison";
import { DndContext } from "@dnd-kit/core";
import { Button } from "@heroui/react";
import { PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { LayoutSidebar } from "../components/dashboard/layout-dashboard/LayoutSidebar";
import { LayoutRenderer } from "../components/dashboard/layout-dashboard/components";
import { type WidgetConfig } from "../components/dashboard/layout-dashboard/widgets";
import {
  createDragHandlers,
  getPlacedWidgets,
  saveLayoutToLocalStorage,
  loadLayoutFromLocalStorage,
  type DashboardLayoutState,
  type DashboardLayoutActions,
} from "../components/dashboard/layout-dashboard/utils";
import {
  getDefaultOverviewLayout,
  type DashboardLayout,
} from "../components/dashboard/layout-dashboard/layouts";
import { createOverviewWidgetConfig } from "../components/dashboard/layout-overview/widgets/widget-config.tsx";
import { type OverviewWidgetFactoryParams } from "../components/dashboard/layout-overview/widgets/types";
import { type DashboardWidgetType } from "../components/dashboard/layout-dashboard/widgets/types";

export const Overview: React.FC = () => {
  const { t } = useTranslation();
  const GROUP_BY = "day";
  const AGGREGATION_TYPE = "sum";
  const [selectedPeriod, setSelectedPeriod] =
    useState<PredefinedPeriod>("last7Days");

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sensorMap, setSensorMap] = useState<Map<number, string>>(new Map());
  const {
    locations,
    loading: sensorsLoading,
    error: sensorsError,
  } = useSensorData();

  const [sensorRecordsFormData, setSensorRecordsFormData] =
    useState<SensorRecordsFormData>({
      sensorIds: [],
      fetchedDateRange: null,
      dateRange: getFirstFetchedDateRange(),
      hourRange: { start: new Time(0, 0), end: new Time(23, 59) },
      rawData: [],
      groupBy: GROUP_BY,
      aggregationType: AGGREGATION_TYPE,
      needToFetch: true,
    });

  const {
    data: sensorDataByLocation,
    loading: dataLoading,
    error: dataError,
  } = useSensorRecords(sensorRecordsFormData, setSensorRecordsFormData);

  // Group location data for overview metrics
  const sensorData = useGroupLocations(sensorDataByLocation);

  // Comparison hook
  const { isComparisonEnabled, comparisonPeriods, toggleComparison } =
    useComparison(sensorRecordsFormData.dateRange);

  const { metrics, getSensorDetails, sensorIdsList } = useOverviewMetrics(
    sensorData,
    sensorRecordsFormData.dateRange,
    sensorMap,
    locations || [],
    sensorRecordsFormData.sensorIds,
    comparisonPeriods,
  );

  // Layout Dashboard state
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draggedWidget, setDraggedWidget] =
    useState<DashboardWidgetType | null>(null);
  const [widgetPlacements, setWidgetPlacements] = useState<
    Record<string, DashboardWidgetType | null>
  >({});
  const [currentLayout] = useState<DashboardLayout>(getDefaultOverviewLayout());

  const availableWidgets: WidgetConfig[] = useMemo(() => {
    if (!metrics || !sensorRecordsFormData.dateRange.start) return [];

    const params: OverviewWidgetFactoryParams = {
      metrics: metrics.current,
      dateRange: {
        start: sensorRecordsFormData.dateRange.start,
        end: sensorRecordsFormData.dateRange.end || new Date(),
      },
      sensorIdsList,
      getSensorDetails,
      comparisons: metrics.comparisons,
      comparisonPeriod: comparisonPeriods?.previous,
    };

    return createOverviewWidgetConfig(params, t);
  }, [
    metrics,
    sensorRecordsFormData.dateRange,
    sensorIdsList,
    getSensorDetails,
    comparisonPeriods,
    t,
  ]);

  const layoutState: DashboardLayoutState = {
    isEditing,
    isSidebarOpen,
    draggedWidget,
    widgetPlacements,
  };

  const layoutActions: DashboardLayoutActions = {
    setIsEditing,
    setIsSidebarOpen,
    setDraggedWidget,
    setWidgetPlacements,
  };

  const { handleDragStart, handleDragEnd } = createDragHandlers(
    layoutState,
    layoutActions,
  );
  useEffect(() => {
    const savedPlacements = loadLayoutFromLocalStorage(currentLayout.id);
    setWidgetPlacements(savedPlacements || currentLayout.widgetPlacements);
  }, [currentLayout]);

  useEffect(() => {
    setIsSidebarOpen(isEditing);
    if (!isEditing && Object.keys(widgetPlacements).length > 0) {
      saveLayoutToLocalStorage(currentLayout.id, widgetPlacements);
    }
  }, [isEditing, currentLayout.id, widgetPlacements]);

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      dateRange: { start: startDate, end: endDate },
      needToFetch: true,
    }));
  };

  const handlePredefinedPeriodChange = (period: PredefinedPeriod) => {
    setSelectedPeriod(period);
  };

  const handleSensorsChange = (sensors: number[]) => {
    setSensorRecordsFormData((prev: SensorRecordsFormData) => ({
      ...prev,
      sensorIds: sensors,
      needToFetch: true,
    }));
  };

  const handleRefreshData = () => {
    const now = new Date();
    localStorage.setItem("lastUpdated", now.toISOString());
    setLastUpdated(now);
    setSensorRecordsFormData((prev) => ({ ...prev, needToFetch: true }));
  };

  const handleHourRangeChange = (start: Time, end: Time) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      hourRange: { start, end },
      needToFetch: true,
    }));
  };

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
    const storedLastUpdated = localStorage.getItem("lastUpdated");
    if (storedLastUpdated) {
      setLastUpdated(new Date(storedLastUpdated));
    }
  }, []);

  const isLoading = sensorsLoading || dataLoading;
  const hasError = sensorsError || dataError;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "pr-80" : ""
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DashboardFilters
                onDateRangeChange={handleDateRangeChange}
                currentDateRange={sensorRecordsFormData.dateRange}
                onSensorsChange={handleSensorsChange}
                currentSensors={
                  sensorRecordsFormData.sensorIds?.map((id) => id) || []
                }
                hourRange={sensorRecordsFormData.hourRange}
                onHourRangeChange={handleHourRangeChange}
                onRefreshData={handleRefreshData}
                locations={locations}
                lastUpdated={lastUpdated}
                currentPredefinedPeriod={selectedPeriod}
                onPredefinedPeriodChange={handlePredefinedPeriodChange}
                showPredefinedPeriods={true}
                showComparison={true}
                isComparisonEnabled={isComparisonEnabled}
                onComparisonToggle={toggleComparison}
              />
            </div>
            <div className="flex items-center gap-3 ml-4">
              <Button
                variant={isEditing ? "flat" : "solid"}
                color="primary"
                startContent={
                  isEditing ? (
                    <EyeIcon className="w-4 h-4" />
                  ) : (
                    <PencilIcon className="w-4 h-4" />
                  )
                }
                onPress={() => setIsEditing(!isEditing)}
                size="md"
              >
                {isEditing
                  ? t("dashboard.metrics.saveLayout")
                  : t("dashboard.metrics.editLayout")}
              </Button>
            </div>
          </div>

          <LoadingState isLoading={isLoading} hasError={hasError} />

          {!isLoading && !hasError && (
            <LayoutRenderer
              isEditing={isEditing}
              currentLayout={currentLayout}
              widgetPlacements={widgetPlacements}
              availableWidgets={availableWidgets}
              draggedWidget={draggedWidget}
            />
          )}
        </div>

        <LayoutSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isEditMode={isEditing}
          allWidgets={availableWidgets.map((widget) => ({
            id: widget.id,
            type: widget.type,
            title: widget.title,
            category: widget.category,
          }))}
          placedWidgets={getPlacedWidgets(widgetPlacements)}
          draggedWidget={draggedWidget}
        />
      </div>
    </DndContext>
  );
};

export default Overview;
