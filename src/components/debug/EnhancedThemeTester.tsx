/**
 * Enhanced Theme Tester - Demonstrates Enterprise-Grade Theme Features
 * Showcases performance optimizations, mobile enhancements, and accessibility
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { colorPalettes } from '../../theme/colorPalettes';
import type { ColorTheme } from '../../types/theme';

export const EnhancedThemeTester: React.FC = () => {
  const {
    mode,
    colorTheme,
    isDarkMode,
    isSystemMode,
    isTransitioning,
    isLoading,
    config,
    setMode,
    setColorTheme,
    toggleMode,
    preloadTheme,
    resetToDefault,
    validateTheme,
    getSystemTheme,
    getThemeMetadata,
  } = useTheme();

  const [preloadedThemes, setPreloadedThemes] = useState<Set<ColorTheme>>(new Set());
  const [systemTheme, setSystemTheme] = useState(getSystemTheme());

  // Update system theme periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemTheme(getSystemTheme());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [getSystemTheme]);

  const handlePreloadTheme = async (theme: ColorTheme) => {
    await preloadTheme(theme);
    setPreloadedThemes(prev => new Set([...prev, theme]));
    
    // Clear preload status after delay
    setTimeout(() => {
      setPreloadedThemes(prev => {
        const newSet = new Set(prev);
        newSet.delete(theme);
        return newSet;
      });
    }, 2000);
  };

  const themeOptions = Object.keys(colorPalettes) as ColorTheme[];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🚀 Enhanced Theme System
        </h1>
        <p className="text-muted-foreground">
          Enterprise-grade theme management with performance optimizations
        </p>
      </div>

      {/* Status Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-surface rounded-lg p-4 hover-lift">
          <h3 className="font-semibold text-foreground mb-2">🎨 Current State</h3>
          <div className="space-y-1 text-sm">
            <div>Mode: <span className="font-mono">{mode}</span></div>
            <div>Theme: <span className="font-mono">{colorTheme}</span></div>
            <div>Resolved: <span className="font-mono">{isDarkMode ? 'dark' : 'light'}</span></div>
            <div>System: <span className="font-mono">{systemTheme}</span></div>
          </div>
        </div>

        <div className="bg-surface border border-surface rounded-lg p-4 hover-lift">
          <h3 className="font-semibold text-foreground mb-2">⚡ Performance</h3>
          <div className="space-y-1 text-sm">
            <div className={`${isTransitioning ? 'text-warning-500' : 'text-success-500'}`}>
              {isTransitioning ? '🔄 Transitioning' : '✅ Ready'}
            </div>
            <div className={`${isLoading ? 'text-warning-500' : 'text-success-500'}`}>
              {isLoading ? '📥 Loading' : '⚡ Loaded'}
            </div>
            <div>Transition: <span className="font-mono">{config.transitionDuration}ms</span></div>
            <div>Debounce: <span className="font-mono">{config.debounceMs}ms</span></div>
          </div>
        </div>

        <div className="bg-surface border border-surface rounded-lg p-4 hover-lift">
          <h3 className="font-semibold text-foreground mb-2">🛠️ Features</h3>
          <div className="space-y-1 text-sm">
            <div className={config.enableHaptics ? 'text-success-500' : 'text-muted-foreground'}>
              📱 {config.enableHaptics ? 'Haptics On' : 'Haptics Off'}
            </div>
            <div className={config.enablePreloading ? 'text-success-500' : 'text-muted-foreground'}>
              🚀 {config.enablePreloading ? 'Preloading On' : 'Preloading Off'}
            </div>
            <div className={config.enableAnimations ? 'text-success-500' : 'text-muted-foreground'}>
              ✨ {config.enableAnimations ? 'Animations On' : 'Animations Off'}
            </div>
            <div className={config.enableAnnouncements ? 'text-success-500' : 'text-muted-foreground'}>
              📢 {config.enableAnnouncements ? 'A11y On' : 'A11y Off'}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Mode Controls */}
      <div className="bg-surface border border-surface rounded-lg p-6 hover-lift">
        <h3 className="text-xl font-semibold text-foreground mb-4">🌓 Theme Mode</h3>
        <div className="flex flex-wrap gap-3">
          {(['light', 'dark', 'system'] as const).map((modeOption) => (
            <button
              key={modeOption}
              onClick={() => setMode(modeOption)}
              disabled={isTransitioning}
              className={`
                px-4 py-2 rounded-md border transition-all
                ${mode === modeOption 
                  ? 'bg-primary-500 text-white border-primary-500' 
                  : 'bg-surface border-border hover-button'
                }
                ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover-lift'}
              `}
            >
              {modeOption === 'light' && '☀️'} 
              {modeOption === 'dark' && '🌙'} 
              {modeOption === 'system' && '💻'} 
              {modeOption}
              {mode === modeOption && isTransitioning && ' 🔄'}
            </button>
          ))}
          
          <button
            onClick={toggleMode}
            disabled={isTransitioning}
            className={`
              px-4 py-2 rounded-md border bg-secondary-500 text-white border-secondary-500
              ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover-lift'}
            `}
          >
            🔄 Toggle
          </button>
        </div>
      </div>

      {/* Color Theme Grid */}
      <div className="bg-surface border border-surface rounded-lg p-6 hover-lift">
        <h3 className="text-xl font-semibold text-foreground mb-4">🎨 Color Themes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {themeOptions.map((theme) => {
            const metadata = getThemeMetadata(theme);
            const isValid = validateTheme(theme);
            const isPreloaded = preloadedThemes.has(theme);
            const isCurrent = colorTheme === theme;
            
            return (
              <div
                key={theme}
                className={`
                  relative p-4 rounded-lg border transition-all cursor-pointer
                  ${isCurrent 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' 
                    : 'border-border hover-card'
                  }
                  ${!isValid ? 'opacity-50' : ''}
                `}
                onClick={() => isValid && setColorTheme(theme)}
              >
                {/* Theme Preview */}
                <div className="flex space-x-1 mb-2">
                  {[
                    colorPalettes[theme]?.light?.['--primary-500'] || '#3B82F6',
                    colorPalettes[theme]?.light?.['--secondary-500'] || '#EC4899',
                    colorPalettes[theme]?.light?.['--accent-500'] || '#10B981',
                  ].map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                {/* Theme Info */}
                <div className="text-sm">
                  <div className="font-semibold text-foreground">{theme}</div>
                  <div className="text-muted-foreground text-xs">{metadata.category}</div>
                </div>
                
                {/* Status Indicators */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {isCurrent && <span className="text-xs">✅</span>}
                  {isPreloaded && <span className="text-xs">🚀</span>}
                  {!isValid && <span className="text-xs">❌</span>}
                </div>
                
                {/* Preload Button */}
                {!isCurrent && isValid && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreloadTheme(theme);
                    }}
                    className="absolute bottom-2 right-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Preload theme"
                  >
                    🚀
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Utility Functions */}
      <div className="bg-surface border border-surface rounded-lg p-6 hover-lift">
        <h3 className="text-xl font-semibold text-foreground mb-4">🛠️ Utilities</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={resetToDefault}
            className="px-4 py-2 rounded-md border border-error-500 text-error-500 hover:bg-error-50 dark:hover:bg-error-950 hover-lift"
          >
            🔄 Reset to Default
          </button>
          
          <button
            onClick={() => handlePreloadTheme(colorTheme)}
            disabled={isTransitioning}
            className={`
              px-4 py-2 rounded-md border border-info-500 text-info-500 hover:bg-info-50 dark:hover:bg-info-950
              ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover-lift'}
            `}
          >
            🚀 Preload Current
          </button>
          
          <button
            onClick={async () => {
              for (const theme of themeOptions) {
                await handlePreloadTheme(theme);
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }}
            disabled={isTransitioning}
            className={`
              px-4 py-2 rounded-md border border-success-500 text-success-500 hover:bg-success-50 dark:hover:bg-success-950
              ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover-lift'}
            `}
          >
            🌟 Preload All
          </button>
        </div>
      </div>

      {/* Configuration Display */}
      <div className="bg-surface border border-surface rounded-lg p-6 hover-lift">
        <h3 className="text-xl font-semibold text-foreground mb-4">⚙️ Configuration</h3>
        <pre className="text-sm bg-background-secondary p-4 rounded border overflow-x-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>

      {/* Theme Metadata */}
      <div className="bg-surface border border-surface rounded-lg p-6 hover-lift">
        <h3 className="text-xl font-semibold text-foreground mb-4">📊 Current Theme Metadata</h3>
        <pre className="text-sm bg-background-secondary p-4 rounded border overflow-x-auto">
          {JSON.stringify(getThemeMetadata(colorTheme), null, 2)}
        </pre>
      </div>
    </div>
  );
}; 