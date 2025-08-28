import { useState, useCallback, useMemo, useEffect } from "react";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { ReportLayoutService } from "../../services/reportLayoutService";
import {
  ReportLayoutConfig,
  ReportWidgetPlacements,
  ReportWidgetType,
} from "../../types/reportLayout";

export interface UseReportLayoutReturn {
  // Layout management
  currentLayout: ReportLayoutConfig | null;
  availableLayouts: ReportLayoutConfig[];
  setCurrentLayout: (layoutId: string) => void;

  // Widget placement management
  widgetPlacements: ReportWidgetPlacements;
  setWidgetPlacements: (placements: ReportWidgetPlacements) => void;

  // Drag & drop state
  draggedWidget: ReportWidgetType | null;
  isEditMode: boolean;
  isSidebarOpen: boolean;

  // Actions
  setIsEditMode: (editing: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;

  // Layout operations
  saveCurrentConfiguration: () => void;
  createCustomLayout: (name: string, description: string) => void;

  // Utility functions
  getPlacedWidgets: () => Set<ReportWidgetType>;
  resetToDefaults: () => void;
}

export const useReportLayout = (): UseReportLayoutReturn => {
  const service = ReportLayoutService.getInstance();

  const [currentLayout, setCurrentLayoutState] =
    useState<ReportLayoutConfig | null>(() => {
      const layout = service.getCurrentLayout();
      if (layout && !service.getCurrentLayoutId()) {
        // Set default layout as current if none is set
        service.setCurrentLayoutId(layout.id);
      }
      return layout;
    });
  const [widgetPlacements, setWidgetPlacements] =
    useState<ReportWidgetPlacements>(() => {
      const layout = service.getCurrentLayout();
      return layout?.widgetPlacements || {};
    });
  const [draggedWidget, setDraggedWidget] = useState<ReportWidgetType | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get available layouts
  const availableLayouts = useMemo(() => {
    return service.getAllLayouts();
  }, [service]);

  // Load saved configuration for the initial layout
  useEffect(() => {
    const loadInitialConfiguration = async () => {
      if (currentLayout) {
        try {
          const savedPlacements = await service.loadLayoutPlacements(
            currentLayout.id,
          );
          if (savedPlacements) {
            setWidgetPlacements(savedPlacements);
          }
        } catch (error) {
          console.warn(
            "Failed to load initial configuration, using defaults:",
            error,
          );
        }
      }
    };

    loadInitialConfiguration();
  }, []); // Only run once on mount

  // Set current layout and load its configuration
  const setCurrentLayout = useCallback(
    async (layoutId: string) => {
      const layout = service.getLayout(layoutId);
      if (layout) {
        setCurrentLayoutState(layout);
        service.setCurrentLayoutId(layoutId);

        // Try to load saved widget placements for this layout
        try {
          const savedPlacements = await service.loadLayoutPlacements(layoutId);
          if (savedPlacements) {
            setWidgetPlacements(savedPlacements);
          } else {
            // Use default placements from layout
            setWidgetPlacements(layout.widgetPlacements);
          }
        } catch (error) {
          console.warn(
            "Failed to load widget placements, using defaults:",
            error,
          );
          // Use default placements from layout
          setWidgetPlacements(layout.widgetPlacements);
        }
      }
    },
    [service],
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const widgetType = event.active.data?.current?.type as ReportWidgetType;
    setDraggedWidget(widgetType);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setDraggedWidget(null);

      if (!over || !currentLayout) return;

      const widgetType = active.data?.current?.type as ReportWidgetType;
      const widgetCategory = active.data?.current?.category as
        | "metric"
        | "chart";
      const targetZone = over.id as string;

      if (!widgetType || !widgetCategory) return;

      // Handle removal zone
      if (targetZone === "report-widget-removal-zone") {
        setWidgetPlacements((prev) => {
          const newPlacements = { ...prev };
          // Remove widget from any existing placement
          Object.keys(newPlacements).forEach((zoneId) => {
            if (newPlacements[zoneId] === widgetType) {
              newPlacements[zoneId] = null;
            }
          });
          return newPlacements;
        });
        return;
      }

      // Find the target zone configuration to check type compatibility
      const targetZoneConfig = currentLayout.sections
        .flatMap((section) => section.zones)
        .find((zone) => zone.id === targetZone);

      if (!targetZoneConfig) return;

      // Check if widget type is compatible with zone type
      const isCompatible =
        targetZoneConfig.type === "any" ||
        targetZoneConfig.type === widgetCategory;

      if (!isCompatible) {
        // Widget type doesn't match zone type - don't place it
        return;
      }

      // Update placements
      setWidgetPlacements((prev) => {
        const newPlacements = { ...prev };

        // Remove widget from any existing placement
        Object.keys(newPlacements).forEach((zoneId) => {
          if (newPlacements[zoneId] === widgetType) {
            newPlacements[zoneId] = null;
          }
        });

        // Place widget in target zone
        newPlacements[targetZone] = widgetType;

        return newPlacements;
      });
    },
    [currentLayout],
  );

  // Save current configuration
  const saveCurrentConfiguration = useCallback(async () => {
    if (!currentLayout) return;

    try {
      await service.saveLayoutPlacements(currentLayout.id, widgetPlacements);
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  }, [currentLayout, widgetPlacements, service]);

  // Create custom layout
  const createCustomLayout = useCallback(
    (name: string, description: string) => {
      const newLayout = service.createCustomLayout(name, description);
      setCurrentLayoutState(newLayout);
      setWidgetPlacements({});
      service.setCurrentLayoutId(newLayout.id);
    },
    [service],
  );

  // Get placed widgets
  const getPlacedWidgets = useCallback((): Set<ReportWidgetType> => {
    const placed = new Set<ReportWidgetType>();
    Object.values(widgetPlacements).forEach((widget) => {
      if (widget) {
        placed.add(widget);
      }
    });
    return placed;
  }, [widgetPlacements]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setWidgetPlacements({});
    setIsEditMode(false);
    setIsSidebarOpen(false);
    setDraggedWidget(null);
  }, []);

  // Auto-open sidebar when entering edit mode (removed - users should control this manually)
  // useEffect(() => {
  //   if (isEditMode && !isSidebarOpen) {
  //     setIsSidebarOpen(true);
  //   }
  // }, [isEditMode, isSidebarOpen]);

  return {
    currentLayout,
    availableLayouts,
    setCurrentLayout,
    widgetPlacements,
    setWidgetPlacements,
    draggedWidget,
    isEditMode,
    isSidebarOpen,
    setIsEditMode,
    setIsSidebarOpen,
    handleDragStart,
    handleDragEnd,
    saveCurrentConfiguration,
    createCustomLayout,
    getPlacedWidgets,
    resetToDefaults,
  };
};
