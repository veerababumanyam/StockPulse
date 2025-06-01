/**
 * Enhanced useTheme Hook - Enterprise-Grade Theme Management
 * 
 * Provides comprehensive theme management with AI recommendations,
 * analytics, auto-switching, and advanced features.
 * 
 * @example
 * Basic usage:
 * ```typescript
 * const { mode, colorTheme, setTheme, toggleMode } = useTheme();
 * ```
 * 
 * @example
 * Advanced usage with all features:
 * ```typescript
 * const themeHook = useTheme({
 *   enableRecommendations: true,
 *   enableAnalytics: true,
 *   autoSave: true
 * });
 * 
 * // Access theme state
 * const { mode, colorTheme, isDark, isTransitioning } = themeHook;
 * 
 * // Use theme actions
 * await themeHook.setTheme('cyber-neon', 'dark');
 * await themeHook.toggleMode();
 * 
 * // Access advanced features
 * const recommendations = themeHook.recommendations;
 * const analytics = themeHook.analytics;
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { themeEngine, type ThemeState, type ThemeRecommendation } from '../theme/themeEngine';
import { getAllThemeKeys, getAllThemeMetadata, type ColorTheme, type ThemeMode } from '../theme/colorPalettes';
import type { ThemeVariant } from '../theme/themeComposer';

// Hook configuration options
export interface UseThemeOptions {
  enableRecommendations?: boolean;
  enableAnalytics?: boolean;
  enableAutoSwitch?: boolean;
  autoSave?: boolean;
  context?: string;
}

// Enhanced return type with all features
export interface UseThemeReturn {
  // Core theme state
  mode: ThemeMode;
  colorTheme: ColorTheme;
  variant: ThemeVariant;
  isDark: boolean;
  isTransitioning: boolean;
  
  // Core theme actions
  setTheme: (colorTheme: ColorTheme, mode?: ThemeMode, variant?: ThemeVariant) => Promise<boolean>;
  setMode: (mode: ThemeMode) => Promise<boolean>;
  setColorTheme: (colorTheme: ColorTheme) => Promise<boolean>;
  setVariant: (variant: ThemeVariant) => Promise<boolean>;
  toggleMode: () => Promise<boolean>;
  
  // Advanced features
  recommendations: ThemeRecommendation[];
  analytics: any;
  autoSwitch: () => Promise<boolean>;
  
  // Utility functions
  getAvailableThemes: () => ColorTheme[];
  getThemeMetadata: () => Record<ColorTheme, any>;
  resetToDefault: () => Promise<boolean>;
  
  // Data management
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<boolean>;
  
  // State information
  lastChanged: number;
  engineReady: boolean;
}

/**
 * Enhanced useTheme hook with comprehensive theme management
 */
export const useTheme = (options: UseThemeOptions = {}): UseThemeReturn => {
  const {
    enableRecommendations = false,
    enableAnalytics = false,
    enableAutoSwitch = false,
    autoSave = true,
    context = 'general'
  } = options;

  // Internal state
  const [themeState, setThemeState] = useState<ThemeState>(() => themeEngine.getState());
  const [recommendations, setRecommendations] = useState<ThemeRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [engineReady, setEngineReady] = useState(false);

  // Subscribe to theme engine state changes
  useEffect(() => {
    const unsubscribe = themeEngine.subscribe((newState) => {
      setThemeState(newState);
    });

    // Mark engine as ready
    setEngineReady(true);

    return unsubscribe;
  }, []);

  // Load recommendations when enabled
  useEffect(() => {
    if (enableRecommendations && engineReady) {
      const loadRecommendations = async () => {
        try {
          const recs = await themeEngine.getRecommendations();
          setRecommendations(recs);
        } catch (error) {
          console.error('Failed to load theme recommendations:', error);
          setRecommendations([]);
        }
      };

      loadRecommendations();
      
      // Refresh recommendations periodically
      const interval = setInterval(loadRecommendations, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [enableRecommendations, engineReady, themeState.colorTheme, themeState.mode]);

  // Load analytics when enabled
  useEffect(() => {
    if (enableAnalytics && engineReady) {
      const loadAnalytics = async () => {
        try {
          const analyticsData = await themeEngine.getAnalytics();
          setAnalytics(analyticsData);
        } catch (error) {
          console.error('Failed to load theme analytics:', error);
          setAnalytics(null);
        }
      };

      loadAnalytics();
      
      // Refresh analytics periodically
      const interval = setInterval(loadAnalytics, 10 * 60 * 1000); // 10 minutes
      return () => clearInterval(interval);
    }
  }, [enableAnalytics, engineReady]);

  // Auto-switch functionality
  useEffect(() => {
    if (enableAutoSwitch && engineReady) {
      const autoSwitchInterval = setInterval(async () => {
        try {
          await themeEngine.autoSwitchTheme();
        } catch (error) {
          console.error('Auto-switch failed:', error);
        }
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(autoSwitchInterval);
    }
  }, [enableAutoSwitch, engineReady]);

  // Core theme actions with context tracking
  const setTheme = useCallback(async (
    colorTheme: ColorTheme, 
    mode?: ThemeMode, 
    variant?: ThemeVariant
  ): Promise<boolean> => {
    try {
      return await themeEngine.applyTheme(
        colorTheme,
        mode || themeState.mode,
        variant || themeState.variant,
        context
      );
    } catch (error) {
      console.error('Failed to set theme:', error);
      return false;
    }
  }, [themeState.mode, themeState.variant, context]);

  const setMode = useCallback(async (mode: ThemeMode): Promise<boolean> => {
    return setTheme(themeState.colorTheme, mode, themeState.variant);
  }, [setTheme, themeState.colorTheme, themeState.variant]);

  const setColorTheme = useCallback(async (colorTheme: ColorTheme): Promise<boolean> => {
    return setTheme(colorTheme, themeState.mode, themeState.variant);
  }, [setTheme, themeState.mode, themeState.variant]);

  const setVariant = useCallback(async (variant: ThemeVariant): Promise<boolean> => {
    return setTheme(themeState.colorTheme, themeState.mode, variant);
  }, [setTheme, themeState.colorTheme, themeState.mode]);

  const toggleMode = useCallback(async (): Promise<boolean> => {
    try {
      return await themeEngine.toggleMode();
    } catch (error) {
      console.error('Failed to toggle mode:', error);
      return false;
    }
  }, []);

  // Advanced actions
  const autoSwitch = useCallback(async (): Promise<boolean> => {
    try {
      return await themeEngine.autoSwitchTheme();
    } catch (error) {
      console.error('Failed to auto-switch theme:', error);
      return false;
    }
  }, []);

  const resetToDefault = useCallback(async (): Promise<boolean> => {
    try {
      return await themeEngine.resetToDefault();
    } catch (error) {
      console.error('Failed to reset to default theme:', error);
      return false;
    }
  }, []);

  // Data management
  const exportData = useCallback(async (): Promise<string> => {
    try {
      return await themeEngine.exportThemeData();
    } catch (error) {
      console.error('Failed to export theme data:', error);
      return '';
    }
  }, []);

  const importData = useCallback(async (data: string): Promise<boolean> => {
    try {
      return await themeEngine.importThemeData(data);
    } catch (error) {
      console.error('Failed to import theme data:', error);
      return false;
    }
  }, []);

  // Utility functions (memoized for performance)
  const getAvailableThemes = useMemo(() => {
    return () => getAllThemeKeys();
  }, []);

  const getThemeMetadata = useMemo(() => {
    return () => getAllThemeMetadata();
  }, []);

  // Return comprehensive interface
  return {
    // Core state
    mode: themeState.mode,
    colorTheme: themeState.colorTheme,
    variant: themeState.variant,
    isDark: themeState.isDark,
    isTransitioning: themeState.isTransitioning,
    
    // Core actions
    setTheme,
    setMode,
    setColorTheme,
    setVariant,
    toggleMode,
    
    // Advanced features
    recommendations: enableRecommendations ? recommendations : [],
    analytics: enableAnalytics ? analytics : null,
    autoSwitch,
    
    // Utilities
    getAvailableThemes,
    getThemeMetadata,
    resetToDefault,
    
    // Data management
    exportData,
    importData,
    
    // State info
    lastChanged: themeState.lastChanged,
    engineReady,
  };
};

// Legacy compatibility export
export type ThemeMode = import('../theme/colorPalettes').ThemeMode;
export type ColorTheme = import('../theme/colorPalettes').ColorTheme;

export default useTheme;
