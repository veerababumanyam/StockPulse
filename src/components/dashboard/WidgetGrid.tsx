'use client';

/**
 * StockPulse Widget Grid - Enterprise-Grade
 * Customizable and responsive widget grid system using React Grid Layout.
 * Integrates with central theme and Story 2.2 requirements.
 */

import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import { 
  WidgetConfig,
  DashboardBreakpoints,
  DASHBOARD_BREAKPOINTS as APP_DASHBOARD_BREAKPOINTS,
  DEFAULT_LAYOUTS,
  WidgetComponentProps,
  WidgetType,
  WIDGET_LIBRARY,
  WidgetMetadata
} from '../../types/dashboard';
import { useTheme } from '../../contexts/ThemeContext';
import { Settings, GripVertical, Edit3, Trash2 } from 'lucide-react';

// Lazy load widget components for better performance
const WIDGET_COMPONENTS: Record<WidgetType, React.ComponentType<WidgetComponentProps>> = {
  'portfolio-overview': React.lazy(() => import('../widgets/PortfolioOverview')),
  'portfolio-chart': React.lazy(() => import('../widgets/PortfolioChart')),
  'watchlist': React.lazy(() => import('../widgets/Watchlist')),
  'market-summary': React.lazy(() => import('../widgets/MarketSummary')),
  'ai-insights': React.lazy(() => import('../widgets/AIInsights')),
  'recent-transactions': React.lazy(() => import('../widgets/RecentTransactions')),
  'performance-metrics': React.lazy(() => import('../widgets/PerformanceMetrics')),
  'alerts': React.lazy(() => import('../widgets/Alerts')),
  'news-feed': React.lazy(() => import('../widgets/NewsFeed')),
  'sector-performance': React.lazy(() => import('../widgets/SectorPerformance')),
  'top-movers': React.lazy(() => import('../widgets/TopMovers')),
  'economic-calendar': React.lazy(() => import('../widgets/EconomicCalendar')),
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
    for (const bp of Object.keys(layouts) as Array<keyof DashboardBreakpoints>) {
      if (layouts[bp] && Array.isArray(layouts[bp])) {
        newLayouts[bp] = layouts[bp].map((item: Layout) => {
          const widgetCfg = getWidgetConfig(item.i);
          return {
            ...item,
            i: item.i.toString(),
            isDraggable: isEditMode && !(widgetCfg?.isLocked),
            isResizable: isEditMode && !(widgetCfg?.isLocked) && WIDGET_LIBRARY.find(w => w.type === widgetCfg?.type)?.isResizable,
          };
        });
      }
    }
    return newLayouts;
  }, [layouts, isEditMode, getWidgetConfig]);

  const handleLayoutChange = useCallback((newLayout: Layout[], allLayouts: Layouts) => {
    if (mounted) { 
      onLayoutChange(newLayout, allLayouts);
    }
  }, [mounted, onLayoutChange]);

  const renderWidget = (widgetId: string) => {
    const widgetConfig = getWidgetConfig(widgetId);
    if (!widgetConfig) {
      return <div style={{ padding: 'var(--spacing-md)', color: 'var(--color-danger-fg)' }}>Widget config not found: {widgetId}</div>;
    }

    const WidgetComponent = WIDGET_COMPONENTS[widgetConfig.type];
    if (!WidgetComponent) {
      return <div style={{ padding: 'var(--spacing-md)', color: 'var(--color-danger-fg)' }}>Widget type not supported: {widgetConfig.type}</div>;
    }

    return (
      <React.Suspense fallback={<div style={{ padding: 'var(--spacing-md)' }}>Loading widget...</div>}>
        <WidgetComponent 
          widgetId={widgetId} 
          config={widgetConfig} 
          isEditMode={isEditMode} 
          className="widget-component-wrapper"
        />
      </React.Suspense>
    );
  };

  const currentLayoutForRGL = useMemo(() => {
    return transformedLayouts[currentBreakpoint] || [];
  }, [transformedLayouts, currentBreakpoint]);
  
  if (!mounted) {
    return <div style={{ minHeight: '500px', width: '100%', backgroundColor: 'var(--color-background-muted)' }} />;
  }
  
  // RGL expects breakpoints as Record<string, number>
  // Cast to unknown first to satisfy TypeScript when converting specific keys to a general string index
  const rglBreakpoints = APP_DASHBOARD_BREAKPOINTS as unknown as Record<string, number>;

  return (
    <div 
      className={`widget-grid-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
      style={{
        fontFamily: 'var(--font-family-primary)',
        width: '100%',
        minHeight: '100%',
      }}
    >
      <ResponsiveGridLayout
        layouts={transformedLayouts}
        breakpoints={rglBreakpoints}
        cols={{
          lg: DEFAULT_LAYOUTS.lg.cols,
          md: DEFAULT_LAYOUTS.md.cols,
          sm: DEFAULT_LAYOUTS.sm.cols,
          xs: DEFAULT_LAYOUTS.xs.cols,
          xxs: DEFAULT_LAYOUTS.xxs.cols,
          ...(DEFAULT_LAYOUTS.xl && { xl: DEFAULT_LAYOUTS.xl.cols }),
        }}
        rowHeight={DEFAULT_LAYOUTS.lg.rowHeight} 
        margin={DEFAULT_LAYOUTS.lg.margin} 
        containerPadding={DEFAULT_LAYOUTS.lg.containerPadding}
        draggableHandle='.widget-drag-handle'
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        measureBeforeMount={false} 
        useCSSTransforms={true}
        compactType={'vertical'} 
        preventCollision={false} 
        style={{ width: '100%' }}
      >
        {currentLayoutForRGL.map((item: CustomLayout) => {
          const widgetConfig = getWidgetConfig(item.i);
          if (!widgetConfig || !widgetConfig.isVisible) return null;
          const widgetMeta = WIDGET_LIBRARY.find(w => w.type === widgetConfig.type);

          return (
            <div 
              key={item.i} 
              className={`widget-wrapper ${isEditMode ? 'widget-editable' : ''}`}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: `1px solid var(--color-border-subtle)`,
                borderRadius: 'var(--border-radius-md)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden', 
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {isEditMode && (
                <div 
                  className="widget-edit-toolbar widget-drag-handle" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    backgroundColor: 'var(--color-surface-hover)',
                    borderBottom: `1px solid var(--color-border-muted)`,
                    cursor: 'move',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    <GripVertical size={16} />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      {widgetConfig.title || widgetMeta?.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                    {onWidgetDuplicate && (
                      <button 
                        title="Duplicate Widget" 
                        onClick={() => onWidgetDuplicate && onWidgetDuplicate(item.i)}
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
                      style={{...iconButtonStyle, color: 'var(--color-danger-fg)'}}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
              <div className="widget-content" style={{ flexGrow: 1, overflowY: 'auto', padding: 'var(--spacing-sm)' }}>
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
  background: 'none',
  border: 'none',
  padding: 'var(--spacing-xxs)',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default EnterpriseWidgetGrid; 