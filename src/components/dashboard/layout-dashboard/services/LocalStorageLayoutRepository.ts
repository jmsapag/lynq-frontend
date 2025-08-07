// Local storage implementation of layout repository
import { ILayoutRepository } from './interfaces';
import { DashboardLayout, AVAILABLE_LAYOUTS } from '../layouts';

export class LocalStorageLayoutRepository implements ILayoutRepository {
  private readonly LAYOUT_PREFIX = 'dashboard-layout-';
  private readonly PREFERRED_LAYOUT_KEY = 'dashboard-preferred-layout';
  private readonly USER_LAYOUTS_KEY = 'dashboard-user-layouts';

  async getAvailableLayouts(): Promise<DashboardLayout[]> {
    const userLayouts = await this.getUserLayouts();
    return [...AVAILABLE_LAYOUTS, ...userLayouts];
  }

  async getUserLayouts(): Promise<DashboardLayout[]> {
    try {
      const stored = localStorage.getItem(this.USER_LAYOUTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load user layouts:', error);
      return [];
    }
  }

  async saveLayout(layoutId: string, placements: Record<string, any>): Promise<void> {
    try {
      const key = `${this.LAYOUT_PREFIX}${layoutId}`;
      localStorage.setItem(key, JSON.stringify(placements));
    } catch (error) {
      console.warn('Failed to save layout:', error);
      throw new Error(`Failed to save layout ${layoutId}`);
    }
  }

  async loadLayout(layoutId: string): Promise<Record<string, any> | null> {
    try {
      const key = `${this.LAYOUT_PREFIX}${layoutId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load layout:', error);
      return null;
    }
  }

  async deleteLayout(layoutId: string): Promise<void> {
    try {
      const key = `${this.LAYOUT_PREFIX}${layoutId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to delete layout:', error);
    }
  }

  async getPreferredLayout(): Promise<string | null> {
    try {
      return localStorage.getItem(this.PREFERRED_LAYOUT_KEY);
    } catch (error) {
      console.warn('Failed to get preferred layout:', error);
      return null;
    }
  }

  async setPreferredLayout(layoutId: string): Promise<void> {
    try {
      localStorage.setItem(this.PREFERRED_LAYOUT_KEY, layoutId);
    } catch (error) {
      console.warn('Failed to set preferred layout:', error);
    }
  }

  // Helper method to save user custom layouts
  private async saveUserLayouts(layouts: DashboardLayout[]): Promise<void> {
    try {
      localStorage.setItem(this.USER_LAYOUTS_KEY, JSON.stringify(layouts));
    } catch (error) {
      console.warn('Failed to save user layouts:', error);
    }
  }

  // Method to add a new user layout
  async addUserLayout(layout: DashboardLayout): Promise<void> {
    const userLayouts = await this.getUserLayouts();
    const existingIndex = userLayouts.findIndex(l => l.id === layout.id);
    
    if (existingIndex >= 0) {
      userLayouts[existingIndex] = layout;
    } else {
      userLayouts.push(layout);
    }
    
    await this.saveUserLayouts(userLayouts);
  }

  // Method to remove a user layout
  async removeUserLayout(layoutId: string): Promise<void> {
    const userLayouts = await this.getUserLayouts();
    const filteredLayouts = userLayouts.filter(l => l.id !== layoutId);
    await this.saveUserLayouts(filteredLayouts);
  }
}
