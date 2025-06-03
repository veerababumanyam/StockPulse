/**
 * Unified Theme Selector - Enterprise-Grade Theme Management Component
 * Demonstrates the complete improved architecture with ThemeEngine integration
 *
 * Features:
 * - Central ThemeEngine coordination
 * - AI-powered recommendations
 * - Analytics integration
 * - Real-time transitions
 * - Storage persistence
 * - Cross-tab synchronization
 * - Accessibility compliance
 *
 * @example
 * // Basic usage
 * <UnifiedThemeSelector />
 *
 * @example
 * // With advanced features
 * <UnifiedThemeSelector
 *   showRecommendations={true}
 *   showAnalytics={true}
 *   enableAutoSwitch={true}
 *   className="custom-theme-selector"
 * />
 *
 * @example
 * // Compact mode for toolbar
 * <UnifiedThemeSelector
 *   variant="compact"
 *   showLabels={false}
 *   position="toolbar"
 * />
 */

import React, { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";
import {
  getAllThemeKeys,
  getAllThemeMetadata,
  type ColorTheme,
  type ThemeMode,
} from "../../theme/colorPalettes";
import type { ThemeVariant } from "../../theme/themeComposer";
import { cn } from "../../utils/theme";

interface UnifiedThemeSelectorProps {
  // Appearance
  variant?: "default" | "compact" | "detailed";
  className?: string;
  showLabels?: boolean;
  position?: "standalone" | "toolbar" | "sidebar";

  // Features
  showRecommendations?: boolean;
  showAnalytics?: boolean;
  enableAutoSwitch?: boolean;
  showTransitionIndicator?: boolean;

  // Behavior
  autoSave?: boolean;
  enableHaptics?: boolean;
  onThemeChange?: (theme: ColorTheme, mode: ThemeMode) => void;
}

export const UnifiedThemeSelector: React.FC<UnifiedThemeSelectorProps> = ({
  variant = "default",
  className = "",
  showLabels = true,
  position = "standalone",
  showRecommendations = false,
  showAnalytics = false,
  enableAutoSwitch = false,
  showTransitionIndicator = true,
  autoSave = true,
  enableHaptics = true,
  onThemeChange,
}) => {
  // Enhanced theme hook with all features
  const {
    mode,
    colorTheme,
    variant: currentVariant,
    isDark,
    isTransitioning,
    setTheme,
    setMode,
    setColorTheme,
    setVariant,
    toggleMode,
    recommendations,
    analytics,
    autoSwitch,
    getAvailableThemes,
    getThemeMetadata,
    resetToDefault,
    exportData,
    importData,
    lastChanged,
    engineReady,
  } = useTheme({
    enableRecommendations: showRecommendations,
    enableAnalytics: showAnalytics,
    enableAutoSwitch,
    autoSave,
    context: "theme-selector",
  });

  // Local state
  const [selectedTab, setSelectedTab] = useState<
    "themes" | "recommendations" | "analytics"
  >("themes");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportedData, setExportedData] = useState<string>("");

  // Get theme data
  const availableThemes = getAvailableThemes();
  const themeMetadata = getThemeMetadata();

  // Handle theme changes
  const handleThemeChange = async (
    newTheme: ColorTheme,
    newMode?: ThemeMode,
  ) => {
    const success = await setTheme(newTheme, newMode || mode);
    if (success && onThemeChange) {
      onThemeChange(newTheme, newMode || mode);
    }
  };

  const handleModeToggle = async () => {
    const success = await toggleMode();
    if (success && onThemeChange) {
      onThemeChange(colorTheme, isDark ? "light" : "dark");
    }
  };

  const handleRecommendationApply = async (rec: any) => {
    await handleThemeChange(rec.theme, rec.mode);
  };

  const handleAutoSwitch = async () => {
    const success = await autoSwitch();
    if (success) {
      console.log("Auto-switch completed successfully");
    }
  };

  const handleExport = async () => {
    const data = await exportData();
    setExportedData(data);
    setShowExportDialog(true);
  };

  const handleReset = async () => {
    const success = await resetToDefault();
    if (success) {
      console.log("Theme reset to default");
    }
  };

  // Component style classes based on variant
  const containerClasses = cn(
    "unified-theme-selector",
    {
      compact: variant === "compact",
      detailed: variant === "detailed",
      toolbar: position === "toolbar",
      sidebar: position === "sidebar",
      transitioning: isTransitioning && showTransitionIndicator,
      "engine-loading": !engineReady,
    },
    className,
  );

  // Don't render until engine is ready
  if (!engineReady) {
    return (
      <div className={cn(containerClasses, "loading")}>
        <div className="loading-spinner" />
        {showLabels && <span>Loading theme engine...</span>}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Header with mode toggle */}
      <div className="theme-selector-header">
        <div className="mode-controls">
          <button
            onClick={handleModeToggle}
            className={cn("mode-toggle", { active: isDark })}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            disabled={isTransitioning}
          >
            <span className="mode-icon">{isDark ? "🌙" : "☀️"}</span>
            {showLabels && (
              <span className="mode-label">{isDark ? "Dark" : "Light"}</span>
            )}
          </button>

          {variant === "detailed" && (
            <div className="theme-info">
              <span className="current-theme">
                {themeMetadata[colorTheme]?.name}
              </span>
              <span className="theme-category">
                {themeMetadata[colorTheme]?.category}
              </span>
            </div>
          )}
        </div>

        {/* Transition indicator */}
        {isTransitioning && showTransitionIndicator && (
          <div className="transition-indicator">
            <div className="transition-bar" />
          </div>
        )}
      </div>

      {/* Navigation tabs for detailed view */}
      {variant === "detailed" && (showRecommendations || showAnalytics) && (
        <div className="theme-tabs">
          <button
            onClick={() => setSelectedTab("themes")}
            className={cn("tab", { active: selectedTab === "themes" })}
          >
            Themes
          </button>
          {showRecommendations && (
            <button
              onClick={() => setSelectedTab("recommendations")}
              className={cn("tab", {
                active: selectedTab === "recommendations",
              })}
            >
              AI Recommendations
              {recommendations.length > 0 && (
                <span className="recommendation-badge">
                  {recommendations.length}
                </span>
              )}
            </button>
          )}
          {showAnalytics && (
            <button
              onClick={() => setSelectedTab("analytics")}
              className={cn("tab", { active: selectedTab === "analytics" })}
            >
              Analytics
            </button>
          )}
        </div>
      )}

      {/* Content based on selected tab */}
      <div className="theme-content">
        {/* Theme Selection */}
        {(selectedTab === "themes" || variant !== "detailed") && (
          <div className="theme-grid">
            {availableThemes.map((theme) => {
              const metadata = themeMetadata[theme];
              const isSelected = theme === colorTheme;

              return (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={cn("theme-option", {
                    selected: isSelected,
                    transitioning: isTransitioning && isSelected,
                  })}
                  aria-label={`Select ${metadata.name} theme`}
                  disabled={isTransitioning}
                >
                  {/* Theme preview */}
                  <div className="theme-preview">
                    <div className="color-swatches">
                      {metadata.colors.map((color, index) => (
                        <div
                          key={index}
                          className="color-swatch"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Theme info */}
                  {showLabels && (
                    <div className="theme-info">
                      <span className="theme-name">{metadata.name}</span>
                      {variant === "detailed" && (
                        <span className="theme-description">
                          {metadata.description}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Selection indicator */}
                  {isSelected && <div className="selection-indicator">✓</div>}
                </button>
              );
            })}
          </div>
        )}

        {/* AI Recommendations */}
        {selectedTab === "recommendations" && showRecommendations && (
          <div className="recommendations-panel">
            <div className="recommendations-header">
              <h3>AI-Powered Recommendations</h3>
              {enableAutoSwitch && (
                <button
                  onClick={handleAutoSwitch}
                  className="auto-switch-btn"
                  disabled={isTransitioning}
                >
                  Auto Switch
                </button>
              )}
            </div>

            {recommendations.length > 0 ? (
              <div className="recommendations-list">
                {recommendations.map((rec, index) => (
                  <div
                    key={`${rec.theme}-${rec.mode}-${index}`}
                    className="recommendation-item"
                  >
                    <div className="recommendation-preview">
                      <div className="theme-colors">
                        {themeMetadata[rec.theme]?.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="color-dot"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="rec-mode-indicator">
                        {rec.mode === "dark" ? "🌙" : "☀️"}
                      </span>
                    </div>

                    <div className="recommendation-info">
                      <div className="rec-header">
                        <span className="rec-theme">
                          {themeMetadata[rec.theme]?.name}
                        </span>
                        <span className="rec-mode">({rec.mode})</span>
                        <span className="rec-confidence">
                          {Math.round(rec.confidence * 100)}%
                        </span>
                      </div>
                      <p className="rec-reason">{rec.reason}</p>
                      <div className="rec-impacts">
                        <span className={`impact energy-${rec.energyImpact}`}>
                          Energy: {rec.energyImpact}
                        </span>
                        <span
                          className={`impact performance-${rec.performanceImpact}`}
                        >
                          Performance: {rec.performanceImpact}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRecommendationApply(rec)}
                      className="apply-recommendation-btn"
                      disabled={isTransitioning}
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-recommendations">
                <p>
                  No recommendations available yet. Use the app more to get
                  personalized suggestions.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Panel */}
        {selectedTab === "analytics" && showAnalytics && (
          <div className="analytics-panel">
            <h3>Theme Usage Analytics</h3>
            {analytics ? (
              <div className="analytics-data">
                <div className="analytics-summary">
                  <div className="metric">
                    <span className="metric-label">Most Used Theme:</span>
                    <span className="metric-value">
                      {analytics.mostUsedThemes?.[0] || "N/A"}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Total Sessions:</span>
                    <span className="metric-value">
                      {analytics.totalSessions || 0}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Average Session:</span>
                    <span className="metric-value">
                      {analytics.averageSessionTime || 0}min
                    </span>
                  </div>
                </div>

                {analytics.favoriteThemes && (
                  <div className="favorite-themes">
                    <h4>Favorite Themes</h4>
                    <div className="favorite-list">
                      {analytics.favoriteThemes.map((theme: ColorTheme) => (
                        <span key={theme} className="favorite-theme">
                          {themeMetadata[theme]?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-analytics">
                <p>
                  Analytics data is being generated. Check back after using
                  different themes.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions footer for detailed view */}
      {variant === "detailed" && (
        <div className="theme-actions">
          <button onClick={handleExport} className="action-btn">
            Export Settings
          </button>
          <button onClick={handleReset} className="action-btn secondary">
            Reset to Default
          </button>
          <div className="last-changed">
            Updated: {new Date(lastChanged).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Export dialog */}
      {showExportDialog && (
        <div className="export-dialog-overlay">
          <div className="export-dialog">
            <h3>Export Theme Settings</h3>
            <textarea value={exportedData} readOnly className="export-data" />
            <div className="export-actions">
              <button
                onClick={() => navigator.clipboard.writeText(exportedData)}
                className="copy-btn"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowExportDialog(false)}
                className="close-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedThemeSelector;
