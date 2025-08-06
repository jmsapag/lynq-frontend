import React from "react";
import { DashboardWidget } from "../DashboardWidget";
import { WidgetDropZone } from "../WidgetDropZone";
import { DashboardWidgetType, WidgetConfig } from "../widgets/types";

interface LayoutRendererProps {
  isEditing: boolean;
  widgetPlacements: Record<string, DashboardWidgetType | null>;
  availableWidgets: WidgetConfig[];
  draggedWidget: DashboardWidgetType | null;
}

export const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  isEditing,
  widgetPlacements,
  availableWidgets,
  draggedWidget,
}) => {
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
          enableDrag={false}
          isDragging={draggedWidget === widget.type}
        >
          {widget.component}
        </DashboardWidget>
      );
    }

    return widget.component;
  };

  if (!isEditing) {
    // View mode - simple layout like original Dashboard.tsx
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
