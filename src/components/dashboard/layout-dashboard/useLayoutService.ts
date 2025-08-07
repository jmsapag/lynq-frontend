// Integration utilities for dashboard to use the service layer
import { useEffect, useState, useCallback } from 'react';
import { getLayoutService, LayoutServiceFactory } from './services';
import { DashboardLayout } from './layouts';

/**
 * Hook to manage dashboard layouts using the service layer
 */
export const useLayoutService = () => {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const service = getLayoutService();

  // Initialize and load layouts
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await service.initialize();
        
        const [allLayouts, current] = await Promise.all([
          service.getLayouts(),
          service.getCurrentLayout()
        ]);
        
        setLayouts(allLayouts);
        setCurrentLayout(current);
      } catch (error) {
        console.error('Failed to initialize layout service:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [service]);

  // Save widget placements for current layout
  const saveLayout = useCallback(async (placements: Record<string, any>) => {
    if (!currentLayout) return;
    
    try {
      await service.saveLayoutConfiguration(currentLayout.id, placements);
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  }, [service, currentLayout]);

  // Load widget placements for current layout
  const loadLayout = useCallback(async (): Promise<Record<string, any> | null> => {
    if (!currentLayout) return null;
    
    try {
      return await service.loadLayoutConfiguration(currentLayout.id);
    } catch (error) {
      console.error('Failed to load layout:', error);
      return null;
    }
  }, [service, currentLayout]);

  // Switch to a different layout
  const switchLayout = useCallback(async (layoutId: string) => {
    try {
      await service.setCurrentLayout(layoutId);
      const newCurrent = layouts.find(l => l.id === layoutId);
      if (newCurrent) {
        setCurrentLayout(newCurrent);
      }
    } catch (error) {
      console.error('Failed to switch layout:', error);
    }
  }, [service, layouts]);

  // Create a new custom layout
  const createLayout = useCallback(async (layout: Omit<DashboardLayout, 'id'>) => {
    try {
      const newLayout = await service.createCustomLayout(layout);
      setLayouts(prev => [...prev, newLayout]);
      return newLayout;
    } catch (error) {
      console.error('Failed to create layout:', error);
      return null;
    }
  }, [service]);

  // Delete a custom layout
  const deleteLayout = useCallback(async (layoutId: string) => {
    try {
      await service.deleteLayout(layoutId);
      setLayouts(prev => prev.filter(l => l.id !== layoutId));
      
      // If deleting current layout, switch to default
      if (currentLayout?.id === layoutId && layouts.length > 1) {
        const defaultLayout = layouts.find(l => l.id !== layoutId);
        if (defaultLayout) {
          await switchLayout(defaultLayout.id);
        }
      }
    } catch (error) {
      console.error('Failed to delete layout:', error);
    }
  }, [service, currentLayout, layouts, switchLayout]);

  return {
    layouts,
    currentLayout,
    loading,
    saveLayout,
    loadLayout,
    switchLayout,
    createLayout,
    deleteLayout
  };
};

/**
 * Configure the layout service (call this early in app initialization)
 */
export const configureLayoutService = (storage: 'localStorage' | 'http', baseUrl?: string) => {
  LayoutServiceFactory.configure({ storage, baseUrl });
};
