/**
 * Enhanced Grid Layout Hook
 * Advanced layout management with React Grid Layout integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Layouts, ResponsiveProps } from 'react-grid-layout';
import { WidgetType, WidgetInstance, WIDGET_SIZES } from '../types/dashboard';

// Grid configuration
export const GRID_CONFIG = {
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight: 60,
  margin: [16, 16],
  containerPadding: [16, 16],
  autoSize: true,
  isDraggable: true,
  isResizable: true,
  preventCollision: false,
  compactType: 'vertical' as const,
  useCSSTransforms: true,
} as const;

export interface GridLayoutState {
  layouts: Layouts;
  currentBreakpoint: string;
  widgets: WidgetInstance[];
  isEditMode: boolean;
  isDragging: boolean;
  draggedWidget?: string;
  gridRef: React.RefObject<any>;
}

export interface GridLayoutActions {
  // Layout management
  updateLayouts: (layouts: Layouts) => void;
  setEditMode: (enabled: boolean) => void;
  resetLayout: () => void;
  saveLayout: () => Promise<boolean>;
  loadLayout: (layoutId: string) => Promise<boolean>;

  // Widget management
  addWidget: (type: WidgetType, position?: { x: number; y: number }) => string;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<WidgetInstance>) => void;
  duplicateWidget: (widgetId: string) => string;

  // Layout operations
  optimizeLayout: () => void;
  autoArrange: () => void;
  resizeWidget: (widgetId: string, size: { w: number; h: number }) => void;
  moveWidget: (widgetId: string, position: { x: number; y: number }) => void;

  // Responsive utilities
  getOptimalPosition: (
    type: WidgetType,
    breakpoint?: string,
  ) => { x: number; y: number };
  validateLayout: () => boolean;
  getLayoutStats: () => {
    totalWidgets: number;
    coverage: number;
    conflicts: number;
  };
}

export interface UseGridLayoutOptions {
  initialWidgets?: WidgetInstance[];
  initialLayouts?: Layouts;
  persistLayout?: boolean;
  layoutId?: string;
  onLayoutChange?: (layouts: Layouts) => void;
  onWidgetAdd?: (widget: WidgetInstance) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onEditModeChange?: (isEditMode: boolean) => void;
}

export const useGridLayout = (
  options: UseGridLayoutOptions = {},
): [GridLayoutState, GridLayoutActions] => {
  const {
    initialWidgets = [],
    initialLayouts = {},
    persistLayout = true,
    layoutId = 'default',
    onLayoutChange,
    onWidgetAdd,
    onWidgetRemove,
    onEditModeChange,
  } = options;

  // State
  const [layouts, setLayouts] = useState<Layouts>(initialLayouts);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const [widgets, setWidgets] = useState<WidgetInstance[]>(initialWidgets);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string>();

  const gridRef = useRef<any>(null);
  const layoutChangeTimer = useRef<NodeJS.Timeout>();

  // Generate unique widget ID
  const generateWidgetId = useCallback(() => {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get optimal position for new widget
  const getOptimalPosition = useCallback(
    (
      type: WidgetType,
      breakpoint = currentBreakpoint,
    ): { x: number; y: number } => {
      const currentLayout = layouts[breakpoint] || [];
      const cols =
        GRID_CONFIG.cols[breakpoint as keyof typeof GRID_CONFIG.cols] || 12;
      const widgetSize = WIDGET_SIZES[type][breakpoint] ||
        WIDGET_SIZES[type].lg || { w: 4, h: 3 };

      // Find first available position
      for (let y = 0; y < 100; y++) {
        for (let x = 0; x <= cols - widgetSize.w; x++) {
          const hasCollision = currentLayout.some((item) => {
            return !(
              x >= item.x + item.w ||
              x + widgetSize.w <= item.x ||
              y >= item.y + item.h ||
              y + widgetSize.h <= item.y
            );
          });

          if (!hasCollision) {
            return { x, y };
          }
        }
      }

      return { x: 0, y: 0 };
    },
    [layouts, currentBreakpoint],
  );

  // Add widget
  const addWidget = useCallback(
    (type: WidgetType, position?: { x: number; y: number }): string => {
      const widgetId = generateWidgetId();
      const optimalPosition = position || getOptimalPosition(type);

      const newWidget: WidgetInstance = {
        id: widgetId,
        type,
        layout: {},
        config: {},
      };

      // Create layout for all breakpoints
      const newLayouts = { ...layouts };
      Object.keys(GRID_CONFIG.breakpoints).forEach((breakpoint) => {
        const size = WIDGET_SIZES[type][breakpoint] ||
          WIDGET_SIZES[type].lg || { w: 4, h: 3 };
        newLayouts[breakpoint] = [
          ...(newLayouts[breakpoint] || []),
          {
            i: widgetId,
            x: optimalPosition.x,
            y: optimalPosition.y,
            w: size.w,
            h: size.h,
            minW: size.minW,
            maxW: size.maxW,
            minH: size.minH,
            maxH: size.maxH,
          },
        ];
      });

      setLayouts(newLayouts);
      setWidgets((prev) => [...prev, newWidget]);

      onWidgetAdd?.(newWidget);
      return widgetId;
    },
    [layouts, generateWidgetId, getOptimalPosition, onWidgetAdd],
  );

  // Remove widget
  const removeWidget = useCallback(
    (widgetId: string) => {
      const newLayouts = { ...layouts };
      Object.keys(newLayouts).forEach((breakpoint) => {
        newLayouts[breakpoint] =
          newLayouts[breakpoint]?.filter((item) => item.i !== widgetId) || [];
      });

      setLayouts(newLayouts);
      setWidgets((prev) => prev.filter((w) => w.id !== widgetId));

      onWidgetRemove?.(widgetId);
    },
    [layouts, onWidgetRemove],
  );

  // Update widget
  const updateWidget = useCallback(
    (widgetId: string, updates: Partial<WidgetInstance>) => {
      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === widgetId ? { ...widget, ...updates } : widget,
        ),
      );
    },
    [],
  );

  // Duplicate widget
  const duplicateWidget = useCallback(
    (widgetId: string): string => {
      const originalWidget = widgets.find((w) => w.id === widgetId);
      if (!originalWidget) return '';

      const newWidgetId = addWidget(originalWidget.type);
      updateWidget(newWidgetId, {
        config: { ...originalWidget.config },
      });

      return newWidgetId;
    },
    [widgets, addWidget, updateWidget],
  );

  // Update layouts
  const updateLayouts = useCallback(
    (newLayouts: Layouts) => {
      setLayouts(newLayouts);

      // Debounce layout change callback
      if (layoutChangeTimer.current) {
        clearTimeout(layoutChangeTimer.current);
      }

      layoutChangeTimer.current = setTimeout(() => {
        onLayoutChange?.(newLayouts);
      }, 500);
    },
    [onLayoutChange],
  );

  // Set edit mode
  const setEditMode = useCallback(
    (enabled: boolean) => {
      setIsEditMode(enabled);
      onEditModeChange?.(enabled);
    },
    [onEditModeChange],
  );

  // Reset layout
  const resetLayout = useCallback(() => {
    const emptyLayouts: Layouts = {};
    Object.keys(GRID_CONFIG.breakpoints).forEach((breakpoint) => {
      emptyLayouts[breakpoint] = [];
    });

    setLayouts(emptyLayouts);
    setWidgets([]);
  }, []);

  // Save layout
  const saveLayout = useCallback(async (): Promise<boolean> => {
    if (!persistLayout) return true;

    try {
      const layoutData = {
        id: layoutId,
        layouts,
        widgets: widgets.map((w) => ({
          id: w.id,
          type: w.type,
          config: w.config,
        })),
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(
        `widget-layout-${layoutId}`,
        JSON.stringify(layoutData),
      );
      return true;
    } catch (error) {
      console.error('Failed to save layout:', error);
      return false;
    }
  }, [persistLayout, layoutId, layouts, widgets]);

  // Load layout
  const loadLayout = useCallback(async (id: string): Promise<boolean> => {
    try {
      const savedData = localStorage.getItem(`widget-layout-${id}`);
      if (!savedData) return false;

      const layoutData = JSON.parse(savedData);
      setLayouts(layoutData.layouts || {});
      setWidgets(layoutData.widgets || []);
      return true;
    } catch (error) {
      console.error('Failed to load layout:', error);
      return false;
    }
  }, []);

  // Optimize layout
  const optimizeLayout = useCallback(() => {
    const newLayouts = { ...layouts };

    Object.keys(newLayouts).forEach((breakpoint) => {
      const layout = newLayouts[breakpoint] || [];
      // Sort by y position, then x position
      layout.sort((a, b) => a.y - b.y || a.x - b.x);

      // Compact layout
      layout.forEach((item, index) => {
        let newY = 0;

        // Find the minimum Y position that doesn't cause collision
        for (let y = 0; y < 100; y++) {
          const hasCollision = layout.slice(0, index).some((other) => {
            return !(
              item.x >= other.x + other.w ||
              item.x + item.w <= other.x ||
              y >= other.y + other.h ||
              y + item.h <= other.y
            );
          });

          if (!hasCollision) {
            newY = y;
            break;
          }
        }

        item.y = newY;
      });
    });

    setLayouts(newLayouts);
  }, [layouts]);

  // Auto arrange widgets
  const autoArrange = useCallback(() => {
    const newLayouts = { ...layouts };

    Object.keys(newLayouts).forEach((breakpoint) => {
      const layout = newLayouts[breakpoint] || [];
      const cols =
        GRID_CONFIG.cols[breakpoint as keyof typeof GRID_CONFIG.cols] || 12;

      let currentX = 0;
      let currentY = 0;
      let maxHeight = 0;

      layout.forEach((item) => {
        if (currentX + item.w > cols) {
          currentX = 0;
          currentY += maxHeight;
          maxHeight = 0;
        }

        item.x = currentX;
        item.y = currentY;

        currentX += item.w;
        maxHeight = Math.max(maxHeight, item.h);
      });
    });

    setLayouts(newLayouts);
  }, [layouts]);

  // Resize widget
  const resizeWidget = useCallback(
    (widgetId: string, size: { w: number; h: number }) => {
      const newLayouts = { ...layouts };

      Object.keys(newLayouts).forEach((breakpoint) => {
        const layout = newLayouts[breakpoint] || [];
        const item = layout.find((l) => l.i === widgetId);
        if (item) {
          item.w = size.w;
          item.h = size.h;
        }
      });

      setLayouts(newLayouts);
    },
    [layouts],
  );

  // Move widget
  const moveWidget = useCallback(
    (widgetId: string, position: { x: number; y: number }) => {
      const newLayouts = { ...layouts };

      Object.keys(newLayouts).forEach((breakpoint) => {
        const layout = newLayouts[breakpoint] || [];
        const item = layout.find((l) => l.i === widgetId);
        if (item) {
          item.x = position.x;
          item.y = position.y;
        }
      });

      setLayouts(newLayouts);
    },
    [layouts],
  );

  // Validate layout
  const validateLayout = useCallback((): boolean => {
    // Check for overlaps and out-of-bounds widgets
    return Object.keys(layouts).every((breakpoint) => {
      const layout = layouts[breakpoint] || [];
      const cols =
        GRID_CONFIG.cols[breakpoint as keyof typeof GRID_CONFIG.cols] || 12;

      return layout.every((item) => {
        // Check bounds
        if (item.x < 0 || item.y < 0 || item.x + item.w > cols) {
          return false;
        }

        // Check overlaps
        return !layout.some(
          (other) =>
            other !== item &&
            !(
              item.x >= other.x + other.w ||
              item.x + item.w <= other.x ||
              item.y >= other.y + other.h ||
              item.y + item.h <= other.y
            ),
        );
      });
    });
  }, [layouts]);

  // Get layout statistics
  const getLayoutStats = useCallback(() => {
    const currentLayout = layouts[currentBreakpoint] || [];
    const cols =
      GRID_CONFIG.cols[currentBreakpoint as keyof typeof GRID_CONFIG.cols] ||
      12;

    const totalWidgets = currentLayout.length;
    const maxY = Math.max(0, ...currentLayout.map((item) => item.y + item.h));
    const totalCells = cols * maxY;
    const usedCells = currentLayout.reduce(
      (sum, item) => sum + item.w * item.h,
      0,
    );
    const coverage = totalCells > 0 ? (usedCells / totalCells) * 100 : 0;

    // Count conflicts
    const conflicts = currentLayout.reduce((count, item, index) => {
      const hasConflict = currentLayout
        .slice(index + 1)
        .some(
          (other) =>
            !(
              item.x >= other.x + other.w ||
              item.x + item.w <= other.x ||
              item.y >= other.y + other.h ||
              item.y + item.h <= other.y
            ),
        );
      return hasConflict ? count + 1 : count;
    }, 0);

    return { totalWidgets, coverage: Math.round(coverage), conflicts };
  }, [layouts, currentBreakpoint]);

  // Auto-save layout when edit mode is disabled
  useEffect(() => {
    if (!isEditMode && persistLayout) {
      saveLayout();
    }
  }, [isEditMode, persistLayout, saveLayout]);

  // Handle breakpoint change
  const handleBreakpointChange = useCallback((breakpoint: string) => {
    setCurrentBreakpoint(breakpoint);
  }, []);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (layoutChangeTimer.current) {
        clearTimeout(layoutChangeTimer.current);
      }
    };
  }, []);

  const state: GridLayoutState = {
    layouts,
    currentBreakpoint,
    widgets,
    isEditMode,
    isDragging,
    draggedWidget,
    gridRef,
  };

  const actions: GridLayoutActions = {
    updateLayouts,
    setEditMode,
    resetLayout,
    saveLayout,
    loadLayout,
    addWidget,
    removeWidget,
    updateWidget,
    duplicateWidget,
    optimizeLayout,
    autoArrange,
    resizeWidget,
    moveWidget,
    getOptimalPosition,
    validateLayout,
    getLayoutStats,
  };

  return [state, actions];
};
