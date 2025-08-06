import { Spinner, Button } from "@heroui/react";
import { DashboardFilters } from "../components/dashboard/filter.tsx";
import { useEffect, useState, useMemo } from "react";
import { useSensorData } from "../hooks/useSensorData.ts";
import { useSensorRecords } from "../hooks/useSensorRecords.ts";
import { sensorResponse } from "../types/deviceResponse";
import { sensorMetadata } from "../types/sensorMetadata";
import {
  GroupByTimeAmount,
  // AggregationType, // Commented out since aggregation filter is hidden
} from "../types/sensorDataResponse";
import { SensorRecordsFormData } from "../types/sensorRecordsFormData";
import { Time } from "@internationalized/date";

// Layout Dashboard imports
import { DndContext } from "@dnd-kit/core";
import { PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { LayoutSidebar } from "../components/dashboard/layout-dashboard/LayoutSidebar";
import { LayoutRenderer, LayoutSelector } from "../components/dashboard/layout-dashboard/components";
import { createWidgetConfig, type WidgetConfig, type DashboardWidgetType, type WidgetFactoryParams } from "../components/dashboard/layout-dashboard/widgets";
import { 
  createDragHandlers, 
  getPlacedWidgets, 
  saveLayoutToLocalStorage,
  loadLayoutFromLocalStorage,
  type DashboardLayoutState,
  type DashboardLayoutActions 
} from "../components/dashboard/layout-dashboard/utils";
import { AVAILABLE_LAYOUTS, getDefaultLayout, type DashboardLayout } from "../components/dashboard/layout-dashboard/layouts";

function getFirstFetchedDateRange() {
  return {
    start: new Date(new Date().setDate(new Date().getDate() - 14)), // 14 days ago
    end: new Date(), // today
  };
}

const Dashboard = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sensorMap, setSensorMap] = useState<Map<number, string>>(new Map());
  
  // Layout Dashboard state
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<DashboardWidgetType | null>(null);
  const [widgetPlacements, setWidgetPlacements] = useState<Record<string, DashboardWidgetType | null>>({});
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>(getDefaultLayout());
  
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
      groupBy: "day",
      aggregationType: "sum",
      needToFetch: true,
    });

  // Use the sensor records hook
  const {
    data: sensorData,
    loading: dataLoading,
    error: dataError,
  } = useSensorRecords(sensorRecordsFormData, setSensorRecordsFormData);

  const metrics = useMemo(() => {
    if (!sensorData || !sensorData.in || !sensorData.out) {
      return {
        totalIn: 0,
        totalOut: 0,
        entryRate: 0,
      };
    }

    const totalIn = sensorData.in.reduce((sum, value) => sum + value, 0);
    const totalOut = sensorData.out.reduce((sum, value) => sum + value, 0);

    const totalMovements = totalIn + totalOut;

    const entryRate =
      totalMovements > 0 ? Math.round((totalIn / totalMovements) * 100) : 0;

    return { totalIn, totalOut, entryRate };
  }, [sensorData]);

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      dateRange: { start: startDate, end: endDate },
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
          .filter((id): id is number => id !== null), // Filter out null values
      };
    });
  };
  useEffect(() => {}, [sensorRecordsFormData]);

  useEffect(() => {
    const newSensorMap = new Map<number, string>();
    locations?.forEach((location: sensorResponse) => {
      location.sensors.forEach((sensor: sensorMetadata) => {
        newSensorMap.set(sensor.id, sensor.position);
      });
    });
    setSensorMap(newSensorMap);
  }, [locations]);

  // Aggregation handler - commented out since aggregation filter is hidden
  // const handleAggregationChange = (aggregation: string) => {
  //   setSensorRecordsFormData((prev) => ({
  //     ...prev,
  //     aggregationType: aggregation as AggregationType,
  //   }));
  // };

  const handleGroupByChange = (groupByValue: string) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      groupBy: groupByValue as GroupByTimeAmount,
    }));
  };

  const handleRefreshData = () => {
    const now = new Date();
    localStorage.setItem("lastUpdated", now.toISOString());
    setLastUpdated(now);

    setSensorRecordsFormData((prev) => ({
      ...prev,
      dateRange: {
        start: prev.dateRange.start,
        end: new Date(), // today
      },
    }));
  };

  const handleHourRangeChange = (start: Time, end: Time) => {
    setSensorRecordsFormData((prev) => ({
      ...prev,
      hourRange: { start, end },
    }));
  };

  useEffect(() => {
    const storedLastUpdated = localStorage.getItem("lastUpdated");
    if (storedLastUpdated) {
      setLastUpdated(new Date(storedLastUpdated));
    }
  }, []);

  // Listen for groupBy changes from the filter component
  useEffect(() => {
    const handleGroupByChangeFromFilter = (e: CustomEvent) => {
      if (e.detail && e.detail.groupBy) {
        handleGroupByChange(e.detail.groupBy);
      }
    };

    window.addEventListener(
      "groupByChange",
      handleGroupByChangeFromFilter as EventListener,
    );
    return () => {
      window.removeEventListener(
        "groupByChange",
        handleGroupByChangeFromFilter as EventListener,
      );
    };
  }, []);

  // Handle loading states
  const isLoading = sensorsLoading || dataLoading;
  const hasError = sensorsError || dataError;

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

  // Create widget configurations using the factory
  const availableWidgets: WidgetConfig[] = useMemo(() => {
    const params: WidgetFactoryParams = {
      metrics,
      chartData,
      sensorData,
      sensorRecordsFormData,
    };
    return createWidgetConfig(params);
  }, [metrics, chartData, sensorData, sensorRecordsFormData]);

  // Dashboard layout state and actions
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

  // Create drag handlers using the utility function
  const { handleDragStart, handleDragEnd } = createDragHandlers(layoutState, layoutActions);

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

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`min-h-screen  transition-all duration-300 ${
        isSidebarOpen ? 'pr-80' : ''
      }`}>
        {/* Main Content Area */}
        <div className="p-6 space-y-6">
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
              />
            </div>
            
            {/* Edit Mode Toggle */}
            <div className="flex items-center gap-3 ml-4">
              {/* Layout Selector */}
              <LayoutSelector
                currentLayout={currentLayout}
                onLayoutChange={handleLayoutChange}
                availableLayouts={AVAILABLE_LAYOUTS}
                isEditing={isEditing}
              />
              
              <Button
                variant={isEditing ? "flat" : "solid"}
                color="primary"
                startContent={isEditing ? <EyeIcon className="w-4 h-4" /> : <PencilIcon className="w-4 h-4" />}
                onPress={() => setIsEditing(!isEditing)}
                size="sm"
              >
                {isEditing ? "View Mode" : "Edit Layout"}
              </Button>
            </div>
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
            <LayoutRenderer
              isEditing={isEditing}
              currentLayout={currentLayout}
              widgetPlacements={widgetPlacements}
              availableWidgets={availableWidgets}
              draggedWidget={draggedWidget}
            />
          )}
        </div>

        {/* Layout Sidebar */}
        <LayoutSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isEditMode={isEditing}
          allWidgets={availableWidgets.map(widget => ({
            id: widget.id,
            type: widget.type,
            title: widget.title,
            category: widget.category
          }))}
          placedWidgets={getPlacedWidgets(widgetPlacements)}
          draggedWidget={draggedWidget}
        />
      </div>
    </DndContext>
  );
};

export default Dashboard;
