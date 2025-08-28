import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSensorData } from "../hooks/useSensorData";
import { useSensorRecords } from "../hooks/useSensorRecords";
import { LoadingState } from "../components/loading/loading-state";
import {
  DashboardFilters,
  PredefinedPeriod,
} from "../components/dashboard/filter";
import { Time } from "@internationalized/date";
import { SensorRecordsFormData } from "../types/sensorRecordsFormData";
import { getFirstFetchedDateRange } from "../utils/dateUtils";
import { sensorResponse } from "../types/deviceResponse";
import { sensorMetadata } from "../types/sensorMetadata";
import { useOverviewMetrics } from "../hooks/dashboard/useOverviewMetrics";
import { useComparison } from "../hooks/dashboard/useComparison";
import { DndContext } from "@dnd-kit/core";
import { Button } from "@heroui/react";
import { PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { LayoutSidebar } from "../components/dashboard/layout-dashboard/LayoutSidebar";
import { LayoutRenderer, LayoutSelector } from "../components/dashboard/layout-dashboard/components";
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
  AVAILABLE_LAYOUTS,
  getDefaultLayout,
  type DashboardLayout,
} from "../components/dashboard/layout-dashboard/layouts";
import {
  createWidgetConfig,
  type DashboardWidgetType,
  type WidgetFactoryParams,
} from "../components/dashboard/layout-dashboard/widgets";
import { createOverviewWidgetConfig } from "../components/dashboard/layout-overview/widgets/widget-config.tsx";
import { type OverviewWidgetFactoryParams } from "../components/dashboard/layout-overview/widgets/types";

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const GROUP_BY = "day";
  const AGGREGATION_TYPE = "sum";
  const [selectedPeriod, setSelectedPeriod] =
    useState<PredefinedPeriod>("last7Days");

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
    data: sensorData,
    loading: dataLoading,
    error: dataError,
  } = useSensorRecords(sensorRecordsFormData, setSensorRecordsFormData);

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
  const [currentLayout, setCurrentLayout] =
    useState<DashboardLayout>(getDefaultLayout());

  // Prepare chart data from sensor data
  const chartData = useMemo(() => {
    if (
      !sensorData ||
      !sensorData.timestamps ||
      sensorData.timestamps.length === 0
    ) {
      return {
        categories: [],
        values: [],
      };
    }

    return {
      categories: sensorData.timestamps,
      values: sensorData.in.map((value, index) => ({
        in: value,
        out: sensorData.out[index],
      })),
    };
  }, [sensorData]);

  // Create widget configurations - combining both overview and dashboard widgets
  const availableWidgets: WidgetConfig[] = useMemo(() => {
    if (!metrics || !sensorRecordsFormData.dateRange.start) return [];

    try {
      // Overview widget parameters
      const overviewParams: OverviewWidgetFactoryParams = {
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

      // Dashboard widget parameters
      const dashboardParams: WidgetFactoryParams = {
        metrics: metrics.current,
        chartData,
        sensorData,
        sensorRecordsFormData,
        dateRange: sensorRecordsFormData.dateRange,
        sensorIdsList,
        getSensorDetails,
        comparisons: metrics.comparisons,
        comparisonPeriod: comparisonPeriods?.previous,
      };

      // Get overview widgets (metrics)
      const overviewWidgets = createOverviewWidgetConfig(overviewParams, t);

      // Get dashboard widgets (charts and additional metrics)
      const dashboardWidgets = createWidgetConfig(dashboardParams);

      // Combine both sets, avoiding duplicates
      const allWidgets = [...overviewWidgets, ...dashboardWidgets];
      
      // Remove duplicates based on widget ID
      const uniqueWidgets = allWidgets.filter((widget, index, self) => 
        index === self.findIndex(w => w.id === widget.id)
      );

      return uniqueWidgets;
    } catch (error) {
      console.error("Error creating widgets:", error);
      return [];
    }
  }, [
    metrics,
    sensorRecordsFormData.dateRange,
    sensorIdsList,
    getSensorDetails,
    comparisonPeriods,
    chartData,
    sensorData,
    sensorRecordsFormData,
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

  // Handle layout changes
  const handleLayoutChange = (newLayout: DashboardLayout) => {
    // Save current layout changes if any exist
    if (Object.keys(widgetPlacements).length > 0) {
      saveLayoutToLocalStorage(currentLayout.id, widgetPlacements);
    }

    // Load the new layout
    let newPlacements = newLayout.widgetPlacements;

    // Try to load saved placements for this layout
    const savedPlacements = loadLayoutFromLocalStorage(newLayout.id);
    if (savedPlacements) {
      newPlacements = savedPlacements;
    }

    setCurrentLayout(newLayout);
    setWidgetPlacements(newPlacements);
  };

  // Initialize widget placements with current layout
  useEffect(() => {
    if (Object.keys(widgetPlacements).length === 0) {
      let initialPlacements = currentLayout.widgetPlacements;

      // Try to load saved placements for this layout
      const savedPlacements = loadLayoutFromLocalStorage(currentLayout.id);
      if (savedPlacements) {
        initialPlacements = savedPlacements;
      }

      setWidgetPlacements(initialPlacements);
    }
  }, [currentLayout, widgetPlacements]);

  // Toggle sidebar when entering/exiting edit mode and save changes
  useEffect(() => {
    setIsSidebarOpen(isEditing);

    // Save changes when exiting edit mode
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

  const handleHourRangeChange = (start: Time, end: Time) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      hourRange: { start, end },
      needToFetch: true,
    }));
  };

  // Auto-select all sensors when locations are loaded
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

  // Create sensor map
  useEffect(() => {
    const newSensorMap = new Map<number, string>();
    locations?.forEach((location: sensorResponse) => {
      location.sensors.forEach((sensor: sensorMetadata) => {
        newSensorMap.set(sensor.id, sensor.position);
      });
    });
    setSensorMap(newSensorMap);
  }, [locations]);

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
                locations={locations}
                currentPredefinedPeriod={selectedPeriod}
                onPredefinedPeriodChange={handlePredefinedPeriodChange}
                showPredefinedPeriods={true}
                showComparison={true}
                isComparisonEnabled={isComparisonEnabled}
                onComparisonToggle={toggleComparison}
              />
            </div>
            <div className="flex items-center gap-3 ml-4">
              {/* Layout Selector */}
              <LayoutSelector
                currentLayout={currentLayout}
                onLayoutChange={handleLayoutChange}
                availableLayouts={AVAILABLE_LAYOUTS}
              />

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

export default Home;
