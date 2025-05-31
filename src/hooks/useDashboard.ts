/**
 * useDashboard Hook
 * Manages dashboard state, layout, and widget operations
 * Part of Story 2.2: Customizable Widget System
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  DashboardLayout, 
  DashboardConfig, 
  WidgetType, 
  WidgetInstance,
  DEFAULT_LAYOUTS,
  WIDGET_LIBRARY 
} from '../types/dashboard';
import dashboardService from '../services/dashboardServicexxx';
import { generateWidgetId } from '../utils/dashboard';

interface UseDashboardReturn {
  // State
  config: DashboardConfig | null;
  currentLayout: DashboardLayout | null;
  isLoading: boolean;
  error: string | null;
  
  // Edit Mode
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  
  // Actions
  toggleEditMode: () => void;
  addWidget: (widgetType: WidgetType) => void;
  removeWidget: (widgetId: string) => void;
  updateLayout: (layout: DashboardLayout) => void;
  saveLayout: () => Promise<void>;
  resetLayout: () => void;
  
  // Computed
  existingWidgetTypes: WidgetType[];
  updateWidgetConfig: (widgetId: string, newConfig: Partial<WidgetInstance['config']>) => void;
}

export const useDashboard = (): UseDashboardReturn => {
  // Core state
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [savedLayout, setSavedLayout] = useState<DashboardLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Computed state
  const existingWidgetTypes = useMemo(() => {
    if (!currentLayout) return [];
    return currentLayout.widgets.map(widget => widget.type);
  }, [currentLayout]);

  // Load dashboard configuration
  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Let the service handle all default dashboard creation
      const dashboardConfig = await dashboardService.getDashboardConfig();
      
      if (dashboardConfig) {
        console.log('Loaded dashboard config with', dashboardConfig.layout.widgets.length, 'widgets');
        setConfig(dashboardConfig);
        setCurrentLayout(dashboardConfig.layout);
        setSavedLayout(dashboardConfig.layout);
      } else {
        throw new Error('Failed to load or create dashboard configuration');
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  // Add widget to layout
  const addWidget = useCallback((widgetType: WidgetType) => {
    if (!currentLayout) return;

    // Get widget configuration from library
    const widgetConfig = WIDGET_LIBRARY.find(w => w.type === widgetType);
    if (!widgetConfig) {
      console.error(`Widget type ${widgetType} not found in library`);
      return;
    }

    // Find optimal position for new widget
    const newPosition = findOptimalPosition(currentLayout.widgets, widgetType);

    const newWidget: WidgetInstance = {
      id: generateWidgetId(),
      type: widgetType,
      layout: newPosition,
      config: {},
    };

    setCurrentLayout(prev => {
      if (!prev) return prev;
      
      const updatedLayout = {
        ...prev,
        widgets: [...prev.widgets, newWidget]
      };
      
      return updatedLayout;
    });

    // Auto-enable edit mode when adding widgets
    if (!isEditMode) {
      setIsEditMode(true);
    }

    setHasUnsavedChanges(true);
  }, [currentLayout, isEditMode]);

  // Remove widget from layout
  const removeWidget = useCallback((widgetId: string) => {
    if (!currentLayout) return;

    setCurrentLayout(prev => prev ? {
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId),
    } : null);
    
    setHasUnsavedChanges(true);
  }, [currentLayout]);

  // Update layout (from grid changes)
  const updateLayout = useCallback((layout: DashboardLayout) => {
    setCurrentLayout(layout);
    setHasUnsavedChanges(true);
  }, []);

  // Update widget configuration
  const updateWidgetConfig = useCallback((widgetId: string, newConfig: Partial<WidgetInstance['config']>) => {
    if (!currentLayout) return;

    setCurrentLayout(prevLayout => {
      if (!prevLayout) return null;
      return {
        ...prevLayout,
        widgets: prevLayout.widgets.map(widget => 
          widget.id === widgetId 
            ? { ...widget, config: { ...widget.config, ...newConfig } } 
            : widget
        ),
      };
    });
    
    setHasUnsavedChanges(true);
  }, [currentLayout]);

  // Save current layout
  const saveLayout = useCallback(async () => {
    if (!currentLayout || !config) return;

    try {
      const updatedConfig: DashboardConfig = {
        ...config,
        layout: currentLayout,
        updatedAt: new Date().toISOString(),
      };

      await dashboardService.saveLayout(currentLayout);
      setConfig(updatedConfig);
      setSavedLayout(currentLayout);
      setHasUnsavedChanges(false);
      
      console.log('Dashboard layout saved successfully');
    } catch (err) {
      console.error('Failed to save dashboard layout:', err);
      throw err;
    }
  }, [currentLayout, config]);

  // Reset layout to saved state
  const resetLayout = useCallback(() => {
    if (savedLayout) {
      setCurrentLayout(savedLayout);
      setHasUnsavedChanges(false);
    }
  }, [savedLayout]);

  // Find optimal position for new widget
  const findOptimalPosition = useCallback((
    existingWidgets: WidgetInstance[], 
    widgetType: WidgetType
  ) => {
    const defaultLayout = DEFAULT_LAYOUTS[widgetType];
    if (!defaultLayout) {
      // Fallback position
      return {
        lg: { x: 0, y: 0, w: 4, h: 4 },
        md: { x: 0, y: 0, w: 4, h: 4 },
        sm: { x: 0, y: 0, w: 6, h: 4 },
        xs: { x: 0, y: 0, w: 4, h: 4 },
        xxs: { x: 0, y: 0, w: 2, h: 4 },
      };
    }

    // For now, use default positions with some offset to avoid overlap
    const offset = existingWidgets.length;
    
    // Safe fallbacks for each breakpoint
    const lgLayout = defaultLayout.lg || { x: 0, y: 0, w: 4, h: 4 };
    const mdLayout = defaultLayout.md || { x: 0, y: 0, w: 4, h: 4 };
    const smLayout = defaultLayout.sm || { x: 0, y: 0, w: 6, h: 4 };
    const xsLayout = defaultLayout.xs || { x: 0, y: 0, w: 4, h: 4 };
    const xxsLayout = defaultLayout.xxs || { x: 0, y: 0, w: 2, h: 4 };
    
    return {
      lg: { 
        x: lgLayout.x, 
        y: lgLayout.y + Math.floor(offset / 3) * 4, 
        w: lgLayout.w, 
        h: lgLayout.h 
      },
      md: { 
        x: mdLayout.x, 
        y: mdLayout.y + Math.floor(offset / 3) * 4, 
        w: mdLayout.w, 
        h: mdLayout.h 
      },
      sm: { 
        x: smLayout.x, 
        y: smLayout.y + Math.floor(offset / 2) * 4, 
        w: smLayout.w, 
        h: smLayout.h 
      },
      xs: { 
        x: xsLayout.x, 
        y: xsLayout.y + offset * 4, 
        w: xsLayout.w, 
        h: xsLayout.h 
      },
      xxs: { 
        x: xxsLayout.x, 
        y: xxsLayout.y + offset * 3, 
        w: xxsLayout.w, 
        h: xxsLayout.h 
      },
    };
  }, []);

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Auto-save when exiting edit mode with changes
  useEffect(() => {
    if (!isEditMode && hasUnsavedChanges) {
      const autoSave = async () => {
        try {
          await saveLayout();
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      };
      
      // Debounce auto-save
      const timeoutId = setTimeout(autoSave, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isEditMode, hasUnsavedChanges, saveLayout]);

  return {
    // State
    config,
    currentLayout,
    isLoading,
    error,
    
    // Edit Mode
    isEditMode,
    hasUnsavedChanges,
    
    // Actions
    toggleEditMode,
    addWidget,
    removeWidget,
    updateLayout,
    saveLayout,
    resetLayout,
    
    // Computed
    existingWidgetTypes,
    updateWidgetConfig,
  };
}; 