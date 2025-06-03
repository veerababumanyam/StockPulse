"use client";

/**
 * StockPulse Widget Grid - Enterprise-Grade
 * Customizable and responsive widget grid system using React Grid Layout.
 * Integrates with central theme and Story 2.2 requirements.
 */

import React, { useMemo, useCallback, useEffect, useState } from "react";
import { Responsive, WidthProvider, Layout, Layouts } from "react-grid-layout";
import {
  WidgetConfig,
  DashboardBreakpoints,
  DASHBOARD_BREAKPOINTS as APP_DASHBOARD_BREAKPOINTS,
  DEFAULT_LAYOUTS,
  WidgetComponentProps,
  WidgetType,
  WIDGET_LIBRARY,
  WidgetMetadata,
} from "../../types/dashboard";
import { useTheme } from "../../contexts/ThemeContext";
import { Settings, GripVertical, Edit3, Trash2 } from "lucide-react";

// Import widget components directly instead of lazy loading
import PortfolioOverview from "../widgets/PortfolioOverview";
import PortfolioChart from "../widgets/PortfolioChart";
import Watchlist from "../widgets/Watchlist";
import MarketSummary from "../widgets/MarketSummary";
import AIInsightsWidget from "../widgets/AIInsightsWidget";
import RecentTransactions from "../widgets/RecentTransactions";
import PerformanceMetrics from "../widgets/PerformanceMetrics";
import Alerts from "../widgets/Alerts";
import NewsFeed from "../widgets/NewsFeed";
import SectorPerformance from "../widgets/SectorPerformance";
import TopMovers from "../widgets/TopMovers";
import EconomicCalendar from "../widgets/EconomicCalendar";

// Widget components mapping
const widgetComponents = {
  "portfolio-overview": PortfolioOverview,
  "portfolio-chart": PortfolioChart,
  watchlist: Watchlist,
  "market-summary": MarketSummary,
  "ai-insights": AIInsightsWidget,
  "recent-transactions": RecentTransactions,
  "performance-metrics": PerformanceMetrics,
  alerts: Alerts,
  "news-feed": NewsFeed,
  "sector-performance": SectorPerformance,
  "top-movers": TopMovers,
  "economic-calendar": EconomicCalendar,
};

const ResponsiveGridLayout = WidthProvider(Responsive);

// Extend RGL Layout type to include our custom properties if we pass them to items
interface CustomLayout extends Layout {
  isLocked?: boolean;
}

interface EnterpriseWidgetGridProps {
  layouts: Layouts;
  isEditMode: boolean;
  onLayoutChange: (newLayout: Layout[], allLayouts: Layouts) => void;
  onWidgetRemove: (widgetId: string) => void;
  onWidgetSettings: (widgetId: string) => void;
  onWidgetDuplicate?: (widgetId: string) => void;
  getWidgetConfig: (widgetId: string) => WidgetConfig | undefined;
  currentBreakpoint: keyof DashboardBreakpoints;
}

const EnterpriseWidgetGrid: React.FC<EnterpriseWidgetGridProps> = ({
  layouts,
  isEditMode,
  onLayoutChange,
  onWidgetRemove,
  onWidgetSettings,
  onWidgetDuplicate,
  getWidgetConfig,
  currentBreakpoint,
}) => {
  const { isDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const transformedLayouts = useMemo(() => {
    const newLayouts: Layouts = {};
    for (const bp of Object.keys(layouts) as Array<
      keyof DashboardBreakpoints
    >) {
      if (layouts[bp] && Array.isArray(layouts[bp])) {
        newLayouts[bp] = layouts[bp].map((item: Layout) => {
          const widgetCfg = getWidgetConfig(item.i);
          return {
            ...item,
            i: item.i.toString(),
            isDraggable: isEditMode && !widgetCfg?.isLocked,
            isResizable:
              isEditMode &&
              !widgetCfg?.isLocked &&
              WIDGET_LIBRARY.find((w) => w.type === widgetCfg?.type)
                ?.isResizable,
          };
        });
      }
    }
    return newLayouts;
  }, [layouts, isEditMode, getWidgetConfig]);

  const handleLayoutChange = useCallback(
    (newLayout: Layout[], allLayouts: Layouts) => {
      if (mounted) {
        onLayoutChange(newLayout, allLayouts);
      }
    },
    [mounted, onLayoutChange],
  );

  const renderWidget = (widgetId: string) => {
    const widgetConfig = getWidgetConfig(widgetId);
    if (!widgetConfig) {
      return (
        <div
          style={{
            padding: "var(--spacing-md)",
            color: "var(--color-danger-fg)",
          }}
        >
          Widget config not found: {widgetId}
        </div>
      );
    }

    const WidgetComponent = widgetComponents[widgetConfig.type];
    if (!WidgetComponent) {
      return (
        <div
          style={{
            padding: "var(--spacing-md)",
            color: "var(--color-danger-fg)",
          }}
        >
          Widget type not supported: {widgetConfig.type}
        </div>
      );
    }

    return (
      <WidgetComponent
        widgetId={widgetId}
        config={widgetConfig}
        isEditMode={isEditMode}
        className={`widget-component-wrapper`}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  };

  const currentLayoutForRGL = useMemo(() => {
    return transformedLayouts[currentBreakpoint] || [];
  }, [transformedLayouts, currentBreakpoint]);

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "500px",
          width: "100%",
          backgroundColor: "var(--color-background-muted)",
        }}
      />
    );
  }

  // RGL expects breakpoints as Record<string, number>
  // Cast to unknown first to satisfy TypeScript when converting specific keys to a general string index
  const rglBreakpoints = APP_DASHBOARD_BREAKPOINTS as unknown as Record<
    string,
    number
  >;

  return (
    <div
      className={`widget-grid-container ${isDarkMode ? "dark-mode" : "light-mode"}`}
      style={{
        fontFamily: "var(--font-family-primary)",
        width: "100%",
        maxWidth: "100%",
        minHeight: "100%",
        position: "relative",
      }}
    >
      <ResponsiveGridLayout
        layouts={transformedLayouts}
        breakpoints={rglBreakpoints}
        cols={{
          xl: DEFAULT_LAYOUTS.xl?.cols || 16,
          lg: DEFAULT_LAYOUTS.lg.cols,
          md: DEFAULT_LAYOUTS.md.cols,
          sm: DEFAULT_LAYOUTS.sm.cols,
          xs: DEFAULT_LAYOUTS.xs.cols,
          xxs: DEFAULT_LAYOUTS.xxs.cols,
        }}
        rowHeight={60}
        margin={{
          xl: DEFAULT_LAYOUTS.xl?.margin || [20, 20],
          lg: DEFAULT_LAYOUTS.lg.margin,
          md: DEFAULT_LAYOUTS.md.margin,
          sm: DEFAULT_LAYOUTS.sm.margin,
          xs: DEFAULT_LAYOUTS.xs.margin,
          xxs: DEFAULT_LAYOUTS.xxs.margin,
        }}
        containerPadding={{
          xl: DEFAULT_LAYOUTS.xl?.containerPadding || [20, 20],
          lg: DEFAULT_LAYOUTS.lg.containerPadding,
          md: DEFAULT_LAYOUTS.md.containerPadding,
          sm: DEFAULT_LAYOUTS.sm.containerPadding,
          xs: DEFAULT_LAYOUTS.xs.containerPadding,
          xxs: DEFAULT_LAYOUTS.xxs.containerPadding,
        }}
        draggableHandle=".widget-drag-handle"
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        measureBeforeMount={false}
        useCSSTransforms={true}
        compactType={"vertical"}
        preventCollision={false}
        autoSize={true}
        width="100%"
        style={{
          width: "100%",
          maxWidth: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        {currentLayoutForRGL.map((item: CustomLayout) => {
          const widgetConfig = getWidgetConfig(item.i);
          if (!widgetConfig || !widgetConfig.isVisible) return null;
          const widgetMeta = WIDGET_LIBRARY.find(
            (w) => w.type === widgetConfig.type,
          );

          return (
            <div
              key={item.i}
              className={`widget-wrapper ${isEditMode ? "widget-editable" : ""}`}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--border-radius-md)",
                boxShadow: "var(--shadow-sm)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              {isEditMode && (
                <div
                  className="widget-edit-toolbar widget-drag-handle"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--spacing-xs) var(--spacing-sm)",
                    backgroundColor: "var(--color-surface-hover)",
                    borderBottom: "1px solid var(--color-border-muted)",
                    cursor: "move",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-xs)",
                    }}
                  >
                    <GripVertical size={16} />
                    <span
                      style={{
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      {widgetConfig.title || widgetMeta?.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                    {onWidgetDuplicate && (
                      <button
                        title="Duplicate Widget"
                        onClick={() =>
                          onWidgetDuplicate && onWidgetDuplicate(item.i)
                        }
                        style={iconButtonStyle}
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                    <button
                      title="Widget Settings"
                      onClick={() => onWidgetSettings(item.i)}
                      style={iconButtonStyle}
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      title="Remove Widget"
                      onClick={() => onWidgetRemove(item.i)}
                      style={{
                        ...iconButtonStyle,
                        color: "var(--color-danger-fg)",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
              <div
                className="widget-content"
                style={{
                  flexGrow: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "var(--spacing-sm)",
                  width: "100%",
                  height: "100%",
                  boxSizing: "border-box",
                }}
              >
                {renderWidget(item.i)}
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

const iconButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: "var(--spacing-xxs)",
  cursor: "pointer",
  color: "var(--color-text-secondary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default EnterpriseWidgetGrid;
