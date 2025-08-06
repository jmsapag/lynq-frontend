// src/components/dashboard/layout-dashboard/LayoutDashboard.tsx
import React, { useState, useMemo } from "react";
import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Switch } from "@heroui/react";
import { Squares2X2Icon, ChevronDownIcon, PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { DashboardWidget } from "./DashboardWidget";
import { LayoutSidebar } from "./LayoutSidebar";
import { WidgetDropZone } from "./WidgetDropZone";
import { LAYOUT_SCHEMAS } from "../drag-drop/layouts/schemas";
import { LayoutType } from "../drag-drop/layouts/types";
import { SensorDataCard } from "../charts/card";
import { ChartCard } from "../charts/chart-card";
import { LineChart } from "../charts/line-chart";
import { ChartHeatMap } from "../charts/heat-map/chart-heat-map";
import { EntryRateChart } from "../charts/entry-rate/entry-rate-chart";

interface LayoutDashboardProps {
  // Dashboard data props
  metrics: {
    totalIn: number;
    totalOut: number;
    entryRate: number;
  };
  chartData: {
    categories: string[];
    values: Array<{ in: number; out: number }>;
  };
  sensorData: any;
  sensorRecordsFormData: any;
  isLoading?: boolean;
  hasError?: boolean;
}

export type DashboardWidgetType = 
  | "total-in" 
  | "total-out" 
  | "entry-rate" 
  | "people-flow-chart" 
  | "traffic-heatmap" 
  | "entry-rate-chart";

interface WidgetConfig {
  id: string;
  type: DashboardWidgetType;
  title: string;
  translationKey?: string;
  category: 'metric' | 'chart';
  component: React.ReactNode;
}

export const LayoutDashboard: React.FC<LayoutDashboardProps> = ({
  metrics,
  chartData,
  sensorData,
  sensorRecordsFormData,
  isLoading = false,
  hasError = false,
}) => {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<DashboardWidgetType | null>(null);
  const [widgetPlacements, setWidgetPlacements] = useState<Record<string, DashboardWidgetType | null>>({});

  // Define all available widgets with their components and categories
  const availableWidgets: WidgetConfig[] = useMemo(() => [
    {
      id: "total-in",
      type: "total-in",
      title: "Total In",
      translationKey: "dashboard.metrics.totalIn",
      category: "metric",
      component: (
        <SensorDataCard
          title="Total In"
          value={metrics.totalIn}
          translationKey="dashboard.metrics.totalIn"
          unit="people"
        />
      ),
    },
    {
      id: "total-out",
      type: "total-out",
      title: "Total Out",
      translationKey: "dashboard.metrics.totalOut",
      category: "metric",
      component: (
        <SensorDataCard
          title="Total Out"
          value={metrics.totalOut}
          translationKey="dashboard.metrics.totalOut"
          unit="people"
        />
      ),
    },
    {
      id: "entry-rate",
      type: "entry-rate",
      title: "Entry Rate",
      translationKey: "dashboard.metrics.entryRate",
      category: "metric",
      component: (
        <SensorDataCard
          title="Entry Rate"
          value={metrics.entryRate}
          translationKey="dashboard.metrics.entryRate"
          unit="%"
        />
      ),
    },
    {
      id: "people-flow-chart",
      type: "people-flow-chart",
      title: "People Flow Chart",
      translationKey: "dashboard.charts.peopleFlow",
      category: "chart",
      component: (
        <ChartCard
          title="Flujo de Personas (In/Out)"
          translationKey="dashboard.charts.peopleFlow"
        >
          {chartData.categories.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available. Please select sensors and date range.
            </div>
          ) : (
            <LineChart
              data={chartData}
              groupBy={sensorRecordsFormData.groupBy}
            />
          )}
        </ChartCard>
      ),
    },
    {
      id: "traffic-heatmap",
      type: "traffic-heatmap",
      title: "Traffic Heatmap",
      translationKey: "dashboard.charts.trafficHeatmap",
      category: "chart",
      component: (
        <ChartCard
          title="Traffic Heatmap (By Day & Hour)"
          translationKey="dashboard.charts.trafficHeatmap"
        >
          {chartData.categories.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available. Please select sensors and date range.
            </div>
          ) : (
            <ChartHeatMap data={sensorData} />
          )}
        </ChartCard>
      ),
    },
    {
      id: "entry-rate-chart",
      type: "entry-rate-chart",
      title: "Entry Rate Chart",
      translationKey: "dashboard.charts.entryRateOverTime",
      category: "chart",
      component: (
        <ChartCard
          title="Entry Rate Over Time"
          translationKey="dashboard.charts.entryRateOverTime"
        >
          {chartData.categories.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available. Please select sensors and date range.
            </div>
          ) : (
            <EntryRateChart
              data={chartData}
              groupBy={sensorRecordsFormData.groupBy}
            />
          )}
        </ChartCard>
      ),
    },
  ], [metrics, chartData, sensorData, sensorRecordsFormData]);

  // Get current layout schema
  const currentLayout = LAYOUT_SCHEMAS[selectedLayout];

  // Initialize widget placements with default dashboard layout that matches real LYNQ UI
  React.useEffect(() => {
    if (selectedLayout === "dashboard" && Object.keys(widgetPlacements).length === 0) {
      setWidgetPlacements({
        "metric-1": "total-in",
        "metric-2": "total-out", 
        "metric-3": "entry-rate",
        "chart-1": "people-flow-chart",
        "chart-2": "traffic-heatmap",
        "chart-3": "entry-rate-chart",
      });
    }
  }, [selectedLayout, widgetPlacements]);

  // Toggle sidebar when entering/exiting edit mode
  React.useEffect(() => {
    setIsSidebarOpen(isEditing);
  }, [isEditing]);

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedWidget(event.active.id as DashboardWidgetType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const widgetType = active.id as DashboardWidgetType;
      const targetZone = over.id as string;
      
      // Handle removal zone
      if (targetZone === 'widget-removal-zone') {
        // Remove widget from all zones
        const newPlacements = { ...widgetPlacements };
        Object.keys(newPlacements).forEach(zone => {
          if (newPlacements[zone] === widgetType) {
            delete newPlacements[zone];
          }
        });
        setWidgetPlacements(newPlacements);
        setDraggedWidget(null);
        return;
      }
      
      // Remove widget from all zones first
      const newPlacements = { ...widgetPlacements };
      Object.keys(newPlacements).forEach(zone => {
        if (newPlacements[zone] === widgetType) {
          delete newPlacements[zone];
        }
      });
      
      // Add to target zone
      newPlacements[targetZone] = widgetType;
      
      setWidgetPlacements(newPlacements);
    }
    
    setDraggedWidget(null);
  };

  const renderWidget = (widgetType: DashboardWidgetType) => {
    const widget = availableWidgets.find(w => w.type === widgetType);
    if (!widget) return null;

    if (isEditing) {
      return (
        <DashboardWidget
          id={widget.id}
          type={widget.type}
          title={widget.title}
          category={widget.category}
          enableDrag={false} // Disable drag for widgets in layout zones
          isDragging={draggedWidget === widget.type}
        >
          {widget.component}
        </DashboardWidget>
      );
    }

    return widget.component;
  };

  // Get placed widgets set for sidebar indication
  const getPlacedWidgets = (): Set<DashboardWidgetType> => {
    return new Set(Object.values(widgetPlacements).filter(Boolean) as DashboardWidgetType[]);
  };

  // Generate individual drop zones for the dashboard layout
  const renderDashboardLayout = () => {
    if (selectedLayout !== "dashboard") return null;

    if (!isEditing) {
      // View mode - simple layout like Dashboard.tsx
      return (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {widgetPlacements["metric-1"] && renderWidget(widgetPlacements["metric-1"])}
            {widgetPlacements["metric-2"] && renderWidget(widgetPlacements["metric-2"])}
            {widgetPlacements["metric-3"] && renderWidget(widgetPlacements["metric-3"])}
          </div>

          {/* Charts Column */}
          <div className="grid grid-cols-1 gap-6">
            {widgetPlacements["chart-1"] && renderWidget(widgetPlacements["chart-1"])}
            {widgetPlacements["chart-2"] && renderWidget(widgetPlacements["chart-2"])}
            {widgetPlacements["chart-3"] && renderWidget(widgetPlacements["chart-3"])}
          </div>
        </div>
      );
    }

    // Edit mode - with drop zones
    return (
      <div className="space-y-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(index => {
            const zoneId = `metric-${index}`;
            const placedWidget = widgetPlacements[zoneId];
            
            return (
              <WidgetDropZone
                key={zoneId}
                id={zoneId}
                acceptedTypes={['metric']}
                isEmpty={!placedWidget}
                zoneTitle={`Metric Card ${index}`}
                className="min-h-[120px]"
              >
                {placedWidget && renderWidget(placedWidget)}
              </WidgetDropZone>
            );
          })}
        </div>

        {/* Charts Column */}
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map(index => {
            const zoneId = `chart-${index}`;
            const placedWidget = widgetPlacements[zoneId];
            
            return (
              <WidgetDropZone
                key={zoneId}
                id={zoneId}
                acceptedTypes={['chart']}
                isEmpty={!placedWidget}
                zoneTitle={`Chart ${index}`}
                className="min-h-[400px] h-96"
              >
                {placedWidget && renderWidget(placedWidget)}
              </WidgetDropZone>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <div className="text-center">
          <p className="text-lg font-medium">Error loading data</p>
          <p className="text-sm mt-1">Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Layout Controls - styled like LYNQ UI */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" endContent={<ChevronDownIcon className="w-4 h-4" />}>
                  <Squares2X2Icon className="w-4 h-4 mr-2" />
                  {currentLayout.name}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Layout selection"
                onAction={(key) => setSelectedLayout(key as LayoutType)}
              >
                {Object.entries(LAYOUT_SCHEMAS).map(([key, layout]) => (
                  <DropdownItem key={key}>{layout.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            
            <div className="text-sm text-gray-500">
              {currentLayout.description}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Switch
              isSelected={isEditing}
              onValueChange={setIsEditing}
              startContent={<EyeIcon className="w-4 h-4" />}
              endContent={<PencilIcon className="w-4 h-4" />}
            >
              <span className="text-sm">Edit Mode</span>
            </Switch>
          </div>
        </div>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-auto">
            {renderDashboardLayout()}
          </div>

          {/* Collapsible Sidebar for widgets */}
          <LayoutSidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            isEditMode={isEditing}
            allWidgets={availableWidgets}
            placedWidgets={getPlacedWidgets()}
            draggedWidget={draggedWidget}
          />
        </div>

      </DndContext>
    </div>
  );
};
