import { ReportLayoutConfig, ReportWidgetPlacements } from "../types/reportLayout";
import { ReportConfig } from "../types/reports";
import { addToast } from "@heroui/react";
import { axiosPrivate } from "./axiosClient";

class ReportLayoutServiceClass {
  private static instance: ReportLayoutServiceClass;
  private currentLayoutId: string | null = null;

  private constructor() {}

  static getInstance(): ReportLayoutServiceClass {
    if (!ReportLayoutServiceClass.instance) {
      ReportLayoutServiceClass.instance = new ReportLayoutServiceClass();
    }
    return ReportLayoutServiceClass.instance;
  }

  getAllLayouts(): ReportLayoutConfig[] {
    return [
      {
        id: "default",
        name: "Default Layout",
        description: "Standard dashboard with metrics on top and charts below",
        isCustom: false,
        sections: [
          {
            id: "metrics-row",
            className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6",
            zones: [
              { id: "metric-1", type: "metric", title: "Metric 1" },
              { id: "metric-2", type: "metric", title: "Metric 2" },
              { id: "metric-3", type: "metric", title: "Metric 3" },
            ],
          },
          {
            id: "charts-grid",
            className: "grid grid-row-1 lg:grid-row-2 xl:grid-row-3 gap-6",
            zones: [
              { id: "chart-1", type: "chart", title: "Chart 1" },
              { id: "chart-2", type: "chart", title: "Chart 2" },
              { id: "chart-3", type: "chart", title: "Chart 3" },
            ],
          },
        ],
        widgetPlacements: {
          "metric-1": "total-in",
          "metric-2": "total-out",
          "metric-3": "entry-rate",
          "chart-1": "people-flow-chart",
          "chart-2": "traffic-heatmap",
          "chart-3": "entry-rate-chart",
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: "1.0.0",
        },
      },
      {
        id: "metrics-grid",
        name: "Metrics Grid",
        description: "A 4x2 grid layout dedicated to metrics",
        isCustom: false,
        sections: [
          {
            id: "metrics-grid-section",
            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
            zones: [
              { id: "metric-1", type: "metric", title: "Metric 1" },
              { id: "metric-2", type: "metric", title: "Metric 2" },
              { id: "metric-3", type: "metric", title: "Metric 3" },
              { id: "metric-4", type: "metric", title: "Metric 4" },
              { id: "metric-5", type: "metric", title: "Metric 5" },
              { id: "metric-6", type: "metric", title: "Metric 6" },
              { id: "metric-7", type: "metric", title: "Metric 7" },
              { id: "metric-8", type: "metric", title: "Metric 8" },
            ],
          },
        ],
        widgetPlacements: {
          "metric-1": "total-in",
          "metric-2": "total-out",
          "metric-3": "entry-rate",
          "metric-4": "daily-average-in",
          "metric-5": "daily-average-out",
          "metric-6": "most-crowded-day",
          "metric-7": "least-crowded-day",
          "metric-8": "percentage-change",
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: "1.0.0",
        },
      },
      {
        id: "analytics-focused",
        name: "Analytics Focused",
        description: "Large charts with minimal metrics",
        isCustom: false,
        sections: [
          {
            id: "single-metric",
            className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",
            zones: [
              { id: "metric-1", type: "metric", title: "Key Metric" },
              { id: "metric-2", type: "metric", title: "Secondary Metric" },
            ],
          },
          {
            id: "main-chart",
            className: "grid grid-cols-1 mb-6",
            zones: [
              { id: "chart-main", type: "chart", title: "Main Analytics Chart" },
            ],
          },
          {
            id: "secondary-charts",
            className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
            zones: [
              { id: "chart-1", type: "chart", title: "Secondary Chart 1" },
              { id: "chart-2", type: "chart", title: "Secondary Chart 2" },
            ],
          },
        ],
        widgetPlacements: {
          "metric-1": "total-in",
          "metric-2": "entry-rate",
          "chart-main": "people-flow-chart",
          "chart-1": "traffic-heatmap",
          "chart-2": "entry-rate-chart",
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: "1.0.0",
        },
      },
      {
        id: "compact",
        name: "Compact View",
        description: "Essential widgets only for smaller screens",
        isCustom: false,
        sections: [
          {
            id: "compact-metrics",
            className: "grid grid-cols-2 gap-3 mb-4",
            zones: [
              { id: "metric-1", type: "metric", title: "Key 1" },
              { id: "metric-2", type: "metric", title: "Key 2" },
            ],
          },
          {
            id: "compact-chart",
            className: "grid grid-cols-1",
            zones: [{ id: "chart-1", type: "chart", title: "Main Chart" }],
          },
        ],
        widgetPlacements: {
          "metric-1": "total-in",
          "metric-2": "entry-rate",
          "chart-1": "people-flow-chart",
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: "1.0.0",
        },
      },
    ];
  }

  getLayout(layoutId: string): ReportLayoutConfig | null {
    const layouts = this.getAllLayouts();
    return layouts.find(layout => layout.id === layoutId) || null;
  }

  getCurrentLayout(): ReportLayoutConfig | null {
    if (!this.currentLayoutId) {
      const layouts = this.getAllLayouts();
      return layouts[0] || null;
    }
    return this.getLayout(this.currentLayoutId);
  }

  getCurrentLayoutId(): string | null {
    return this.currentLayoutId;
  }

  setCurrentLayoutId(layoutId: string): void {
    this.currentLayoutId = layoutId;
  }

  updateWidgetPlacements(layoutId: string, placements: ReportWidgetPlacements): void {
    // In a real implementation, this would save to localStorage or API
    console.log(`Updating widget placements for layout ${layoutId}:`, placements);
  }

  saveConfiguration(reportConfig: ReportConfig, layout: ReportLayoutConfig, placements: ReportWidgetPlacements): void {
    try {
      const configKey = `report-config-${layout.id}`;
      const placementsKey = `report-placements-${layout.id}`;
      
      // Save to localStorage for persistence
      localStorage.setItem(configKey, JSON.stringify(reportConfig));
      localStorage.setItem(placementsKey, JSON.stringify(placements));
      
      console.log("Report configuration saved successfully:", {
        layoutId: layout.id,
        layoutName: layout.name,
        reportConfig,
        placements,
      });
      
      // Show success toast notification
      addToast({
        title: "Configuration Saved",
        description: `Report configuration saved successfully for layout: ${layout.name}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to save report configuration:", error);
      addToast({
        title: "Save Failed",
        description: "Failed to save report configuration. Please try again.",
        severity: "danger",
      });
    }
  }

  createCustomLayout(name: string, description: string): ReportLayoutConfig {
    const newLayout: ReportLayoutConfig = {
      id: `custom-${Date.now()}`,
      name,
      description,
      isCustom: true,
      sections: [
        {
          id: "custom-section",
          className: "grid grid-cols-2 gap-4",
          zones: [
            { id: "custom-zone-1", type: "any", title: "Zone 1" },
            { id: "custom-zone-2", type: "any", title: "Zone 2" },
          ],
        },
      ],
      widgetPlacements: {
        "custom-zone-1": null,
        "custom-zone-2": null,
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: "1.0.0",
      },
    };
    
    return newLayout;
  }

  // API Integration Methods
  
  /**
   * Save widget placements for a layout
   */
  async saveLayoutPlacements(
    layoutId: string, 
    widgetPlacements: ReportWidgetPlacements
  ): Promise<void> {
    try {
      // Try to save to API first
      const response = await axiosPrivate.post('/api/reports/layouts/placements', {
        layoutId,
        widgetPlacements,
      });

      if (response.status === 200 || response.status === 201) {
        addToast({
          title: "Layout Saved",
          description: `Widget placements saved for ${this.getLayout(layoutId)?.name}`,
          color: "success",
        });
        return;
      }
    } catch (error) {
      console.warn('Failed to save to API, using localStorage fallback:', error);
    }
    
    // Fallback to localStorage if API fails
    this.saveLayoutPlacementsLocally(layoutId, widgetPlacements);
  }

  /**
   * Load widget placements for a layout
   */
  async loadLayoutPlacements(layoutId: string): Promise<ReportWidgetPlacements | null> {
    try {
      // Try to load from API first
      const response = await axiosPrivate.get(`/api/reports/layouts/placements/${layoutId}`);

      if (response.status === 200 && response.data) {
        return response.data.widgetPlacements || null;
      }
    } catch (error) {
      console.warn('Failed to load from API, using localStorage fallback:', error);
    }
    
    // Fallback to localStorage if API fails
    const localPlacements = this.loadLayoutPlacementsLocally(layoutId);
    
    if (localPlacements) {
      if (navigator.onLine) {
        addToast({
          title: "Layout Loaded Locally",
          description: "Server unavailable - loaded layout from local storage",
          color: "warning",
        });
      }
      
      return localPlacements;
    }
    
    return null;
  }

  /**
   * Save widget placements to localStorage (fallback method)
   */
  private saveLayoutPlacementsLocally(
    layoutId: string, 
    widgetPlacements: ReportWidgetPlacements
  ): void {
    try {
      const configKey = `report-layout-placements-${layoutId}`;
      localStorage.setItem(configKey, JSON.stringify(widgetPlacements));
      
      addToast({
        title: "Layout Saved Locally",
        description: `Widget placements saved locally for ${this.getLayout(layoutId)?.name}`,
        color: "success",
      });
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      addToast({
        title: "Save Failed",
        description: "Unable to save layout - storage unavailable",
        color: "danger",
      });
    }
  }

  /**
   * Load widget placements from localStorage (fallback method)
   */
  private loadLayoutPlacementsLocally(layoutId: string): ReportWidgetPlacements | null {
    try {
      const configKey = `report-layout-placements-${layoutId}`;
      const stored = localStorage.getItem(configKey);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Check for legacy storage format
      const legacyKey = `report-complete-config-${layoutId}`;
      const legacyStored = localStorage.getItem(legacyKey);
      if (legacyStored) {
        const legacyData = JSON.parse(legacyStored);
        return legacyData.widgetPlacements || null;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  /**
   * Get all saved layout configurations (both API and localStorage)
   */
  async getAllSavedConfigurations(): Promise<Array<{
    layoutId: string, 
    widgetPlacements: ReportWidgetPlacements | null,
    source: 'api' | 'local'
  }>> {
    const configurations: Array<{
      layoutId: string, 
      widgetPlacements: ReportWidgetPlacements | null,
      source: 'api' | 'local'
    }> = [];
    
    try {
      // Try to fetch from API first
      const response = await axiosPrivate.get('/api/reports/layouts/configurations');

      if (response.status === 200) {
        const apiConfigs = response.data;
        configurations.push(...apiConfigs.map((config: any) => ({
          layoutId: config.layoutId,
          widgetPlacements: config.widgetPlacements,
          source: 'api' as const,
        })));
      }
    } catch (error) {
      console.warn('Failed to fetch configurations from API:', error);
    }

    // Also check localStorage for any configurations
    const availableLayouts = this.getAllLayouts();
    for (const layout of availableLayouts) {
      const localPlacements = this.loadLayoutPlacementsLocally(layout.id);
      if (localPlacements) {
        // Only add if not already present from API
        const exists = configurations.some(c => c.layoutId === layout.id);
        if (!exists) {
          configurations.push({
            layoutId: layout.id,
            widgetPlacements: localPlacements,
            source: 'local',
          });
        }
      }
    }
    return configurations;
  }

}

export const ReportLayoutService = ReportLayoutServiceClass;
