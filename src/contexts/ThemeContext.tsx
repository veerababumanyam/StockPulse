/**
 * Enhanced ThemeContext - Unified Provider Using Central ThemeEngine
 * Simplified, high-performance theme context that delegates to ThemeEngine
 * Eliminates storage and application logic overlaps
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { ThemeMode, ColorTheme, ThemeContextType } from '../types/theme';
import { themeEngine, type ThemeState } from '../theme/themeEngine';
import type { ThemeVariant } from '../theme/themeComposer';

// Enhanced context interface aligned with ThemeEngine
interface EnhancedThemeContextType extends ThemeContextType {
  variant: ThemeVariant;
  isTransitioning: boolean;
  setVariant: (variant: ThemeVariant) => Promise<boolean>;
  lastChanged: number;
  engineReady: boolean;
}

const ThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  config?: {
    enableAnalytics?: boolean;
    enableStorage?: boolean;
    enableCrossTabSync?: boolean;
    enableRecommendations?: boolean;
  };
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children,
  config = {}
}) => {
  // State synchronized with ThemeEngine
  const [themeState, setThemeState] = useState<ThemeState>(() => themeEngine.getState());
  const [engineReady, setEngineReady] = useState(false);

  // Subscribe to ThemeEngine state changes
  useEffect(() => {
    const unsubscribe = themeEngine.subscribe((newState) => {
      setThemeState(newState);
    });

    // Mark engine as ready
    setEngineReady(true);

    return unsubscribe;
  }, []);

  // Configure ThemeEngine based on provider config
  useEffect(() => {
    if (engineReady && config) {
      // Engine configuration is handled in constructor
      console.log('🎨 ThemeProvider: Engine configured and ready');
    }
  }, [engineReady, config]);

  // Simplified theme actions that delegate to ThemeEngine
  const setMode = async (newMode: ThemeMode): Promise<void> => {
    try {
      await themeEngine.applyTheme(
        themeState.colorTheme,
        newMode,
        themeState.variant,
        'context'
      );
    } catch (error) {
      console.error('Failed to set mode via context:', error);
    }
  };

  const setColorTheme = async (newColorTheme: ColorTheme): Promise<void> => {
    try {
      await themeEngine.applyTheme(
        newColorTheme,
        themeState.mode,
        themeState.variant,
        'context'
      );
    } catch (error) {
      console.error('Failed to set color theme via context:', error);
    }
  };

  const setVariant = async (newVariant: ThemeVariant): Promise<boolean> => {
    try {
      return await themeEngine.applyTheme(
        themeState.colorTheme,
        themeState.mode,
        newVariant,
        'context'
      );
    } catch (error) {
      console.error('Failed to set variant via context:', error);
      return false;
    }
  };

  const toggleMode = async (): Promise<void> => {
    try {
      await themeEngine.toggleMode();
    } catch (error) {
      console.error('Failed to toggle mode via context:', error);
    }
  };

  // Context value with enhanced functionality
  const contextValue: EnhancedThemeContextType = {
    // Core theme state from engine
    mode: themeState.mode,
    isDark: themeState.isDark,
    colorTheme: themeState.colorTheme,
    variant: themeState.variant,
    isTransitioning: themeState.isTransitioning,
    
    // Actions that delegate to engine
    setMode,
    setColorTheme,
    setVariant,
    toggleMode,
    
    // Engine state
    lastChanged: themeState.lastChanged,
    engineReady,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Enhanced useTheme hook that uses the context
 * This provides the same interface as the standalone useTheme but via context
 */
export const useTheme = (): EnhancedThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Higher-order component for theme injection
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };

  WrappedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Theme-aware wrapper component
 */
interface ThemeWrapperProps {
  children: ReactNode;
  className?: string;
  applyThemeClasses?: boolean;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({
  children,
  className = '',
  applyThemeClasses = true
}) => {
  const { colorTheme, isDark, isTransitioning } = useTheme();

  const themeClasses = applyThemeClasses 
    ? `theme-${colorTheme} ${isDark ? 'dark' : 'light'} ${isTransitioning ? 'transitioning' : ''}`
    : '';

  return (
    <div className={`${themeClasses} ${className}`.trim()}>
      {children}
    </div>
  );
};

/**
 * Theme debug component for development
 */
export const ThemeDebugger: React.FC = () => {
  const theme = useTheme();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-2 bg-black bg-opacity-75 text-white text-xs font-mono rounded z-50">
      <div>Theme: {theme.colorTheme}</div>
      <div>Mode: {theme.mode}</div>
      <div>Variant: {theme.variant}</div>
      <div>Dark: {theme.isDark ? 'Yes' : 'No'}</div>
      <div>Transitioning: {theme.isTransitioning ? 'Yes' : 'No'}</div>
      <div>Engine Ready: {theme.engineReady ? 'Yes' : 'No'}</div>
      <div>Last Changed: {new Date(theme.lastChanged).toLocaleTimeString()}</div>
    </div>
  );
};

export default ThemeProvider;
