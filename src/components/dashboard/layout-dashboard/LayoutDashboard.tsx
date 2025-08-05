// src/components/dashboard/layout-dashboard/LayoutDashboard.tsx
import React, { useState, useMemo } from "react";
import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Switch } from "@heroui/react";
import { Squares2X2Icon, ChevronDownIcon, PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import DroppableZone from "../drag-drop/droppable/droppable";
import { DashboardWidget } from "./DashboardWidget";
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
  const [draggedWidget, setDraggedWidget] = useState<DashboardWidgetType | null>(null);
  const [widgetPlacements, setWidgetPlacements] = useState<Record<string, DashboardWidgetType[]>>({});

  // Define all available widgets with their components
  const availableWidgets: WidgetConfig[] = useMemo(() => [
    {
      id: "total-in",
      type: "total-in",
      title: "Total In",
      translationKey: "dashboard.metrics.totalIn",
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
        "metrics-row": ["total-in", "total-out", "entry-rate"],
        "charts-column": ["people-flow-chart", "traffic-heatmap", "entry-rate-chart"],
      });
    }
  }, [selectedLayout, widgetPlacements]);

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedWidget(event.active.id as DashboardWidgetType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const widgetType = active.id as DashboardWidgetType;
      const targetZone = over.id as string;
      
      // Remove widget from all zones
      const newPlacements = { ...widgetPlacements };
      Object.keys(newPlacements).forEach(zone => {
        newPlacements[zone] = newPlacements[zone]?.filter(w => w !== widgetType) || [];
      });
      
      // Add to target zone
      if (!newPlacements[targetZone]) {
        newPlacements[targetZone] = [];
      }
      newPlacements[targetZone].push(widgetType);
      
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
          type={widgetType}
          title={widget.title}
          isDragging={draggedWidget === widgetType}
        >
          {widget.component}
        </DashboardWidget>
      );
    }

    return widget.component;
  };

  const renderDroppableZone = (zone: any) => {
    const zoneWidgets = widgetPlacements[zone.id] || [];
    
    if (isEditing) {
      return (
        <DroppableZone
          key={zone.id}
          id={zone.id}
          acceptedTypes={zone.acceptedTypes}
        >
          <div className={zone.className}>
            {zoneWidgets.map(widgetType => renderWidget(widgetType))}
          </div>
        </DroppableZone>
      );
    }

    // In view mode, render widgets directly without droppable zones
    return (
      <div key={zone.id} className={zone.className}>
        {zoneWidgets.map(widgetType => renderWidget(widgetType))}
      </div>
    );
  };

  const renderAvailableWidgets = () => {
    if (!isEditing) return null;

    const placedWidgets = new Set(
      Object.values(widgetPlacements).flat()
    );
    
    const unplacedWidgets = availableWidgets.filter(
      widget => !placedWidgets.has(widget.type)
    );

    if (unplacedWidgets.length === 0) return null;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Available Widgets</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unplacedWidgets.map(widget => (
            <DashboardWidget
              key={widget.id}
              id={widget.id}
              type={widget.type}
              title={widget.title}
              isDragging={draggedWidget === widget.type}
            >
              <div className="h-20 bg-gray-50 rounded border border-gray-200 flex items-center justify-center text-gray-500 text-sm">
                {widget.title}
              </div>
            </DashboardWidget>
          ))}
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
        {/* Available Widgets Pool (only in edit mode) */}
        {renderAvailableWidgets()}

        {/* Layout Zones - using exact LYNQ styling */}
        <div className={currentLayout.containerClass}>
          {currentLayout.zones.map(renderDroppableZone)}
        </div>
      </DndContext>
    </div>
  );
};
