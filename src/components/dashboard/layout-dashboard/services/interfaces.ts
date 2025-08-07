// Layout service interfaces for seamless client/server transition
import { DashboardLayout } from "../layouts";

export interface ILayoutRepository {
  /**
   * Get all available layouts (system + user custom)
   */
  getAvailableLayouts(): Promise<DashboardLayout[]>;
  
  /**
   * Get user's custom layouts only
   */
  getUserLayouts(): Promise<DashboardLayout[]>;
  
  /**
   * Save a layout configuration
   */
  saveLayout(layoutId: string, layout: Record<string, any>): Promise<void>;
  
  /**
   * Load a specific layout configuration
   */
  loadLayout(layoutId: string): Promise<Record<string, any> | null>;
  
  /**
   * Delete a layout configuration
   */
  deleteLayout(layoutId: string): Promise<void>;
  
  /**
   * Get user's preferred/last used layout
   */
  getPreferredLayout(): Promise<string | null>;
  
  /**
   * Set user's preferred layout
   */
  setPreferredLayout(layoutId: string): Promise<void>;
}

export interface ILayoutService {
  /**
   * Initialize the layout service
   */
  initialize(): Promise<void>;
  
  /**
   * Get all layouts available to the user
   */
  getLayouts(): Promise<DashboardLayout[]>;
  
  /**
   * Save widget placements for a layout
   */
  saveLayoutConfiguration(layoutId: string, placements: Record<string, any>): Promise<void>;
  
  /**
   * Load widget placements for a layout
   */
  loadLayoutConfiguration(layoutId: string): Promise<Record<string, any> | null>;
  
  /**
   * Get user's currently selected layout
   */
  getCurrentLayout(): Promise<DashboardLayout>;
  
  /**
   * Set user's current layout
   */
  setCurrentLayout(layoutId: string): Promise<void>;
  
  /**
   * Create a new custom layout
   */
  createCustomLayout(layout: Omit<DashboardLayout, 'id'>): Promise<DashboardLayout>;
  
  /**
   * Update an existing layout
   */
  updateLayout(layoutId: string, layout: Partial<DashboardLayout>): Promise<void>;
  
  /**
   * Delete a custom layout
   */
  deleteLayout(layoutId: string): Promise<void>;
}
