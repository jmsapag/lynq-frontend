import React, { useMemo } from "react";
import { DndContext } from "@dnd-kit/core";
import { Button, Switch, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, addToast } from "@heroui/react";
import { PencilIcon, EyeIcon, Squares2X2Icon, ChevronDownIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";

import { useReportLayout } from "../../hooks/reports/useReportLayout";
import { ReportSidebar } from "./ReportSidebar";
import { ReportLayoutRenderer } from "./ReportLayoutRenderer";
import { createReportWidgets, getReportWidgetMeta } from "./reportWidgetFactory";
import { ReportConfig } from "../../types/reports";
import { ReportLayoutService } from "../../services/reportLayoutService";
import { type WidgetFactoryParams } from "../dashboard/layout-dashboard/widgets";
import { GroupByTimeAmount, AggregationType } from "../../types/sensorDataResponse";
import { Time } from "@internationalized/date";

interface ReportDragDropInterfaceProps {
  // Data for creating widgets
  metrics?: {
    totalIn: number;
    totalOut: number;
    dailyAverageIn: number;
    dailyAverageOut: number;
    mostCrowdedDay: { date: Date; value: number } | null;
    leastCrowdedDay: { date: Date; value: number } | null;
    entryRate: number;
    percentageChange: number;
    returningCustomers: number;
    avgVisitDuration: number;
    affluence: number;
  };
  chartData?: {
    categories: string[];
    values: Array<{ in: number; out: number }>;
  };
  sensorData?: any;
  sensorRecordsFormData?: any;
  dateRange?: { start: Date; end: Date };
  sensorIdsList?: string;
  getSensorDetails?: () => any[];
  
  // Report configuration
  onSaveConfiguration?: (reportConfig: ReportConfig, layoutConfig: any) => void;
}

export const ReportDragDropInterface: React.FC<ReportDragDropInterfaceProps> = ({
  metrics,
  chartData,
  sensorData,
  sensorRecordsFormData,
  dateRange,
  sensorIdsList,
  getSensorDetails,
  onSaveConfiguration,
}) => {
  const {
    currentLayout,
    availableLayouts,
    setCurrentLayout,
    widgetPlacements,
    draggedWidget,
    isEditMode,
    isSidebarOpen,
    setIsEditMode,
    setIsSidebarOpen,
    handleDragStart,
    handleDragEnd,
    createCustomLayout,
    getPlacedWidgets,
  } = useReportLayout();

  // Create widget factory params
  const widgetParams: WidgetFactoryParams | null = useMemo(() => {
    if (!metrics || !chartData) return null;
    
    // Provide default sensorRecordsFormData structure if not provided
    const defaultSensorRecordsFormData = {
      sensorIds: [],
      fetchedDateRange: dateRange || null,
      dateRange: dateRange || { start: new Date(), end: new Date() },
      hourRange: { 
        start: new Time(0, 0), 
        end: new Time(23, 59) 
      },
      rawData: [],
      groupBy: "hour" as GroupByTimeAmount,
      aggregationType: "sum" as AggregationType,
      needToFetch: false,
    };
    
    return {
      metrics,
      chartData,
      sensorData: sensorData || [],
      sensorRecordsFormData: sensorRecordsFormData || defaultSensorRecordsFormData,
      dateRange,
      sensorIdsList,
      getSensorDetails,
    };
  }, [metrics, chartData, sensorData, sensorRecordsFormData, dateRange, sensorIdsList, getSensorDetails]);

  // Create available widgets for dragging
  const availableWidgets = useMemo(() => {
    if (!widgetParams) {
      // Return metadata-only widgets for UI purposes
      return getReportWidgetMeta().map(meta => ({
        id: meta.id,
        type: meta.type,
        title: meta.title,
        category: meta.category,
        component: (
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">No data available</p>
          </div>
        ),
      }));
    }
    
    return createReportWidgets(widgetParams);
  }, [widgetParams]);

  // Handle layout change
  const handleLayoutChange = (layoutId: string) => {
    setCurrentLayout(layoutId);
  };

  // Handle creating custom layout
  const handleCreateCustomLayout = () => {
    const name = prompt("Enter layout name:");
    if (name) {
      const description = prompt("Enter layout description:") || "";
      createCustomLayout(name, description);
    }
  };

  // Handle save configuration
  const handleSaveConfiguration = async () => {
    if (!currentLayout) return;
    
    const placedWidgetsCount = Object.values(widgetPlacements).filter(Boolean).length;
    
    if (placedWidgetsCount === 0) {
      addToast({
        title: "No Widgets Placed",
        description: "Please place at least one widget before saving the configuration.",
        severity: "warning",
      });
      return;
    }
    
    // Create a basic report config (this could be enhanced with more options)
    const reportConfig: ReportConfig = {
      type: "weekly",
      enabled: true,
      timezone: "America/New_York",
      layoutId: currentLayout.id, // Include the layout ID
      dataFilter: {
        locationIds: [],
        daysOfWeek: [1, 2, 3, 4, 5],
        timeRange: { startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
      },
      schedule: {
        daysOfWeek: [1],
        executionTime: { hour: 8, minute: 0 },
      },
    };

    // Save using the API with localStorage fallback
    const reportLayoutService = ReportLayoutService.getInstance();
    try {
      await reportLayoutService.saveLayoutPlacements(currentLayout.id, widgetPlacements);
    } catch (error) {
      console.error('Failed to save layout placements via API:', error);
      // Error handling is done within the service method
    }

    
    if (onSaveConfiguration) {
      onSaveConfiguration(reportConfig, {
        layout: currentLayout,
        widgetPlacements,
      });
    }
  };

  if (!currentLayout) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No report layout selected</p>
          <Button onClick={() => setCurrentLayout(availableLayouts[0]?.id)}>
            Load Default Layout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Control Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Layout Selector */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  endContent={<ChevronDownIcon className="w-4 h-4" />}
                >
                  <Squares2X2Icon className="w-4 h-4 mr-2" />
                  {currentLayout.name}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Report layout selection"
                onAction={(key) => handleLayoutChange(key as string)}
                selectionMode="single"
                items={[...availableLayouts, { id: "create-custom", name: "+ Create Custom Layout" }]}
              >
                {(item: any) => (
                  <DropdownItem 
                    key={item.id} 
                    textValue={item.name}
                    onPress={item.id === "create-custom" ? handleCreateCustomLayout : undefined}
                    className={item.id === "create-custom" ? "text-blue-600" : ""}
                  >
                    {item.name}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>

            <div className="text-sm text-gray-500">
              {currentLayout.description}
              <span className="block text-xs text-green-600 mt-1">
                Auto-loads saved configuration when layout is selected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Edit Mode Toggle */}
            <Switch
              isSelected={isEditMode}
              onValueChange={setIsEditMode}
              startContent={<EyeIcon className="w-4 h-4" />}
              endContent={<PencilIcon className="w-4 h-4" />}
            >
              <span className="text-sm">Edit Mode</span>
            </Switch>

            {/* Sidebar Toggle (only in edit mode) */}
            {isEditMode && (
              <Button
                variant="bordered"
                size="sm"
                onPress={() => setIsSidebarOpen(!isSidebarOpen)}
                startContent={
                  <Squares2X2Icon className="w-4 h-4" />
                }
              >
                {isSidebarOpen ? "Hide" : "Show"} Widgets
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Layout Area */}
          <div 
            className={`transition-all duration-300 ease-in-out ${
              isEditMode && isSidebarOpen ? "mr-80" : "mr-0"
            }`}
          >
            <ReportLayoutRenderer
              layout={currentLayout}
              widgetPlacements={widgetPlacements}
              availableWidgets={availableWidgets}
              isEditMode={isEditMode}
              draggedWidget={draggedWidget}
            />
          </div>

          {/* Sidebar */}
          {isEditMode && (
            <ReportSidebar
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              isEditMode={isEditMode}
              allWidgets={availableWidgets}
              placedWidgets={getPlacedWidgets()}
              draggedWidget={draggedWidget}
            />
          )}
        </DndContext>
      </div>

      {/* Floating Action Button */}
        <div className="sticky bottom-4 left-4 z-50">
          <Button
            color="primary"
            size="lg"
            startContent={<DocumentArrowDownIcon className="w-5 h-5" />}
            onPress={handleSaveConfiguration}
            className="shadow-lg"
          >
            Save
          </Button>
        </div>
    </div>
  );
};
