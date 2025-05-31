/**
 * Advanced Theme Management Widget for StockPulse Dashboard
 * Integrates with enhanced theme system for smart recommendations,
 * analytics insights, and context-aware theme switching
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Moon,
  Sun,
  Monitor,
  Zap,
  TrendingUp,
  Activity,
  Settings,
  Download,
  Upload,
  BarChart3,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  Eye,
  Battery,
  Smartphone,
  RefreshCw
} from 'lucide-react';

import { AppContainer } from '../ui/AppContainer';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/tailwind';

interface ThemeManagementWidgetProps {
  className?: string;
  showAdvancedFeatures?: boolean;
  enableRecommendations?: boolean;
  showAnalytics?: boolean;
}

export const ThemeManagementWidget: React.FC<ThemeManagementWidgetProps> = ({
  className = '',
  showAdvancedFeatures = true,
  enableRecommendations = true,
  showAnalytics = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    theme,
    colorTheme,
    resolvedTheme,
    isTransitioning,
    recommendations,
    analytics,
    setTheme,
    setColorTheme,
    toggleTheme,
    getAvailableThemes,
    applyRecommendation,
    refreshRecommendations,
    exportThemeData,
    importThemeData
  } = useTheme({
    enableAnalytics: true,
    enableRecommendations: true,
    enableCrossTabSync: true,
    context: 'dashboard-widget'
  });

  // Refresh recommendations periodically
  useEffect(() => {
    if (enableRecommendations) {
      const interval = setInterval(() => {
        refreshRecommendations();
      }, 300000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [enableRecommendations, refreshRecommendations]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshRecommendations();
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshRecommendations]);

  // Handle theme export
  const handleExport = useCallback(async () => {
    try {
      const data = await exportThemeData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stockpulse-theme-backup-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export theme data:', error);
    }
  }, [exportThemeData]);

  // Handle theme import
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as string;
        const success = await importThemeData(data);
        if (success) {
          console.log('Theme data imported successfully');
        } else {
          console.error('Failed to import theme data');
        }
      } catch (error) {
        console.error('Error importing theme data:', error);
      }
    };
    reader.readAsText(file);
  }, [importThemeData]);

  // Get theme icon based on current theme
  const getThemeIcon = (themeMode: string) => {
    switch (themeMode) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Monitor;
      default: return Monitor;
    }
  };

  // Get recommendation confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success bg-success/10';
    if (confidence >= 0.6) return 'text-warning bg-warning/10';
    return 'text-info bg-info/10';
  };

  // Available themes for selection
  const availableThemes = getAvailableThemes();

  // Top recommendations (limit to 3 for widget view)
  const topRecommendations = recommendations.slice(0, 3);

  return (
    <AppContainer
      variant="surface"
      padding="md"
      shadow="md"
      border
      className={cn("transition-all duration-300", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Theme Control</h3>
          {isTransitioning && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          {enableRecommendations && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
          </Button>
        </div>
      </div>

      {/* Current Theme Status */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
          {React.createElement(getThemeIcon(theme), { 
            className: "w-4 h-4 text-muted-foreground" 
          })}
          <div>
            <div className="text-xs text-muted-foreground">Mode</div>
            <div className="text-sm font-medium text-foreground capitalize">{theme}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
          <div className="w-4 h-4 rounded-full" style={{
            background: `linear-gradient(45deg, var(--primary), var(--secondary))`
          }} />
          <div>
            <div className="text-xs text-muted-foreground">Theme</div>
            <div className="text-sm font-medium text-foreground capitalize">
              {colorTheme.replace('-', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Theme Toggle */}
      <div className="flex space-x-2 mb-4">
        <Button
          size="sm"
          variant={theme === 'light' ? 'default' : 'outline'}
          onClick={() => setTheme('light')}
          className="flex-1 h-8"
          disabled={isTransitioning}
        >
          <Sun className="w-3 h-3 mr-1" />
          Light
        </Button>
        <Button
          size="sm"
          variant={theme === 'dark' ? 'default' : 'outline'}
          onClick={() => setTheme('dark')}
          className="flex-1 h-8"
          disabled={isTransitioning}
        >
          <Moon className="w-3 h-3 mr-1" />
          Dark
        </Button>
        <Button
          size="sm"
          variant={theme === 'system' ? 'default' : 'outline'}
          onClick={() => setTheme('system')}
          className="flex-1 h-8"
          disabled={isTransitioning}
        >
          <Monitor className="w-3 h-3 mr-1" />
          Auto
        </Button>
      </div>

      {/* Smart Recommendations */}
      {enableRecommendations && topRecommendations.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI Recommendations</span>
          </div>
          <div className="space-y-2">
            {topRecommendations.map((rec, index) => (
              <motion.div
                key={`${rec.theme}-${rec.mode}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => applyRecommendation(rec)}
              >
                <div className="flex items-center space-x-2">
                  <Badge className={cn("text-xs", getConfidenceColor(rec.confidence))}>
                    {Math.round(rec.confidence * 100)}%
                  </Badge>
                  <div>
                    <div className="text-sm font-medium text-foreground capitalize">
                      {rec.theme.replace('-', ' ')} ({rec.mode})
                    </div>
                    <div className="text-xs text-muted-foreground">{rec.reason}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {rec.energyImpact === 'low' && <Battery className="w-3 h-3 text-success" />}
                  {rec.performanceImpact === 'low' && <Zap className="w-3 h-3 text-primary" />}
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-surface pt-4 space-y-4"
          >
            {/* Analytics Dashboard */}
            {showAnalytics && analytics && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Usage Analytics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-muted/30">
                    <div className="text-muted-foreground">Most Used</div>
                    <div className="font-medium text-foreground capitalize">
                      {analytics.mostUsedTheme.replace('-', ' ')}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <div className="text-muted-foreground">Switches</div>
                    <div className="font-medium text-foreground">{analytics.switchCount}</div>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <div className="text-muted-foreground">Session</div>
                    <div className="font-medium text-foreground">
                      {Math.round(analytics.sessionDuration / 60000)}m
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <div className="text-muted-foreground">Evening Mode</div>
                    <div className="font-medium text-foreground capitalize">
                      {analytics.preferredModeByTime[20] || 'Dark'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Picker */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Color Themes</h4>
              <div className="grid grid-cols-3 gap-2">
                {availableThemes.slice(0, 6).map((themeOption) => (
                  <Button
                    key={themeOption}
                    size="sm"
                    variant={colorTheme === themeOption ? 'default' : 'outline'}
                    onClick={() => setColorTheme(themeOption)}
                    className="h-8 text-xs"
                    disabled={isTransitioning}
                  >
                    {themeOption.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Advanced Features */}
            {showAdvancedFeatures && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Advanced</h4>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExport}
                    className="flex-1 h-8"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                  <label className="flex-1">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-8"
                      as="span"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Import
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AppContainer>
  );
};

export default ThemeManagementWidget; 