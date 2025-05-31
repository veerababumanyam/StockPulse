'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Layouts as RGLPrimitiveLayouts } from 'react-grid-layout';
import WidgetLibrary from '../components/dashboard/WidgetLibrary';
import EnterpriseWidgetGrid from '../components/dashboard/WidgetGrid';
import { dashboardService } from '../services/dashboardService';
import { 
  DashboardConfig, 
  WidgetConfig, 
  WidgetType, 
  DashboardBreakpoints, 
  DASHBOARD_BREAKPOINTS,
  DEFAULT_DASHBOARD_CONFIG,
  WidgetMetadata,
  WIDGET_LIBRARY,
  DashboardLayout
} from '../types/dashboard';
import { useTheme } from '../contexts/ThemeContext';
import { PlusCircle, Edit, Save, XCircle, Layers, RefreshCw, Settings2, Columns, Rows, Maximize, Minimize } from 'lucide-react';

// Helper to get current breakpoint
const getCurrentBreakpoint = (): keyof DashboardBreakpoints => {
  const width = window.innerWidth;
  
  if (width >= DASHBOARD_BREAKPOINTS.xl) {
    return 'xl';
  } else if (width >= DASHBOARD_BREAKPOINTS.lg) {
    return 'lg';
  } else if (width >= DASHBOARD_BREAKPOINTS.md) {
    return 'md';
  } else if (width >= DASHBOARD_BREAKPOINTS.sm) {
    return 'sm';
  } else if (width >= DASHBOARD_BREAKPOINTS.xs) {
    return 'xs';
  } else {
    return 'xxs';
  }
};


const DashboardPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof DashboardBreakpoints>(getCurrentBreakpoint());
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const config = await dashboardService.initializeDashboard();
      setDashboardConfig(config);
      const updatedLayouts = { ...config.layouts };
      (Object.keys(DASHBOARD_BREAKPOINTS) as Array<keyof DashboardBreakpoints>).forEach(bp => {
        if (!updatedLayouts[bp]) {
          const defaultBpLayout = DEFAULT_DASHBOARD_CONFIG.layouts[bp] || { 
            breakpoint: bp, 
            cols: 12, 
            rowHeight: 60, 
            margin: [10,10], 
            containerPadding: [10,10], 
            widgets: [] 
          };
          updatedLayouts[bp] = defaultBpLayout;
        }
      });
      setDashboardConfig(prev => prev ? ({ ...prev, layouts: updatedLayouts }) : null);

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
    const handleResize = () => {
      setCurrentBreakpoint(getCurrentBreakpoint());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSaveDashboard = async () => {
    if (!dashboardConfig) return;
    setIsLoading(true);
    try {
      await dashboardService.saveDashboard(dashboardConfig);
      dashboardService._saveConfigToLocalStorage(dashboardConfig);
      setUnsavedChanges(false);
      alert('Dashboard saved successfully!');
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
        newRglLayouts[breakpoint] = widgets.map(widget => ({
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

  const handleLayoutChange = useCallback((newRglLayout: Layout[], allRglLayouts: RGLPrimitiveLayouts) => {
    if (!dashboardConfig) return;

    setDashboardConfig(prevConfig => {
      if (!prevConfig) return null;
      const newAppLayouts = { ...prevConfig.layouts };

      for (const bpKey in allRglLayouts) {
        const breakpoint = bpKey as keyof DashboardBreakpoints;
        if (allRglLayouts[breakpoint]) {
          let currentAppBpLayout = newAppLayouts[breakpoint];
          if (!currentAppBpLayout) {
            currentAppBpLayout = DEFAULT_DASHBOARD_CONFIG.layouts[breakpoint] || 
                                 { breakpoint: breakpoint, cols: 12, rowHeight: 60, margin: [10,10], containerPadding: [10,10], widgets: [] };
          }

          const updatedWidgets = allRglLayouts[breakpoint]!.map(item => {
            const existingWidget = currentAppBpLayout.widgets.find(w => w.id === item.i);
            if (existingWidget) {
              return { 
                ...existingWidget, 
                position: { x: item.x, y: item.y, w: item.w, h: item.h } 
              };
            }
            const widgetMeta = WIDGET_LIBRARY.find(w => w.type === (item.i.split('-')[0] as WidgetType));
            return {
              id: item.i,
              type: widgetMeta?.type || 'portfolio-overview', 
              position: { x: item.x, y: item.y, w: item.w, h: item.h },
              isVisible: true,
              isLocked: false,
            } as WidgetConfig;
          });
          newAppLayouts[breakpoint] = { 
            ...currentAppBpLayout,
            breakpoint: breakpoint,
            widgets: updatedWidgets 
          };
        }
      }
      return { ...prevConfig, layouts: newAppLayouts };
    });
    setUnsavedChanges(true);
  }, [dashboardConfig]);

  const handleAddWidget = useCallback((widgetType: WidgetType) => {
    if (!dashboardConfig) return;
    const newConfig = dashboardService.addWidget(dashboardConfig, widgetType, currentBreakpoint);
    if (newConfig) {
        setDashboardConfig(newConfig);
        setIsWidgetLibraryOpen(false);
        setUnsavedChanges(true);
    } else {
        console.error("[DashboardPage] Failed to add widget, addWidget returned null");
        setError("Failed to add widget. Please try again.")
    }
  }, [dashboardConfig, currentBreakpoint]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    if (!dashboardConfig) return;
    const newConfig = dashboardService.removeWidget(dashboardConfig, widgetId);
    setDashboardConfig(newConfig);
    setUnsavedChanges(true);
  }, [dashboardConfig]);

  const getWidgetConfig = useCallback((widgetId: string): WidgetConfig | undefined => {
    if (!dashboardConfig || !dashboardConfig.layouts[currentBreakpoint]) return undefined;
    return dashboardConfig.layouts[currentBreakpoint].widgets.find(w => w.id === widgetId);
  }, [dashboardConfig, currentBreakpoint]);

  const currentWidgetsOnDashboard = useMemo(() => {
    if (!dashboardConfig || !dashboardConfig.layouts[currentBreakpoint]) {
      return [];
    }
    const widgets = dashboardConfig.layouts[currentBreakpoint].widgets;
    return widgets;
  }, [dashboardConfig, currentBreakpoint]);
  
  const toolbarButtonStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    color: 'var(--color-text-secondary)',
    border: `1px solid var(--color-border-muted)`,
    padding: 'var(--spacing-sm) var(--spacing-md)',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    transition: 'background-color 0.2s, color 0.2s'
  };

  const activeToolbarButtonStyle: React.CSSProperties = {
    ...toolbarButtonStyle,
    background: 'var(--color-primary-muted)',
    color: 'var(--color-primary-fg)',
    borderColor: 'var(--color-primary)'
  };
  
  if (isLoading && !dashboardConfig) {
    return <div style={pageStyle(isDarkMode)}><div style={centeredMessageStyle}>Loading Dashboard... <RefreshCw className="animate-spin ml-2" /></div></div>;
  }

  if (error && !dashboardConfig) {
    return <div style={pageStyle(isDarkMode)}><div style={centeredMessageStyle}>Error: {error}</div></div>;
  }
  
  if (!dashboardConfig) {
    return <div style={pageStyle(isDarkMode)}><div style={centeredMessageStyle}>No dashboard data.</div></div>;
  }

  return (
    <div style={pageStyle(isDarkMode)}>
      <header style={headerStyle(isDarkMode)}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-semibold)'}}>
          {dashboardConfig.name || 'Trading Dashboard'}
        </h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          {isLoading && <RefreshCw className="animate-spin text-primary" size={20}/>}
          {error && <span style={{color: 'var(--color-danger-fg)', fontSize: 'var(--font-size-sm)'}}>{error}</span>}

          <button 
            onClick={() => setIsWidgetLibraryOpen(true)} 
            style={toolbarButtonStyle}
            title="Add new widget"
          >
            <PlusCircle size={18} /> Add Widget
          </button>
          <button 
            onClick={() => setIsEditMode(!isEditMode)} 
            style={isEditMode ? activeToolbarButtonStyle : toolbarButtonStyle}
            title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          >
            {isEditMode ? <XCircle size={18} /> : <Edit size={18} />} 
            {isEditMode ? 'Exit Edit' : 'Edit Layout'}
          </button>
          <button 
            onClick={handleSaveDashboard} 
            disabled={!unsavedChanges || isLoading}
            style={{...toolbarButtonStyle, ...(unsavedChanges && !isLoading ? {background: 'var(--color-success-muted)', color: 'var(--color-success-fg)', borderColor: 'var(--color-success)'} : {})}}
            title={unsavedChanges ? "Save Changes" : "No changes to save"}
          >
            <Save size={18} /> Save
          </button>
        </div>
      </header>

      <main style={{ flexGrow: 1, overflow: 'auto', padding: 'var(--spacing-md)' }}>
        {dashboardConfig.layouts[currentBreakpoint] ? (
            <EnterpriseWidgetGrid
                layouts={rglLayoutsProp}
                isEditMode={isEditMode}
                onLayoutChange={handleLayoutChange}
                onWidgetRemove={handleRemoveWidget}
                onWidgetSettings={(widgetId) => alert(`Settings for ${widgetId}`)}
                getWidgetConfig={getWidgetConfig}
                currentBreakpoint={currentBreakpoint}
            />
        ) : (
            <div style={centeredMessageStyle}>
                No layout defined for this screen size ({currentBreakpoint}).
                {isEditMode && " Try adding widgets or resizing your window."}
            </div>
        )}
      </main>

      <WidgetLibrary
        isOpen={isWidgetLibraryOpen}
        onClose={() => setIsWidgetLibraryOpen(false)}
        onAddWidget={handleAddWidget}
        currentWidgets={currentWidgetsOnDashboard}
      />
    </div>
  );
};

const pageStyle = (isDarkMode: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  backgroundColor: 'var(--color-background)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family-primary)'
});

const headerStyle = (isDarkMode: boolean): React.CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'var(--spacing-md) var(--spacing-lg)',
  backgroundColor: 'var(--color-surface)',
  borderBottom: `1px solid var(--color-border-subtle)`,
  boxShadow: 'var(--shadow-sm)'
});

const centeredMessageStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  fontSize: 'var(--font-size-lg)',
  color: 'var(--color-text-secondary)',
};

export default DashboardPage; 