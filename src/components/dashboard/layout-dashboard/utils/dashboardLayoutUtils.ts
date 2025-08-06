import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { DashboardWidgetType } from "../widgets/types";

export interface DashboardLayoutState {
  isEditing: boolean;
  isSidebarOpen: boolean;
  draggedWidget: DashboardWidgetType | null;
  widgetPlacements: Record<string, DashboardWidgetType | null>;
}

export interface DashboardLayoutActions {
  setIsEditing: (editing: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setDraggedWidget: (widget: DashboardWidgetType | null) => void;
  setWidgetPlacements: (placements: Record<string, DashboardWidgetType | null>) => void;
}

export const createDragHandlers = (
  state: DashboardLayoutState,
  actions: DashboardLayoutActions
) => {
  const handleDragStart = (event: DragStartEvent) => {
    actions.setDraggedWidget(event.active.id as DashboardWidgetType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const widgetType = active.id as DashboardWidgetType;
      const targetZone = over.id as string;
      
      // Handle removal zone
      if (targetZone === 'widget-removal-zone') {
        const newPlacements = { ...state.widgetPlacements };
        Object.keys(newPlacements).forEach(zone => {
          if (newPlacements[zone] === widgetType) {
            delete newPlacements[zone];
          }
        });
        actions.setWidgetPlacements(newPlacements);
        actions.setDraggedWidget(null);
        return;
      }
      
      // Remove widget from all zones first
      const newPlacements = { ...state.widgetPlacements };
      Object.keys(newPlacements).forEach(zone => {
        if (newPlacements[zone] === widgetType) {
          delete newPlacements[zone];
        }
      });
      
      // Add to target zone
      newPlacements[targetZone] = widgetType;
      
      actions.setWidgetPlacements(newPlacements);
    }
    
    actions.setDraggedWidget(null);
  };

  return { handleDragStart, handleDragEnd };
};

export const getPlacedWidgets = (widgetPlacements: Record<string, DashboardWidgetType | null>): Set<DashboardWidgetType> => {
  return new Set(Object.values(widgetPlacements).filter(Boolean) as DashboardWidgetType[]);
};

export const getDefaultWidgetPlacements = (): Record<string, DashboardWidgetType> => ({
  "metric-1": "total-in",
  "metric-2": "total-out", 
  "metric-3": "entry-rate",
  "chart-1": "people-flow-chart",
  "chart-2": "traffic-heatmap",
  "chart-3": "entry-rate-chart",
});
