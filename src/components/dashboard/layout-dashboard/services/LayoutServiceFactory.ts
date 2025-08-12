import { ILayoutRepository, ILayoutService } from './interfaces';
import { LocalStorageLayoutRepository } from './LocalStorageLayoutRepository';

/**
 * Configuration for the layout service
 */
export interface LayoutServiceConfig {
  storage: 'localStorage' | 'http';
  baseUrl?: string; // For HTTP implementation
}

/**
 * Layout service that implements business logic
 */
export class LayoutService implements ILayoutService {
  constructor(private repository: ILayoutRepository) {}

  async initialize(): Promise<void> {
    // No initialization needed for localStorage, but HTTP implementation might need it
  }

  async getLayouts(): Promise<any[]> {
    return this.repository.getAvailableLayouts();
  }

  async saveLayoutConfiguration(layoutId: string, placements: Record<string, any>): Promise<void> {
    await this.repository.saveLayout(layoutId, placements);
  }

  async loadLayoutConfiguration(layoutId: string): Promise<Record<string, any> | null> {
    return this.repository.loadLayout(layoutId);
  }

  async getCurrentLayout(): Promise<any> {
    const preferredId = await this.repository.getPreferredLayout();
    if (preferredId) {
      const layouts = await this.repository.getAvailableLayouts();
      return layouts.find(l => l.id === preferredId) || layouts[0];
    }
    const layouts = await this.repository.getAvailableLayouts();
    return layouts[0]; // Default to first layout
  }

  async setCurrentLayout(layoutId: string): Promise<void> {
    await this.repository.setPreferredLayout(layoutId);
  }

  async createCustomLayout(layout: any): Promise<any> {
    const newLayout = {
      ...layout,
      id: `custom_${Date.now()}`,
      isCustom: true
    };
    // Save the layout structure
    await this.repository.saveLayout(newLayout.id, newLayout);
    return newLayout;
  }

  async updateLayout(layoutId: string, layout: Partial<any>): Promise<void> {
    const existing = await this.repository.loadLayout(layoutId);
    if (existing) {
      const updated = { ...existing, ...layout };
      await this.repository.saveLayout(layoutId, updated);
    }
  }

  async deleteLayout(layoutId: string): Promise<void> {
    await this.repository.deleteLayout(layoutId);
  }
}

/**
 * Factory to create layout services based on configuration
 */
export class LayoutServiceFactory {
  private static instance: LayoutService | null = null;
  private static config: LayoutServiceConfig = { storage: 'localStorage' };

  /**
   * Configure the layout service
   */
  static configure(config: LayoutServiceConfig): void {
    this.config = config;
    this.instance = null; // Reset instance to force recreation with new config
  }

  /**
   * Get the layout service instance (singleton)
   */
  static getInstance(): LayoutService {
    if (!this.instance) {
      const repository = this.createRepository();
      this.instance = new LayoutService(repository);
    }
    return this.instance;
  }

  /**
   * Create the appropriate repository based on configuration
   */
  private static createRepository(): ILayoutRepository {
    switch (this.config.storage) {
      case 'localStorage':
        return new LocalStorageLayoutRepository();
      
      case 'http':
        // TODO: Implement HttpLayoutRepository next week
        throw new Error('HTTP layout repository not yet implemented. Will be available next week.');
        
      default:
        throw new Error(`Unknown storage type: ${this.config.storage}`);
    }
  }

  /**
   * Create a new service instance (for testing)
   */
  static createService(repository: ILayoutRepository): LayoutService {
    return new LayoutService(repository);
  }
}

// Export convenience function for easy access
export const getLayoutService = (): LayoutService => {
  return LayoutServiceFactory.getInstance();
};
