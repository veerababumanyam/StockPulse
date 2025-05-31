/**
 * Enhanced ThemeContext - Enterprise-grade Theme Provider for StockPulse
 * Performance-optimized, mobile-friendly, accessible theme management
 * with smooth transitions, haptic feedback, and advanced UX patterns
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import { colorPalettes } from "../theme/colorPalettes";
import { 
  ThemeMode, 
  ColorTheme, 
  ThemeContextType, 
  ThemeMetadata,
  THEME_STORAGE_KEYS,
  DEFAULT_THEME_CONFIG,
  getThemeMetadata,
  isDarkDominantTheme
} from "../types/theme";

// Enhanced configuration interface
interface ThemeProviderConfig {
  transitionDuration?: number;
  enableHaptics?: boolean;
  enablePreloading?: boolean;
  enableAnimations?: boolean;
  enableSystemSync?: boolean;
  enableAnnouncements?: boolean;
  debounceMs?: number;
  enableMigration?: boolean;
}

// Enhanced context interface
interface EnhancedThemeContextType extends ThemeContextType {
  isTransitioning: boolean;
  isLoading: boolean;
  config: Required<ThemeProviderConfig>;
  preloadTheme: (theme: ColorTheme) => Promise<void>;
  resetToDefault: () => void;
  validateTheme: (theme: ColorTheme) => boolean;
  getSystemTheme: () => 'light' | 'dark';
}

// Default configuration
const DEFAULT_PROVIDER_CONFIG: Required<ThemeProviderConfig> = {
  transitionDuration: 250,
  enableHaptics: true,
  enablePreloading: true,
  enableAnimations: true,
  enableSystemSync: true,
  enableAnnouncements: true,
  debounceMs: 100,
  enableMigration: true,
};

// Create context with enhanced default values
const ThemeContext = createContext<EnhancedThemeContextType>({
  mode: "system",
  colorTheme: "default",
  setMode: () => {},
  setColorTheme: () => {},
  toggleMode: () => {},
  getThemeMetadata: (theme: ColorTheme) => getThemeMetadata(theme),
  isDarkMode: false,
  isSystemMode: true,
  isTransitioning: false,
  isLoading: false,
  config: DEFAULT_PROVIDER_CONFIG,
  preloadTheme: async () => {},
  resetToDefault: () => {},
  validateTheme: () => true,
  getSystemTheme: () => 'light',
});

// Custom hook to use the enhanced theme context
export const useTheme = () => useContext(ThemeContext);

// Cache for performance optimizations
let domRootCache: HTMLElement | null = null;
let systemThemeCache: { value: 'light' | 'dark'; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds

// Get cached DOM root
const getDOMRoot = (): HTMLElement => {
  if (!domRootCache) {
    domRootCache = document.documentElement;
  }
  return domRootCache;
};

// Cached system theme detection
const getCachedSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  // Use cache if recent
  if (systemThemeCache && Date.now() - systemThemeCache.timestamp < CACHE_DURATION) {
    return systemThemeCache.value;
  }
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = prefersDark ? 'dark' : 'light';
  
  // Update cache
  systemThemeCache = { value: theme, timestamp: Date.now() };
  
  return theme;
};

// Check accessibility preferences
const getAccessibilityPreferences = () => ({
  prefersReducedMotion: typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false,
  prefersHighContrast: typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-contrast: high)').matches 
    : false,
});

// Haptic feedback for mobile devices
const triggerHapticFeedback = (enabled: boolean): void => {
  if (!enabled || typeof navigator === 'undefined') return;
  
  try {
    // Modern Vibration API
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short, subtle feedback
    }
  } catch (error) {
    // Silently fail if haptics not supported
    console.debug('Haptic feedback not available:', error);
  }
};

// Screen reader announcements
const announceThemeChange = (theme: ColorTheme, isDark: boolean, enabled: boolean): void => {
  if (!enabled || typeof window === 'undefined') return;
  
  try {
    if ('speechSynthesis' in window) {
      const message = `Theme switched to ${theme} ${isDark ? 'dark' : 'light'} mode`;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = 0; // Silent announcement for screen readers
      speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.debug('Screen reader announcement failed:', error);
  }
};

// Enhanced theme validation with comprehensive checks
const validateStoredTheme = (enableMigration: boolean): {
  mode: ThemeMode;
  colorTheme: ColorTheme;
  migrated: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (typeof window === 'undefined') {
    return { mode: 'system', colorTheme: 'default', migrated: false, errors };
  }
  
  try {
    // Check for migration if enabled
    const storedVersion = localStorage.getItem(THEME_STORAGE_KEYS.CACHE_VERSION);
    const needsMigration = enableMigration && (!storedVersion || storedVersion !== '2.0');
    
    // Get and validate stored values
    const storedMode = localStorage.getItem(THEME_STORAGE_KEYS.MODE);
    const storedColorTheme = localStorage.getItem(THEME_STORAGE_KEYS.COLOR_THEME);
    
    // Validate theme mode
    const validModes: ThemeMode[] = ['light', 'dark', 'system'];
    const validMode = storedMode && validModes.includes(storedMode as ThemeMode) 
      ? storedMode as ThemeMode 
      : 'system';
      
    if (storedMode && validMode !== storedMode) {
      errors.push(`Invalid theme mode: ${storedMode}`);
    }
    
    // Validate color theme
    const validColorTheme = storedColorTheme && colorPalettes[storedColorTheme as ColorTheme]
      ? storedColorTheme as ColorTheme
      : 'default';
      
    if (storedColorTheme && validColorTheme !== storedColorTheme) {
      errors.push(`Invalid color theme: ${storedColorTheme}`);
    }
    
    // Perform migration if needed
    if (needsMigration) {
      localStorage.setItem(THEME_STORAGE_KEYS.CACHE_VERSION, '2.0');
    }
    
    return { 
      mode: validMode, 
      colorTheme: validColorTheme, 
      migrated: needsMigration,
      errors
    };
  } catch (error) {
    errors.push(`Storage error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { mode: 'system', colorTheme: 'default', migrated: false, errors };
  }
};

// Batched DOM update function with requestAnimationFrame
const createBatchedThemeApplier = (config: Required<ThemeProviderConfig>) => {
  let pendingUpdate: number | null = null;
  
  return (colorTheme: ColorTheme, isDark: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Cancel any pending update
      if (pendingUpdate !== null) {
        cancelAnimationFrame(pendingUpdate);
      }
      
      // Schedule batched update
      pendingUpdate = requestAnimationFrame(() => {
        try {
          const root = getDOMRoot();
          const { prefersReducedMotion } = getAccessibilityPreferences();
          
          // Add transition class if animations enabled
          if (config.enableAnimations && !prefersReducedMotion) {
            root.classList.add('theme-transitioning');
            root.style.setProperty('--theme-transition-duration', `${config.transitionDuration}ms`);
          }
          
          // Batch all DOM updates
          const updates = () => {
            // Update classes
            root.classList.remove('light', 'dark');
            root.classList.add(isDark ? 'dark' : 'light');
            
            // Update data attributes
            root.setAttribute('data-theme', isDark ? 'dark' : 'light');
            root.setAttribute('data-color-theme', colorTheme);
            root.setAttribute('data-theme-category', getThemeMetadata(colorTheme).category.toLowerCase());
            
            // Apply color palette CSS variables
            const palette = colorPalettes[colorTheme]?.[isDark ? 'dark' : 'light'];
            
            if (palette) {
              Object.entries(palette).forEach(([property, value]) => {
                if (typeof value === 'string') {
                  root.style.setProperty(property, value);
                }
              });
            }
          };
          
          // Apply updates
          updates();
          
          // Remove transitioning class after animation
          if (config.enableAnimations && !prefersReducedMotion) {
            setTimeout(() => {
              root.classList.remove('theme-transitioning');
              resolve();
            }, config.transitionDuration);
          } else {
            resolve();
          }
          
          pendingUpdate = null;
        } catch (error) {
          pendingUpdate = null;
          reject(error);
        }
      });
    });
  };
};

// Debounced function creator
const createDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => Promise<void>) => {
  let timeoutId: number;
  
  return (...args: Parameters<T>) => {
    return new Promise<void>((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(async () => {
        try {
          await func.apply(null, args);
          resolve();
        } catch (error) {
          console.error('Debounced function error:', error);
          resolve();
        }
      }, delay);
    });
  };
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  defaultColorTheme?: ColorTheme;
  config?: Partial<ThemeProviderConfig>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = DEFAULT_THEME_CONFIG.mode,
  defaultColorTheme = DEFAULT_THEME_CONFIG.colorTheme,
  config: userConfig = {},
}) => {
  // Merge configuration
  const config = useMemo(() => ({ 
    ...DEFAULT_PROVIDER_CONFIG, 
    ...userConfig 
  }), [userConfig]);
  
  // State management
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(defaultColorTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  
  // Refs for cleanup and performance
  const cleanupRef = useRef<(() => void)[]>([]);
  const transitionTimeoutRef = useRef<number>();
  
  // Memoized computed values
  const isDarkMode = useMemo(
    () => mode === "dark" || (mode === "system" && systemTheme === 'dark'),
    [mode, systemTheme]
  );
  
  const isSystemMode = useMemo(() => mode === "system", [mode]);
  
  // Memoized utility functions
  const validateTheme = useCallback((theme: ColorTheme): boolean => {
    return theme in colorPalettes;
  }, []);
  
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    return getCachedSystemTheme();
  }, []);
  
  // Memoized batched theme applier
  const batchedApplyTheme = useMemo(
    () => createBatchedThemeApplier(config),
    [config]
  );
  
  // Debounced theme application
  const debouncedApplyTheme = useMemo(
    () => createDebounce(batchedApplyTheme, config.debounceMs),
    [batchedApplyTheme, config.debounceMs]
  );
  
  // Theme preloading function
  const preloadTheme = useCallback(async (theme: ColorTheme): Promise<void> => {
    if (!config.enablePreloading || !validateTheme(theme)) return;
    
    try {
      const palette = colorPalettes[theme];
      if (palette) {
        // Create temporary style element for preloading
        const preloadStyle = document.createElement('style');
        preloadStyle.setAttribute('data-theme-preload', theme);
        
        const lightVars = Object.entries(palette.light)
          .map(([prop, value]) => `${prop}: ${value}`)
          .join('; ');
        const darkVars = Object.entries(palette.dark)
          .map(([prop, value]) => `${prop}: ${value}`)
          .join('; ');
        
        preloadStyle.textContent = `
          :root.preload-light-${theme} { ${lightVars} }
          :root.preload-dark-${theme} { ${darkVars} }
        `;
        
        document.head.appendChild(preloadStyle);
        
        // Remove after short delay
        setTimeout(() => {
          if (document.head.contains(preloadStyle)) {
            document.head.removeChild(preloadStyle);
          }
        }, 100);
      }
    } catch (error) {
      console.debug('Theme preloading failed:', error);
    }
  }, [config.enablePreloading, validateTheme]);
  
  // Reset to default function
  const resetToDefault = useCallback(() => {
    try {
      // Clear storage
      Object.values(THEME_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Reset state
      setModeState(defaultMode);
      setColorThemeState(defaultColorTheme);
      
      // Trigger haptic feedback
      triggerHapticFeedback(config.enableHaptics);
      
      // Announce change
      announceThemeChange(defaultColorTheme, false, config.enableAnnouncements);
    } catch (error) {
      console.warn('Failed to reset theme:', error);
    }
  }, [defaultMode, defaultColorTheme, config.enableHaptics, config.enableAnnouncements]);
  
  // Enhanced setMode with error handling and optimizations
  const setMode = useCallback(async (newMode: ThemeMode) => {
    if (newMode === mode) return;
    
    setIsTransitioning(true);
    
    try {
      // Persist to storage
      localStorage.setItem(THEME_STORAGE_KEYS.MODE, newMode);
      
      // Update state
      setModeState(newMode);
      
      // Determine resolved theme
      const resolvedIsDark = newMode === 'dark' || (newMode === 'system' && systemTheme === 'dark');
      
      // Apply theme with transition
      await debouncedApplyTheme(colorTheme, resolvedIsDark);
      
      // Trigger feedback
      triggerHapticFeedback(config.enableHaptics);
      announceThemeChange(colorTheme, resolvedIsDark, config.enableAnnouncements);
      
    } catch (error) {
      console.error('Failed to set theme mode:', error);
    } finally {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
      }, config.transitionDuration);
    }
  }, [mode, systemTheme, colorTheme, debouncedApplyTheme, config]);
  
  // Enhanced setColorTheme with validation and optimization
  const setColorTheme = useCallback(async (newColorTheme: ColorTheme) => {
    if (newColorTheme === colorTheme) return;
    
    // Validate theme
    if (!validateTheme(newColorTheme)) {
      console.warn(`Invalid color theme: ${newColorTheme}, falling back to default`);
      newColorTheme = 'default';
    }
    
    setIsTransitioning(true);
    
    try {
      // Persist to storage
      localStorage.setItem(THEME_STORAGE_KEYS.COLOR_THEME, newColorTheme);
      
      // Update state
      setColorThemeState(newColorTheme);
      
      // Apply theme with transition
      await debouncedApplyTheme(newColorTheme, isDarkMode);
      
      // Trigger feedback
      triggerHapticFeedback(config.enableHaptics);
      announceThemeChange(newColorTheme, isDarkMode, config.enableAnnouncements);
      
    } catch (error) {
      console.error('Failed to set color theme:', error);
    } finally {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
      }, config.transitionDuration);
    }
  }, [colorTheme, isDarkMode, validateTheme, debouncedApplyTheme, config]);
  
  // Enhanced toggle with preloading
  const toggleMode = useCallback(async () => {
    const nextMode: ThemeMode = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    
    // Preload the target theme
    if (config.enablePreloading) {
      await preloadTheme(colorTheme);
    }
    
    await setMode(nextMode);
  }, [mode, colorTheme, setMode, preloadTheme, config.enablePreloading]);
  
  // Get theme metadata function
  const getThemeMetadataFunction = useCallback((theme: ColorTheme): ThemeMetadata => {
    return getThemeMetadata(theme);
  }, []);
  
  // Initialize theme on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Validate and migrate stored theme
        const { mode: storedMode, colorTheme: storedColorTheme, migrated, errors } = 
          validateStoredTheme(config.enableMigration);
        
        if (errors.length > 0) {
          console.warn('Theme validation errors:', errors);
        }
        
        // Get current system theme
        const currentSystemTheme = getCachedSystemTheme();
        
        // Update state
        setModeState(storedMode);
        setColorThemeState(storedColorTheme);
        setSystemTheme(currentSystemTheme);
        
        // Apply initial theme
        const initialIsDark = storedMode === 'dark' || (storedMode === 'system' && currentSystemTheme === 'dark');
        await batchedApplyTheme(storedColorTheme, initialIsDark);
        
        // Announce migration if occurred
        if (migrated) {
          console.info('Theme preferences migrated to version 2.0');
        }
        
        // Preload opposite theme for faster switching
        if (config.enablePreloading) {
          setTimeout(() => preloadTheme(storedColorTheme), 1000);
        }
        
      } catch (error) {
        console.error('Theme initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [batchedApplyTheme, preloadTheme, config]);
  
  // System theme synchronization
  useEffect(() => {
    if (!config.enableSystemSync || typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = async (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      
      // Update cache
      systemThemeCache = { value: newSystemTheme, timestamp: Date.now() };
      
      setSystemTheme(newSystemTheme);
      
      // Apply change if using system theme
      if (mode === 'system') {
        setIsTransitioning(true);
        
        try {
          await debouncedApplyTheme(colorTheme, newSystemTheme === 'dark');
          announceThemeChange(colorTheme, newSystemTheme === 'dark', config.enableAnnouncements);
        } catch (error) {
          console.error('System theme change failed:', error);
        } finally {
          setTimeout(() => setIsTransitioning(false), config.transitionDuration);
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Store cleanup function
    const cleanup = () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    cleanupRef.current.push(cleanup);
    
    return cleanup;
  }, [mode, colorTheme, debouncedApplyTheme, config]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      clearTimeout(transitionTimeoutRef.current);
      
      // Run all cleanup functions
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current = [];
    };
  }, []);
  
  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo((): EnhancedThemeContextType => ({
    mode,
    colorTheme,
    setMode,
    setColorTheme,
    toggleMode,
    getThemeMetadata: getThemeMetadataFunction,
    isDarkMode,
    isSystemMode,
    isTransitioning,
    isLoading,
    config,
    preloadTheme,
    resetToDefault,
    validateTheme,
    getSystemTheme,
  }), [
    mode,
    colorTheme,
    setMode,
    setColorTheme,
    toggleMode,
    getThemeMetadataFunction,
    isDarkMode,
    isSystemMode,
    isTransitioning,
    isLoading,
    config,
    preloadTheme,
    resetToDefault,
    validateTheme,
    getSystemTheme,
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export types for external use
export type { ThemeMode, ColorTheme, ThemeProviderConfig, EnhancedThemeContextType };

export default ThemeContext;
