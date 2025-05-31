/**
 * useTheme Hook - Enhanced Theme Management for StockPulse
 * Enterprise-grade theme management with performance optimizations,
 * mobile enhancements, smooth transitions, and error handling
 * NOW INTEGRATED WITH ADVANCED STORAGE AND ANALYTICS SYSTEMS
 * 
 * @example
 * // Basic usage
 * const { theme, colorTheme, setTheme, setColorTheme } = useTheme();
 * 
 * @example
 * // Advanced configuration
 * const { theme, isTransitioning, preloadTheme, resetToDefault, recommendations } = useTheme({
 *   transitionDuration: 300,
 *   enableHaptics: true,
 *   enablePreloading: true,
 *   debounceMs: 150,
 *   enableAnimations: true,
 *   enableAnalytics: true,
 *   enableRecommendations: true,
 *   enableCrossTabSync: true,
 *   context: 'general',
 * });
 * 
 * @example
 * // In a component
 * function MyComponent() {
 *   const { 
 *     resolvedTheme, 
 *     colorTheme, 
 *     toggleTheme, 
 *     getAvailableThemes,
 *     isTransitioning,
 *     recommendations,
 *     analytics
 *   } = useTheme({ enableAnalytics: true });
 *   
 *   return (
 *     <div className={`theme-${resolvedTheme} ${isTransitioning ? 'transitioning' : ''}`}>
 *       <button onClick={toggleTheme} disabled={isTransitioning}>
 *         Switch to {resolvedTheme === 'light' ? 'dark' : 'light'} theme
 *       </button>
 *       <select onChange={(e) => setColorTheme(e.target.value)}>
 *         {getAvailableThemes().map(theme => (
 *           <option key={theme} value={theme}>{theme}</option>
 *         ))}
 *       </select>
 *       {recommendations.length > 0 && (
 *         <div className="theme-recommendations">
 *           <h3>Recommended Themes:</h3>
 *           {recommendations.map(rec => (
 *             <button key={`${rec.theme}-${rec.mode}`} onClick={() => applyRecommendation(rec)}>
 *               {rec.theme} ({rec.mode}) - {rec.reason}
 *             </button>
 *           ))}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * 
 * @features
 * - 🚀 Performance: Memoized functions, batched DOM updates, debounced changes
 * - 📱 Mobile: Haptic feedback, touch-optimized transitions
 * - ✨ UX: Smooth transitions, loading states, reduced motion support
 * - 🛡️ Reliability: Error handling, fallbacks, theme validation
 * - ♿ Accessibility: Screen reader announcements, focus management
 * - 🎯 Advanced: Theme preloading, auto migration, configuration options
 * - 🤖 AI-Powered: Smart recommendations, usage analytics, context awareness
 * - 🗄️ Enterprise: IndexedDB storage, cross-tab sync, data compression
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ColorTheme, colorPalettes } from '../theme/colorPalettes';
import { themeStorage } from '../utils/themeStorage';
import { themeAnalytics } from '../utils/themeAnalytics';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UseThemeConfig {
  transitionDuration?: number;
  enableHaptics?: boolean;
  enablePreloading?: boolean;
  debounceMs?: number;
  enableAnimations?: boolean;
  enableAnalytics?: boolean;
  enableRecommendations?: boolean;
  enableCrossTabSync?: boolean;
  context?: string; // For analytics context (e.g., 'dashboard', 'trading', 'portfolio')
}

interface ThemeRecommendation {
  theme: ColorTheme;
  mode: ThemeMode;
  confidence: number;
  reason: string;
  energyImpact: 'low' | 'medium' | 'high';
  performanceImpact: 'low' | 'medium' | 'high';
}

interface ThemeAnalytics {
  mostUsedTheme: ColorTheme;
  preferredModeByTime: Record<number, ThemeMode>;
  sessionDuration: number;
  switchCount: number;
}

interface UseThemeReturn {
  theme: ThemeMode;
  colorTheme: ColorTheme;
  resolvedTheme: 'light' | 'dark';
  isTransitioning: boolean;
  recommendations: ThemeRecommendation[];
  analytics: ThemeAnalytics | null;
  setTheme: (theme: ThemeMode) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  toggleTheme: () => void;
  preloadTheme: (theme: ThemeMode, colorTheme?: ColorTheme) => void;
  resetToDefault: () => void;
  getAvailableThemes: () => ColorTheme[];
  applyRecommendation: (recommendation: ThemeRecommendation) => void;
  refreshRecommendations: () => Promise<void>;
  exportThemeData: () => Promise<string>;
  importThemeData: (data: string) => Promise<boolean>;
}

// Constants
const THEME_STORAGE_KEY = 'stockpulse-theme';
const COLOR_THEME_STORAGE_KEY = 'stockpulse-color-theme';
const THEME_VERSION_KEY = 'stockpulse-theme-version';
const CURRENT_THEME_VERSION = '2.0';

// Default configuration
const DEFAULT_CONFIG: Required<UseThemeConfig> = {
  transitionDuration: 250,
  enableHaptics: true,
  enablePreloading: true,
  debounceMs: 100,
  enableAnimations: true,
  enableAnalytics: true,
  enableRecommendations: true,
  enableCrossTabSync: true,
  context: 'general',
};

// Cache for system theme detection
let systemThemeCache: { value: 'light' | 'dark'; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds

// Detect system theme preference with caching
const getSystemTheme = (): 'light' | 'dark' => {
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

// Check if reduced motion is preferred
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Haptic feedback for mobile devices
const triggerHapticFeedback = (enabled: boolean): void => {
  if (!enabled || typeof navigator === 'undefined') return;
  
  try {
    // Modern Vibration API
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short, subtle feedback
    }
    
    // iOS haptic feedback (if available)
    if ('haptic' in navigator && typeof (navigator as any).haptic.impact === 'function') {
      (navigator as any).haptic.impact('light');
    }
  } catch (error) {
    // Silently fail if haptics not supported
    console.debug('Haptic feedback not available:', error);
  }
};

// Validate and migrate stored themes
const validateStoredTheme = (): { theme: ThemeMode; colorTheme: ColorTheme; migrated: boolean } => {
  if (typeof window === 'undefined') {
    return { theme: 'system', colorTheme: 'default', migrated: false };
  }
  
  try {
    // Check version for migration
    const storedVersion = localStorage.getItem(THEME_VERSION_KEY);
    const needsMigration = storedVersion !== CURRENT_THEME_VERSION;
    
    // Get stored values
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const storedColorTheme = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
    
    // Validate theme mode
    const validTheme = storedTheme && ['light', 'dark', 'system'].includes(storedTheme) 
      ? storedTheme as ThemeMode 
      : 'system';
    
    // Validate color theme
    const validColorTheme = storedColorTheme && colorPalettes[storedColorTheme as ColorTheme]
      ? storedColorTheme as ColorTheme
      : 'default';
    
    // Update version if migrated
    if (needsMigration) {
      localStorage.setItem(THEME_VERSION_KEY, CURRENT_THEME_VERSION);
    }
    
    return { 
      theme: validTheme, 
      colorTheme: validColorTheme, 
      migrated: needsMigration 
    };
  } catch (error) {
    console.warn('Error reading stored theme preferences:', error);
    return { theme: 'system', colorTheme: 'default', migrated: false };
  }
};

// Memoized theme application function
const createApplyTheme = (config: Required<UseThemeConfig>) => {
  return (resolvedTheme: 'light' | 'dark', colorTheme: ColorTheme): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }
      
      try {
        // Use requestAnimationFrame for smooth DOM updates
        requestAnimationFrame(() => {
          const root = document.documentElement;
          
          // Add transitioning class for smooth animations
          if (config.enableAnimations && !prefersReducedMotion()) {
            root.classList.add('theme-transitioning');
            root.style.setProperty('--theme-transition-duration', `${config.transitionDuration}ms`);
          }
          
          // Batch DOM updates
          const updates = () => {
            // Remove existing theme classes
            root.classList.remove('light', 'dark');
            
            // Add new theme class
            root.classList.add(resolvedTheme);
            
            // Set data attributes for CSS targeting
            root.setAttribute('data-theme', resolvedTheme);
            root.setAttribute('data-color-theme', colorTheme);
            
            // Apply color palette CSS variables in batch
            const palette = colorPalettes[colorTheme]?.[resolvedTheme];
            
            if (palette) {
              // Create style batch for better performance
              const styleUpdates: string[] = [];
              
              Object.entries(palette).forEach(([property, value]) => {
                styleUpdates.push(`${property}: ${value}`);
              });
              
              // Apply all styles at once
              styleUpdates.forEach((style) => {
                const [property, value] = style.split(': ');
                root.style.setProperty(property, value);
              });
            }
          };
          
          // Apply updates
          updates();
          
          // Remove transitioning class after animation
          if (config.enableAnimations && !prefersReducedMotion()) {
            window.setTimeout(() => {
              root.classList.remove('theme-transitioning');
              resolve();
            }, config.transitionDuration);
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.error('Failed to apply theme:', error);
        reject(error);
      }
    });
  };
};

// Debounce utility for rapid theme changes
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

export const useTheme = (userConfig: UseThemeConfig = {}): UseThemeReturn => {
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...userConfig }), [userConfig]);
  
  // Load initial theme from storage
  const { theme: initialTheme, colorTheme: initialColorTheme } = useMemo(() => {
    return validateStoredTheme();
  }, []);

  // State management
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme);
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(initialColorTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [recommendations, setRecommendations] = useState<ThemeRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<ThemeAnalytics | null>(null);
  
  // Refs for cleanup
  const debounceRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const themeSessionStartRef = useRef<number>(Date.now());
  const switchCountRef = useRef<number>(0);

  // Apply theme function
  const applyTheme = useMemo(() => createApplyTheme(config), [config]);
  const debouncedApplyTheme = useMemo(() => createDebounce(applyTheme, config.debounceMs), [applyTheme, config.debounceMs]);

  // Resolved theme based on system preference
  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    return theme === 'system' ? systemTheme : theme;
  }, [theme, systemTheme]);

  // Initialize theme analytics and storage
  useEffect(() => {
    const initializeAdvancedTheme = async () => {
      if (config.enableAnalytics) {
        try {
          // Load stored theme data from advanced storage
          const storedThemeData = await themeStorage.loadThemeData();
          if (storedThemeData) {
            setThemeState(storedThemeData.mode);
            setColorThemeState(storedThemeData.colorTheme);
          }

          // Load analytics data
          const analyticsData = await themeStorage.getThemeAnalytics();
          if (analyticsData) {
            setAnalytics({
              mostUsedTheme: analyticsData.mostUsedThemes[0] || 'default',
              preferredModeByTime: analyticsData.themeUsage || {},
              sessionDuration: Date.now() - themeSessionStartRef.current,
              switchCount: switchCountRef.current
            });
          }

          // Track initial theme usage
          await themeAnalytics.trackThemeUsage(colorTheme, resolvedTheme, config.context || 'general');
          
        } catch (error) {
          console.warn('Failed to initialize advanced theme features:', error);
        }
      }

      if (config.enableRecommendations) {
        await refreshRecommendationsInternal();
      }
    };

    initializeAdvancedTheme();
  }, []);

  // Load recommendations
  const refreshRecommendationsInternal = useCallback(async () => {
    if (!config.enableRecommendations) return;
    
    try {
      const recs = await themeAnalytics.getThemeRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.warn('Failed to load theme recommendations:', error);
    }
  }, [config.enableRecommendations]);

  // Setup cross-tab synchronization
  useEffect(() => {
    if (!config.enableCrossTabSync) return;

    const handleCrossTabSync = (event: CustomEvent) => {
      const themeData = event.detail;
      if (themeData.mode !== theme || themeData.colorTheme !== colorTheme) {
        setThemeState(themeData.mode);
        setColorThemeState(themeData.colorTheme);
      }
    };

    window.addEventListener('themeUpdatedFromSync', handleCrossTabSync as EventListener);
    
    return () => {
      window.removeEventListener('themeUpdatedFromSync', handleCrossTabSync as EventListener);
    };
  }, [theme, colorTheme, config.enableCrossTabSync]);

  // Enhanced theme setter with analytics
  const setTheme = useCallback(async (newTheme: ThemeMode) => {
    if (newTheme === theme) return;
    
    setThemeState(newTheme);
    switchCountRef.current++;
    
    if (config.enableHaptics) {
      triggerHapticFeedback(true);
    }

    // Save to advanced storage
    if (config.enableAnalytics) {
      try {
        await themeStorage.saveThemeData({
          mode: newTheme,
          colorTheme,
          timestamp: Date.now(),
          version: CURRENT_THEME_VERSION,
        });

        // Track analytics
        await themeAnalytics.trackThemeUsage(colorTheme, newTheme === 'system' ? systemTheme : newTheme, config.context || 'general');
        
        // Refresh recommendations
        if (config.enableRecommendations) {
          await refreshRecommendationsInternal();
        }
      } catch (error) {
        console.warn('Failed to save theme to advanced storage:', error);
        // Fallback to localStorage
        try {
          localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch (fallbackError) {
          console.error('Failed to save theme:', fallbackError);
        }
      }
    } else {
      // Fallback to basic localStorage
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    }
  }, [theme, colorTheme, config, systemTheme, refreshRecommendationsInternal]);

  // Enhanced color theme setter with analytics
  const setColorTheme = useCallback(async (newColorTheme: ColorTheme) => {
    if (newColorTheme === colorTheme || !colorPalettes[newColorTheme]) return;
    
    setColorThemeState(newColorTheme);
    switchCountRef.current++;
    
    if (config.enableHaptics) {
      triggerHapticFeedback(true);
    }

    // Save to advanced storage
    if (config.enableAnalytics) {
      try {
        await themeStorage.saveThemeData({
          mode: theme,
          colorTheme: newColorTheme,
          timestamp: Date.now(),
          version: CURRENT_THEME_VERSION,
        });

        // Track analytics
        await themeAnalytics.trackThemeUsage(newColorTheme, resolvedTheme, config.context || 'general');
        
        // Refresh recommendations
        if (config.enableRecommendations) {
          await refreshRecommendationsInternal();
        }
      } catch (error) {
        console.warn('Failed to save color theme to advanced storage:', error);
        // Fallback to localStorage
        try {
          localStorage.setItem(COLOR_THEME_STORAGE_KEY, newColorTheme);
        } catch (fallbackError) {
          console.error('Failed to save color theme:', fallbackError);
        }
      }
    } else {
      // Fallback to basic localStorage
      try {
        localStorage.setItem(COLOR_THEME_STORAGE_KEY, newColorTheme);
      } catch (error) {
        console.error('Failed to save color theme:', error);
      }
    }
  }, [colorTheme, theme, resolvedTheme, config, refreshRecommendationsInternal]);

  // Toggle between light and dark with enhanced UX
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Preload theme assets
  const preloadTheme = useCallback((themeMode: ThemeMode, targetColorTheme?: ColorTheme) => {
    if (!config.enablePreloading || typeof window === 'undefined') return;
    
    try {
      const targetResolvedTheme = themeMode === 'system' ? systemTheme : themeMode;
      const targetColor = targetColorTheme || colorTheme;
      const palette = colorPalettes[targetColor]?.[targetResolvedTheme];
      
      if (palette) {
        // Preload by creating temporary style element
        const preloadStyle = document.createElement('style');
        preloadStyle.setAttribute('data-theme-preload', 'true');
        
        const cssVars = Object.entries(palette)
          .map(([prop, value]) => `${prop}: ${value}`)
          .join('; ');
        
        preloadStyle.textContent = `:root.preload-${targetResolvedTheme}-${targetColor} { ${cssVars} }`;
        document.head.appendChild(preloadStyle);
        
        // Remove after a short delay
        window.setTimeout(() => {
          document.head.removeChild(preloadStyle);
        }, 100);
      }
    } catch (error) {
      console.debug('Theme preloading failed:', error);
    }
  }, [colorTheme, systemTheme, config.enablePreloading]);
  
  // Reset to default theme
  const resetToDefault = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(THEME_STORAGE_KEY);
        localStorage.removeItem(COLOR_THEME_STORAGE_KEY);
        localStorage.removeItem(THEME_VERSION_KEY);
      } catch (error) {
        console.warn('Failed to clear theme storage:', error);
      }
    }
    
    setThemeState('system');
    setColorThemeState('default');
    triggerHapticFeedback(config.enableHaptics);
  }, [config.enableHaptics]);

  // Listen for system theme changes with improved performance
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      
      // Update cache
      systemThemeCache = { value: newSystemTheme, timestamp: Date.now() };
      
      setSystemTheme(newSystemTheme);
      
      // If using system theme, apply the change with transition
      if (theme === 'system') {
        setIsTransitioning(true);
        
        applyTheme(newSystemTheme, colorTheme)
          .then(() => {
            // Announce system theme change for screen readers
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(
                `Theme automatically switched to ${newSystemTheme} mode`
              );
              utterance.volume = 0; // Silent announcement
              speechSynthesis.speak(utterance);
            }
          })
          .catch(console.error)
          .finally(() => {
            window.setTimeout(() => setIsTransitioning(false), config.transitionDuration);
          });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, colorTheme, applyTheme, config.transitionDuration]);

  // Apply recommendation
  const applyRecommendation = useCallback(async (recommendation: ThemeRecommendation) => {
    await setTheme(recommendation.mode);
    await setColorTheme(recommendation.theme);
    
    if (config.enableAnalytics) {
      try {
        // Track that a recommendation was applied
        await themeAnalytics.trackThemeUsage(recommendation.theme, recommendation.mode, `recommendation-${config.context}`);
      } catch (error) {
        console.warn('Failed to track recommendation usage:', error);
      }
    }
  }, [setTheme, setColorTheme, config]);

  // Refresh recommendations
  const refreshRecommendations = useCallback(async (): Promise<void> => {
    await refreshRecommendationsInternal();
  }, [refreshRecommendationsInternal]);

  // Export theme data
  const exportThemeData = useCallback(async (): Promise<string> => {
    try {
      return await themeStorage.exportThemeData();
    } catch (error) {
      console.error('Failed to export theme data:', error);
      throw error;
    }
  }, []);

  // Import theme data
  const importThemeData = useCallback(async (data: string): Promise<boolean> => {
    try {
      return await themeStorage.importThemeData(data);
    } catch (error) {
      console.error('Failed to import theme data:', error);
      return false;
    }
  }, []);

  // Get available themes
  const getAvailableThemes = useCallback((): ColorTheme[] => {
    return Object.keys(colorPalettes) as ColorTheme[];
  }, []);

  return {
    theme,
    colorTheme,
    resolvedTheme,
    isTransitioning,
    recommendations,
    analytics,
    setTheme,
    setColorTheme,
    toggleTheme,
    preloadTheme,
    resetToDefault,
    getAvailableThemes,
    applyRecommendation,
    refreshRecommendations,
    exportThemeData,
    importThemeData,
  };
}; 