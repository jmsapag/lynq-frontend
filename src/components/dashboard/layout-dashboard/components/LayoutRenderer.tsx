import React from "react";
import { DashboardWidget } from "../DashboardWidget";
import { WidgetDropZone } from "../WidgetDropZone";
import { DashboardWidgetType, WidgetConfig } from "../widgets/types";
import { DashboardLayout, DropZone } from "../layouts";

interface LayoutRendererProps {
  isEditing: boolean;
  currentLayout: DashboardLayout;
  widgetPlacements: Record<string, DashboardWidgetType | null>;
  availableWidgets: WidgetConfig[];
  draggedWidget: DashboardWidgetType | null;
}

export const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  isEditing,
  currentLayout,
  widgetPlacements,
  availableWidgets,
  draggedWidget,
}) => {
  const renderWidget = (widgetType: DashboardWidgetType) => {
    const widget = availableWidgets.find((w) => w.type === widgetType);
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

  const renderDropZone = (zone: DropZone) => {
    const placedWidget = widgetPlacements[zone.id];
    const widget = placedWidget
      ? availableWidgets.find((w) => w.type === placedWidget)
      : null;

    return (
      <WidgetDropZone
        key={zone.id}
        id={zone.id}
        acceptedTypes={zone.type === "any" ? ["metric", "chart"] : [zone.type]}
        isEmpty={!placedWidget}
        className={zone.className}
      >
        {placedWidget && widget ? renderWidget(placedWidget) : null}
      </WidgetDropZone>
    );
  };

  if (!isEditing) {
    // View mode - render sections with actual widgets (no drop zones)
    return (
      <div className="space-y-6">
        {currentLayout.sections.map((section) => {
          const hasWidgets = section.zones.some(
            (zone) => widgetPlacements[zone.id],
          );
          if (!hasWidgets) return null;

          return (
            <div key={section.id} className={section.className}>
              {section.zones.map((zone) => {
                const placedWidget = widgetPlacements[zone.id];
                return placedWidget ? (
                  <div
                    key={zone.id}
                    className={`relative overflow-hidden ${zone.className || ""}`}
                  >
                    {renderWidget(placedWidget)}
                  </div>
                ) : null;
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // Edit mode - render sections with drop zones
  return (
    <div className="space-y-6">
      {currentLayout.sections.map((section) => (
        <div key={section.id} className={section.className}>
          {section.zones.map((zone) => renderDropZone(zone))}
        </div>
      ))}
    </div>
  );
};
