import React from "react";
import { ReportDropZone } from "./ReportDropZone";
import { ReportWidget } from "./ReportWidget";
import { ReportLayoutConfig, ReportWidgetPlacements, ReportWidgetType } from "../../types/reportLayout";

interface ReportWidgetInfo {
  id: string;
  type: ReportWidgetType;
  title: string;
  category: "metric" | "chart";
  component: React.ReactNode;
}

interface ReportLayoutRendererProps {
  layout: ReportLayoutConfig;
  widgetPlacements: ReportWidgetPlacements;
  availableWidgets: ReportWidgetInfo[];
  isEditMode: boolean;
  draggedWidget: ReportWidgetType | null;
}

export const ReportLayoutRenderer: React.FC<ReportLayoutRendererProps> = ({
  layout,
  widgetPlacements,
  availableWidgets,
  isEditMode,
  draggedWidget,
}) => {
  const renderWidget = (widgetType: ReportWidgetType) => {
    const widget = availableWidgets.find((w) => w.type === widgetType);
    if (!widget) return null;

    if (isEditMode) {
      return (
        <ReportWidget
          id={widget.id}
          type={widget.type}
          title={widget.title}
          category={widget.category}
          enableDrag={false} // Disable drag for widgets in layout zones
          isDragging={draggedWidget === widget.type}
        >
          {widget.component}
        </ReportWidget>
      );
    }

    return widget.component;
  };

  const renderDropZone = (zone: any) => {
    const placedWidget = widgetPlacements[zone.id];
    const isEmpty = !placedWidget;

    if (isEditMode) {
      return (
        <ReportDropZone
          key={zone.id}
          id={zone.id}
          type={zone.type}
          isEmpty={isEmpty}
          className={zone.className || "min-h-[120px]"}
          title={zone.title}
        >
          {placedWidget && renderWidget(placedWidget)}
        </ReportDropZone>
      );
    }

    // View mode - only render if there is a widget
    if (isEmpty) return null;

    return (
      <div key={zone.id} className={zone.className || ""}>
        {renderWidget(placedWidget)}
      </div>
    );
  };

  if (!isEditMode) {
    // View mode - render sections with actual widgets (no drop zones)
    return (
      <div className="space-y-6">
        {layout.sections.map((section) => {
          const hasWidgets = section.zones.some(
            (zone) => widgetPlacements[zone.id]
          );
          if (!hasWidgets) return null;

          return (
            <div key={section.id} className={section.className}>
              {section.zones.map((zone) => renderDropZone(zone))}
            </div>
          );
        })}
      </div>
    );
  }

  // Edit mode - render sections with drop zones
  return (
    <div className="space-y-6">
      {layout.sections.map((section) => (
        <div key={section.id}>
          {/* Section Zones */}
          <div className={section.className}>
            {section.zones.map((zone) => renderDropZone(zone))}
          </div>
        </div>
      ))}
    </div>
  );
};
