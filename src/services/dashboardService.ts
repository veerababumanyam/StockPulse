/**
 * StockPulse Dashboard Service - Enterprise-Grade
 * Handles all business logic, data persistence (localStorage and API), 
 * and state management for the customizable widget dashboard.
 * Integrates with central theme system and Story 2.2 requirements.
 */

import { 
  DashboardConfig,
  DashboardLayout,
  WidgetConfig,
  WidgetType,
  WidgetMetadata,
  DEFAULT_DASHBOARD_CONFIG,
  DEFAULT_LAYOUTS,
  DASHBOARD_BREAKPOINTS,
  WIDGET_LIBRARY,
  DashboardAPIResponse,
  DashboardPreferences,
  DEFAULT_DASHBOARD_PREFERENCES,
  WidgetPosition,
  DashboardBreakpoints
} from '../types/dashboard';
import { authService } from './authService'; // Assuming authService for user context
import { apiClient } from './api'; // Assuming a configured apiClient

const LOCAL_STORAGE_KEY = 'stockpulse_dashboard_config';
const USER_PREFERENCES_KEY = 'stockpulse_dashboard_preferences';

// ===============================================
// Utility Functions
// ===============================================

/**
 * Generate unique widget ID
 */
const generateWidgetId = (type: WidgetType): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
};

// ===============================================
// LocalStorage Persistence
// ===============================================

/**
 * Load dashboard configuration from localStorage
 */
const loadConfigFromLocalStorage = (): DashboardConfig | null => {
  try {
    const serializedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedConfig === null) {
      return null;
    }
    const config = JSON.parse(serializedConfig) as DashboardConfig;
    // TODO: Add version migration logic if needed
    return config;
  } catch (error) {
    console.error('[DashboardService] Error loading config from localStorage:', error);
    return null;
  }
};

/**
 * Save dashboard configuration to localStorage
 */
const saveConfigToLocalStorage = (config: DashboardConfig): void => {
  try {
    const serializedConfig = JSON.stringify(config);
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedConfig);
  } catch (error) {
    console.error('[DashboardService] Error saving config to localStorage:', error);
  }
};

/**
 * Load user preferences from localStorage
 */
const loadPreferencesFromLocalStorage = (): DashboardPreferences => {
  try {
    const serializedPrefs = localStorage.getItem(USER_PREFERENCES_KEY);
    if (serializedPrefs === null) {
      return DEFAULT_DASHBOARD_PREFERENCES;
    }
    return JSON.parse(serializedPrefs) as DashboardPreferences;
  } catch (error) {
    console.error('[DashboardService] Error loading preferences from localStorage:', error);
    return DEFAULT_DASHBOARD_PREFERENCES;
  }
};

/**
 * Save user preferences to localStorage
 */
const savePreferencesToLocalStorage = (prefs: DashboardPreferences): void => {
  try {
    const serializedPrefs = JSON.stringify(prefs);
    localStorage.setItem(USER_PREFERENCES_KEY, serializedPrefs);
  } catch (error) {
    console.error('[DashboardService] Error saving preferences to localStorage:', error);
  }
};

// ===============================================
// API Integration
// ===============================================

/**
 * Fetch dashboard configuration from the backend API
 * @param dashboardId The ID of the dashboard to fetch
 */
const fetchDashboardConfigAPI = async (dashboardId: string): Promise<DashboardConfig | null> => {
  try {
    console.log(`[DashboardService] Fetching dashboard config for ID: ${dashboardId}`);
    
    const response = await apiClient.get<DashboardAPIResponse<DashboardConfig>>(`/dashboards/${dashboardId}`);
    console.log(`[DashboardService] API Response:`, response.data);
    
    if (response.data.success && response.data.data) {
      console.log(`[DashboardService] Successfully fetched dashboard config:`, response.data.data);
      return response.data.data;
    }
    console.error('[DashboardService] API Error fetching dashboard:', response.data.message);
    return null;
  } catch (error) {
    console.error('[DashboardService] Network Error fetching dashboard:', error);
    return null;
  }
};

/**
 * Save dashboard configuration to the backend API
 * @param config The dashboard configuration to save
 */
const saveDashboardConfigAPI = async (config: DashboardConfig): Promise<boolean> => {
  try {
    // const user = authService.getCurrentUser();
    // if (!user) throw new Error('User not authenticated');

    const response = await apiClient.put<DashboardAPIResponse>(`/dashboards/${config.id}`, config);
    if (response.data.success) {
      return true;
    }
    console.error('[DashboardService] API Error saving dashboard:', response.data.message);
    return false;
  } catch (error) {
    console.error('[DashboardService] Network Error saving dashboard:', error);
    return false;
  }
};

/**
 * Fetch user's default dashboard ID from API (example)
 */
const fetchUserDefaultDashboardIdAPI = async (): Promise<string | null> => {
  try {
    // const user = authService.getCurrentUser();
    // if (!user) return null;
    // const response = await apiClient.get<DashboardAPIResponse<{ defaultDashboardId: string }>>(`/users/${user.id}/default-dashboard`);
    // if (response.data.success && response.data.data) {
    //   return response.data.data.defaultDashboardId;
    // }
    return 'default-dashboard'; // Placeholder
  } catch (error) {
    console.error('[DashboardService] Error fetching user default dashboard ID:', error);
    return null;
  }
}


// ===============================================
// Core Dashboard Logic
// ===============================================

/**
 * Initialize dashboard: Load from API, then localStorage, or create default
 */
const initializeDashboard = async (): Promise<DashboardConfig> => {
  console.log('[DashboardService] Initializing dashboard...');
  let config: DashboardConfig | null = null;
  
  // Priority 1: Try loading user-specific dashboard from API
  const userDefaultDashboardId = await fetchUserDefaultDashboardIdAPI();
  console.log(`[DashboardService] User default dashboard ID: ${userDefaultDashboardId}`);
  
  if (userDefaultDashboardId) {
    config = await fetchDashboardConfigAPI(userDefaultDashboardId);
    if (config) {
      console.log('[DashboardService] Successfully loaded dashboard from API');
      saveConfigToLocalStorage(config); // Sync API version to local
      return config; // ✅ Return API config immediately, don't check localStorage
    } else {
      console.log('[DashboardService] Failed to load dashboard from API, trying localStorage');
    }
  }

  // Priority 2: Try loading from localStorage only if API failed
  config = loadConfigFromLocalStorage();
  if (config) {
    console.log('[DashboardService] Successfully loaded dashboard from localStorage');
    return config;
  }

  // Priority 3: Create default dashboard configuration
  console.log('[DashboardService] No existing config found. Creating default dashboard.');
  config = { ...DEFAULT_DASHBOARD_CONFIG, id: userDefaultDashboardId || 'user-dashboard-' + Date.now() }; // Ensure unique ID
  saveConfigToLocalStorage(config);
  
  // Optionally, save this new default to backend if it's a new user without one
  // await saveDashboardConfigAPI(config); 
  
  console.log('[DashboardService] Default dashboard created:', config);
  return config;
};


/**
 * Get available widget metadata
 */
const getAvailableWidgets = (): WidgetMetadata[] => {
  return WIDGET_LIBRARY;
};

/**
 * Add a new widget to the dashboard layout
 * @param currentConfig The current dashboard configuration
 * @param widgetType The type of widget to add
 * @param breakpoint The current responsive breakpoint
 */
const addWidgetToDashboard = (
  currentConfig: DashboardConfig,
  widgetType: WidgetType,
  breakpoint: keyof DashboardBreakpoints = 'lg' // Default to largest for position calculation
): DashboardConfig | null => {
  const widgetMeta = WIDGET_LIBRARY.find(w => w.type === widgetType);
  if (!widgetMeta) {
    console.error(`[DashboardService] Widget type "${widgetType}" not found in library.`);
    return null;
  }

  const newWidgetId = generateWidgetId(widgetType);
  
  let yPos = 0;
  const currentBreakpointLayout = currentConfig.layouts[breakpoint] as DashboardLayout | undefined;
  if (currentBreakpointLayout && currentBreakpointLayout.widgets.length > 0) {
    yPos = Math.max(...currentBreakpointLayout.widgets.map(w => w.position.y + w.position.h));
  }
  
  const newWidgetConfig: WidgetConfig = {
    id: newWidgetId,
    type: widgetType,
    title: widgetMeta.name,
    position: { 
      x: 0, // TODO: Implement smarter positioning (e.g., first available column)
      y: yPos, 
      w: widgetMeta.defaultSize.w, 
      h: widgetMeta.defaultSize.h 
    },
    isVisible: true,
    isLocked: false,
    config: {}, // Default empty config
  };

  const updatedConfig: DashboardConfig = {
    ...currentConfig,
    layouts: {
      ...currentConfig.layouts,
      [breakpoint]: {
        ...(currentConfig.layouts[breakpoint] as DashboardLayout),
        widgets: [...((currentConfig.layouts[breakpoint] as DashboardLayout)?.widgets || []), newWidgetConfig],
      },
    } as Record<keyof DashboardBreakpoints, DashboardLayout>,
    metadata: {
      ...currentConfig.metadata,
      createdAt: currentConfig.metadata?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentConfig.metadata?.createdBy || 'system',
      lastAccessedAt: currentConfig.metadata?.lastAccessedAt,
      accessCount: currentConfig.metadata?.accessCount,
      tags: currentConfig.metadata?.tags,
    }
  };

  // Also add to other breakpoints with default positions
  Object.keys(DASHBOARD_BREAKPOINTS).forEach(bpKey => {
    const bp = bpKey as keyof DashboardBreakpoints;
    if (bp !== breakpoint) {
      if (!updatedConfig.layouts[bp]) { // Initialize if layout for breakpoint doesn't exist
        updatedConfig.layouts[bp] = {
          ...(DEFAULT_LAYOUTS[bp] as DashboardLayout), 
          widgets: [], // Start with empty widgets for this breakpoint
        };
      }
      const targetLayout = updatedConfig.layouts[bp] as DashboardLayout;
      const existingWidget = targetLayout.widgets.find(w => w.id === newWidgetId);
      if (!existingWidget) { // Only add if not already present (e.g. from initial default layout)
         let bpYpos = 0;
         if (targetLayout.widgets.length > 0) {
            bpYpos = Math.max(...targetLayout.widgets.map(w => w.position.y + w.position.h));
         }
        targetLayout.widgets.push({
          ...newWidgetConfig,
          position: { // Adjust position for this breakpoint if needed, or use default
            x: 0, // TODO: Smarter positioning for other breakpoints
            y: bpYpos,
            w: widgetMeta.defaultSize.w, // Or use breakpoint specific default size
            h: widgetMeta.defaultSize.h,
          }
        });
      }
    }
  });


  saveConfigToLocalStorage(updatedConfig);
  // Consider debouncing API save or using a manual save button
  // saveDashboardConfigAPI(updatedConfig); 

  return updatedConfig;
};

/**
 * Remove a widget from the dashboard layout
 * @param currentConfig The current dashboard configuration
 * @param widgetId The ID of the widget to remove
 */
const removeWidgetFromDashboard = (
  currentConfig: DashboardConfig,
  widgetId: string
): DashboardConfig => {
  const updatedConfig: DashboardConfig = { ...currentConfig, layouts: { ...currentConfig.layouts } };

  for (const bp of Object.keys(currentConfig.layouts) as Array<keyof DashboardBreakpoints>) {
    const layout = updatedConfig.layouts[bp] as DashboardLayout | undefined;
    if (layout) {
      layout.widgets = layout.widgets.filter(w => w.id !== widgetId);
    }
  }
  
  updatedConfig.metadata = {
      ...currentConfig.metadata,
      createdAt: currentConfig.metadata?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentConfig.metadata?.createdBy || 'system',
      lastAccessedAt: currentConfig.metadata?.lastAccessedAt,
      accessCount: currentConfig.metadata?.accessCount,
      tags: currentConfig.metadata?.tags,
  };

  saveConfigToLocalStorage(updatedConfig);
  // saveDashboardConfigAPI(updatedConfig);
  return updatedConfig;
};

/**
 * Update widget configuration (e.g., title, specific settings)
 * @param currentConfig The current dashboard configuration
 * @param widgetId The ID of the widget to update
 * @param updates Partial updates to the widget configuration
 */
const updateWidgetConfiguration = (
  currentConfig: DashboardConfig,
  widgetId: string,
  updates: Partial<Omit<WidgetConfig, 'id' | 'type' | 'position'> & { config?: Record<string, any> }>
): DashboardConfig => {
  const updatedConfig: DashboardConfig = { ...currentConfig, layouts: { ...currentConfig.layouts } };

  for (const bp of Object.keys(currentConfig.layouts) as Array<keyof DashboardBreakpoints>) {
    const layout = updatedConfig.layouts[bp] as DashboardLayout | undefined;
    if (layout) {
      layout.widgets = layout.widgets.map(w =>
        w.id === widgetId ? { ...w, ...updates, lastUpdated: new Date().toISOString() } : w
      );
    }
  }

  updatedConfig.metadata = {
      ...currentConfig.metadata,
      createdAt: currentConfig.metadata?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentConfig.metadata?.createdBy || 'system',
      lastAccessedAt: currentConfig.metadata?.lastAccessedAt,
      accessCount: currentConfig.metadata?.accessCount,
      tags: currentConfig.metadata?.tags,
  };
  
  saveConfigToLocalStorage(updatedConfig);
  // saveDashboardConfigAPI(updatedConfig);
  return updatedConfig;
};

/**
 * Update widget positions for a specific breakpoint
 * @param currentConfig The current dashboard configuration
 * @param breakpoint The breakpoint to update
 * @param newLayout The new layout with updated positions (from react-grid-layout)
 */
const updateLayoutForBreakpoint = (
  currentConfig: DashboardConfig,
  breakpoint: keyof DashboardBreakpoints,
  newLayout: Array<{ i: string; x: number; y: number; w: number; h: number }>
): DashboardConfig => {
  let currentBreakpointLayout = currentConfig.layouts[breakpoint] as DashboardLayout | undefined;
  if (!currentBreakpointLayout) {
    console.warn(`[DashboardService] Layout for breakpoint "${breakpoint}" not found. Initializing.`);
    currentConfig.layouts[breakpoint] = {
      ...(DEFAULT_LAYOUTS[breakpoint] || DEFAULT_LAYOUTS.lg) as DashboardLayout, 
      widgets: [],
    };
    currentBreakpointLayout = currentConfig.layouts[breakpoint] as DashboardLayout;
  }
  
  const updatedWidgets = currentBreakpointLayout.widgets.map(widget => {
    const layoutItem = newLayout.find(item => item.i === widget.id);
    if (layoutItem) {
      return {
        ...widget,
        position: {
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        },
        lastUpdated: new Date().toISOString(),
      };
    }
    return widget;
  });

  const updatedConfig: DashboardConfig = {
    ...currentConfig,
    layouts: {
      ...currentConfig.layouts,
      [breakpoint]: {
        ...currentBreakpointLayout,
        widgets: updatedWidgets,
      },
    } as Record<keyof DashboardBreakpoints, DashboardLayout>, 
    metadata: {
        ...currentConfig.metadata,
        createdAt: currentConfig.metadata?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentConfig.metadata?.createdBy || 'system',
        lastAccessedAt: currentConfig.metadata?.lastAccessedAt,
        accessCount: currentConfig.metadata?.accessCount,
        tags: currentConfig.metadata?.tags,
    }
  };
  
  saveConfigToLocalStorage(updatedConfig);
  // saveDashboardConfigAPI(updatedConfig);
  return updatedConfig;
};


/**
 * Get user preferences
 */
const getUserPreferences = (): DashboardPreferences => {
  return loadPreferencesFromLocalStorage();
};

/**
 * Update user preferences
 */
const updateUserPreferences = (prefs: Partial<DashboardPreferences>): DashboardPreferences => {
  const currentPrefs = loadPreferencesFromLocalStorage();
  const newPrefs = { ...currentPrefs, ...prefs };
  savePreferencesToLocalStorage(newPrefs);
  return newPrefs;
};


// ===============================================
// Exported Service Object
// ===============================================

export const dashboardService = {
  initializeDashboard,
  saveDashboard: saveDashboardConfigAPI, // Expose direct API save if needed
  
  getAvailableWidgets,
  addWidget: addWidgetToDashboard,
  removeWidget: removeWidgetFromDashboard,
  updateWidgetConfig: updateWidgetConfiguration,
  updateLayout: updateLayoutForBreakpoint,

  getUserPreferences,
  updateUserPreferences,

  // For debugging or advanced scenarios
  _loadConfigFromLocalStorage: loadConfigFromLocalStorage,
  _saveConfigToLocalStorage: saveConfigToLocalStorage,
  _fetchConfigAPI: fetchDashboardConfigAPI,
  _generateWidgetId: generateWidgetId,
};

// Initialize default preferences if none exist
if (!localStorage.getItem(USER_PREFERENCES_KEY)) {
  savePreferencesToLocalStorage(DEFAULT_DASHBOARD_PREFERENCES);
} 