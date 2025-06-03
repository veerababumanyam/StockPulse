"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Layout, Layouts as RGLPrimitiveLayouts } from "react-grid-layout";
import WidgetLibrary from "../components/dashboard/WidgetLibrary";
import EnterpriseWidgetGrid from "../components/dashboard/WidgetGrid";
import { dashboardService } from "../services/dashboardService";
import {
  DashboardConfig,
  WidgetConfig,
  WidgetType,
  DashboardBreakpoints,
  DASHBOARD_BREAKPOINTS,
  DEFAULT_DASHBOARD_CONFIG,
  WidgetMetadata,
  WIDGET_LIBRARY,
  DashboardLayout,
} from "../types/dashboard";
import { useTheme } from "../hooks/useTheme";
import {
  PlusCircle,
  Edit,
  Save,
  XCircle,
  Layers,
  RefreshCw,
  Settings2,
  Columns,
  Rows,
  Maximize,
  Minimize,
} from "lucide-react";
import "../styles/dashboard-responsive.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Helper to get current breakpoint
const getCurrentBreakpoint = (): keyof DashboardBreakpoints => {
  const width = window.innerWidth;

  if (width >= DASHBOARD_BREAKPOINTS.xl) {
    return "xl";
  } else if (width >= DASHBOARD_BREAKPOINTS.lg) {
    return "lg";
  } else if (width >= DASHBOARD_BREAKPOINTS.md) {
    return "md";
  } else if (width >= DASHBOARD_BREAKPOINTS.sm) {
    return "sm";
  } else if (width >= DASHBOARD_BREAKPOINTS.xs) {
    return "xs";
  } else {
    return "xxs";
  }
};

// Debounce function for resize events
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const DashboardPage: React.FC = () => {
  const {
    isDark: isDarkMode,
    colorTheme,
    mode,
  } = useTheme({
    context: "dashboard",
    enableAnalytics: true,
  });

  const [dashboardConfig, setDashboardConfig] =
    useState<DashboardConfig | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<
    keyof DashboardBreakpoints
  >(getCurrentBreakpoint());
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const config = await dashboardService.initializeDashboard();
      setDashboardConfig(config);
      const updatedLayouts = { ...config.layouts };
      (
        Object.keys(DASHBOARD_BREAKPOINTS) as Array<keyof DashboardBreakpoints>
      ).forEach((bp) => {
        if (!updatedLayouts[bp]) {
          const defaultBpLayout = DEFAULT_DASHBOARD_CONFIG.layouts[bp] || {
            breakpoint: bp,
            cols: 12,
            rowHeight: 60,
            margin: [10, 10],
            containerPadding: [10, 10],
            widgets: [],
          };
          updatedLayouts[bp] = defaultBpLayout;
        }
      });
      setDashboardConfig((prev) =>
        prev ? { ...prev, layouts: updatedLayouts } : null,
      );
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load dashboard. Please try again.");
      setDashboardConfig(DEFAULT_DASHBOARD_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const handleResize = debounce(() => {
      const newBreakpoint = getCurrentBreakpoint();
      if (newBreakpoint !== currentBreakpoint) {
        setCurrentBreakpoint(newBreakpoint);
      }
    }, 150);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentBreakpoint]);

  const handleSaveDashboard = async () => {
    if (!dashboardConfig) return;
    setIsLoading(true);
    try {
      await dashboardService.saveDashboard(dashboardConfig);
      dashboardService._saveConfigToLocalStorage(dashboardConfig);
      setUnsavedChanges(false);
      alert("Dashboard saved successfully!");
    } catch (err) {
      console.error("Failed to save dashboard:", err);
      setError("Failed to save dashboard. Changes might not be persisted.");
    } finally {
      setIsLoading(false);
    }
  };

  const rglLayoutsProp = useMemo((): RGLPrimitiveLayouts => {
    if (!dashboardConfig) return {};
    const newRglLayouts: RGLPrimitiveLayouts = {};
    for (const bpKey in dashboardConfig.layouts) {
      const breakpoint = bpKey as keyof DashboardBreakpoints;
      if (dashboardConfig.layouts[breakpoint]) {
        const widgets = dashboardConfig.layouts[breakpoint].widgets;
        newRglLayouts[breakpoint] = widgets.map((widget) => ({
          i: widget.id,
          x: widget.position.x,
          y: widget.position.y,
          w: widget.position.w,
          h: widget.position.h,
        }));
      }
    }
    return newRglLayouts;
  }, [dashboardConfig]);

  const handleLayoutChange = useCallback(
    (newRglLayout: Layout[], allRglLayouts: RGLPrimitiveLayouts) => {
      if (!dashboardConfig) return;

      setDashboardConfig((prevConfig) => {
        if (!prevConfig) return null;
        const newAppLayouts = { ...prevConfig.layouts };

        for (const bpKey in allRglLayouts) {
          const breakpoint = bpKey as keyof DashboardBreakpoints;
          if (allRglLayouts[breakpoint]) {
            let currentAppBpLayout = newAppLayouts[breakpoint];
            if (!currentAppBpLayout) {
              currentAppBpLayout = DEFAULT_DASHBOARD_CONFIG.layouts[
                breakpoint
              ] || {
                breakpoint: breakpoint,
                cols: 12,
                rowHeight: 60,
                margin: [10, 10],
                containerPadding: [10, 10],
                widgets: [],
              };
            }

            const maxCols = currentAppBpLayout.cols;
            const updatedWidgets = allRglLayouts[breakpoint]!.map((item) => {
              const existingWidget = currentAppBpLayout.widgets.find(
                (w) => w.id === item.i,
              );

              return {
                ...existingWidget!,
                position: {
                  x: Math.max(0, Math.min(item.x, maxCols - item.w)),
                  y: Math.max(0, item.y),
                  w: Math.max(1, Math.min(item.w, maxCols)),
                  h: Math.max(1, item.h),
                },
              };
            });

            newAppLayouts[breakpoint] = {
              ...currentAppBpLayout,
              widgets: updatedWidgets,
            };
          }
        }

        setUnsavedChanges(true);
        return {
          ...prevConfig,
          layouts: newAppLayouts,
        };
      });
    },
    [dashboardConfig],
  );

  const handleAddWidget = useCallback(
    (widgetType: WidgetType) => {
      if (!dashboardConfig) return;

      const widgetMetadata = WIDGET_LIBRARY[widgetType];
      if (!widgetMetadata) return;

      const newWidgetId = `${widgetType}_${Date.now()}`;
      const currentBpLayout = dashboardConfig.layouts[currentBreakpoint];
      if (!currentBpLayout) return;

      const newWidget: WidgetConfig = {
        id: newWidgetId,
        type: widgetType,
        title: widgetMetadata.name,
        position: {
          x: 0,
          y: 0,
          w: widgetMetadata.defaultSize.w,
          h: widgetMetadata.defaultSize.h,
        },
        config: {},
        isVisible: true,
        permissions: {
          canEdit: true,
          canDelete: true,
          canMove: true,
          canResize: true,
        },
      };

      setDashboardConfig((prev) => {
        if (!prev) return null;
        const newLayouts = { ...prev.layouts };
        const updatedBpLayout = { ...newLayouts[currentBreakpoint] };
        updatedBpLayout.widgets = [...updatedBpLayout.widgets, newWidget];
        newLayouts[currentBreakpoint] = updatedBpLayout;

        setUnsavedChanges(true);
        return {
          ...prev,
          layouts: newLayouts,
        };
      });

      setIsWidgetLibraryOpen(false);
    },
    [dashboardConfig, currentBreakpoint],
  );

  // Helper function to get widget config from dashboard config
  const getWidgetConfig = useCallback(
    (widgetId: string): WidgetConfig | undefined => {
      if (!dashboardConfig) return undefined;

      // Search through all breakpoints to find the widget
      for (const breakpoint of Object.keys(dashboardConfig.layouts) as Array<
        keyof DashboardBreakpoints
      >) {
        const layout = dashboardConfig.layouts[breakpoint];
        if (layout) {
          const widget = layout.widgets.find((w) => w.id === widgetId);
          if (widget) {
            return widget;
          }
        }
      }
      return undefined;
    },
    [dashboardConfig],
  );

  // Handler for widget settings
  const handleWidgetSettings = useCallback((widgetId: string) => {
    console.log("Opening settings for widget:", widgetId);
    // TODO: Implement widget settings modal
  }, []);

  // Handler for widget duplication
  const handleWidgetDuplicate = useCallback((widgetId: string) => {
    console.log("Duplicating widget:", widgetId);
    // TODO: Implement widget duplication logic
  }, []);

  const handleDeleteWidget = useCallback(
    (widgetId: string) => {
      console.log("Deleting widget:", widgetId);

      setDashboardConfig((prev) => {
        if (!prev) return null;
        const newLayouts = { ...prev.layouts };

        for (const bpKey in newLayouts) {
          const breakpoint = bpKey as keyof DashboardBreakpoints;
          if (newLayouts[breakpoint]) {
            newLayouts[breakpoint] = {
              ...newLayouts[breakpoint],
              widgets: newLayouts[breakpoint].widgets.filter(
                (w) => w.id !== widgetId,
              ),
            };
          }
        }

        setUnsavedChanges(true);
        return {
          ...prev,
          layouts: newLayouts,
        };
      });
    },
    [dashboardConfig],
  );

  const handleCancelEdit = () => {
    if (unsavedChanges) {
      const confirmCancel = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?",
      );
      if (!confirmCancel) return;
    }
    setIsEditMode(false);
    setUnsavedChanges(false);
    loadDashboard();
  };

  const currentLayout = dashboardConfig?.layouts[currentBreakpoint];

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-background text-text"
        style={{
          backgroundColor: isDarkMode ? "#1a1b23" : "#ffffff",
          color: isDarkMode ? "#e2e8f0" : "#1a202c",
        }}
      >
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading Dashboard...</p>
          <p className="text-sm text-text/60">
            Theme: {colorTheme} | Mode: {mode}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="text-center space-y-4">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold">Dashboard Error</h2>
          <p className="text-text/60">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background text-text">
      <div className="bg-surface border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-text">
                StockPulse Dashboard
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-text/60">
              <span>Breakpoint: {currentBreakpoint.toUpperCase()}</span>
              <span>•</span>
              <span>Theme: {colorTheme}</span>
              <span>•</span>
              <span>{isDarkMode ? "Dark" : "Light"} Mode</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditMode ? (
              <>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Layout</span>
                </button>
                <button
                  onClick={loadDashboard}
                  className="flex items-center space-x-2 px-3 py-2 bg-surface border border-border text-text rounded-lg hover:bg-background transition-colors duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsWidgetLibraryOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors duration-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Widget</span>
                </button>
                <button
                  onClick={handleSaveDashboard}
                  disabled={!unsavedChanges || isLoading}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600/10 text-green-600 rounded-lg hover:bg-green-600/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {unsavedChanges ? "Save Changes" : "Saved"}
                  </span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600/10 text-red-600 rounded-lg hover:bg-red-600/20 transition-colors duration-200"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>

        {unsavedChanges && (
          <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You have unsaved changes. Don't forget to save your layout!
            </p>
          </div>
        )}
      </div>

      <div className="p-4 h-[calc(100vh-120px)] overflow-auto">
        {dashboardConfig && currentLayout ? (
          <EnterpriseWidgetGrid
            layouts={rglLayoutsProp}
            onLayoutChange={handleLayoutChange}
            onWidgetRemove={handleDeleteWidget}
            onWidgetSettings={handleWidgetSettings}
            onWidgetDuplicate={handleWidgetDuplicate}
            getWidgetConfig={getWidgetConfig}
            isEditMode={isEditMode}
            currentBreakpoint={currentBreakpoint}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Settings2 className="w-12 h-12 text-text/40 mx-auto" />
              <h3 className="text-lg font-medium text-text">
                No Dashboard Configuration
              </h3>
              <p className="text-text/60">
                Create your first dashboard layout by adding widgets.
              </p>
              <button
                onClick={() => setIsWidgetLibraryOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
              >
                Add Your First Widget
              </button>
            </div>
          </div>
        )}
      </div>

      {isWidgetLibraryOpen && (
        <WidgetLibrary
          onAddWidget={handleAddWidget}
          onClose={() => setIsWidgetLibraryOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
