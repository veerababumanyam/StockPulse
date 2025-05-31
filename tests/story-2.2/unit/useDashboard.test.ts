/**
 * useDashboard Hook Unit Tests
 * Tests the core dashboard state management logic
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDashboard } from '../../../src/hooks/useDashboard';
import { WidgetType } from '../../../src/types/dashboard';

// Mock the dashboard service
const mockDashboardService = {
  getDashboardConfig: vi.fn(),
  saveLayout: vi.fn(),
  updateWidgetConfig: vi.fn(),
  resetToDefault: vi.fn(),
};

// Mock the generateWidgetId utility
const mockGenerateWidgetId = vi.fn(() => `widget-${Date.now()}-test123`);

// Mock modules
vi.mock('../../../src/services/dashboardService', () => ({
  dashboardService: mockDashboardService,
}));

vi.mock('../../../src/utils/dashboard', () => ({
  generateWidgetId: mockGenerateWidgetId,
}));

describe('useDashboard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock responses
    mockDashboardService.getDashboardConfig.mockResolvedValue({
      id: 'test-dashboard',
      name: 'Test Dashboard',
      layout: { widgets: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    mockDashboardService.saveLayout.mockResolvedValue({
      id: 'test-dashboard',
      name: 'Test Dashboard',
      layout: { widgets: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Mock console to avoid noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with loading state', async () => {
      const { result } = renderHook(() => useDashboard());
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.currentLayout).toBe(null);
      expect(result.current.config).toBe(null);
      expect(result.current.isEditMode).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should load dashboard configuration on mount', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockDashboardService.getDashboardConfig).toHaveBeenCalledTimes(1);
      expect(result.current.currentLayout).toEqual({ widgets: [] });
      expect(result.current.config).toBeDefined();
    });

    it('should handle dashboard loading errors', async () => {
      mockDashboardService.getDashboardConfig.mockRejectedValue(
        new Error('Failed to load dashboard')
      );

      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load dashboard');
      expect(result.current.currentLayout).toEqual({ widgets: [] }); // Fallback
    });
  });

  describe('Adding Widgets', () => {
    it('should add a widget to the layout', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      expect(mockGenerateWidgetId).toHaveBeenCalled();
      expect(result.current.currentLayout?.widgets).toHaveLength(1);
      expect(result.current.currentLayout?.widgets[0].type).toBe('portfolio-overview');
      expect(result.current.hasUnsavedChanges).toBe(true);
      expect(result.current.isEditMode).toBe(true); // Auto-enabled
    });

    it('should allow multiple widgets of the same type', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add first widget
      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      // Add second widget of same type
      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      expect(result.current.currentLayout?.widgets).toHaveLength(2);
      expect(result.current.currentLayout?.widgets[0].type).toBe('portfolio-overview');
      expect(result.current.currentLayout?.widgets[1].type).toBe('portfolio-overview');
      expect(result.current.currentLayout?.widgets[0].id).not.toBe(
        result.current.currentLayout?.widgets[1].id
      );
    });

    it('should handle invalid widget types gracefully', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addWidget('invalid-widget-type' as WidgetType);
      });

      expect(result.current.currentLayout?.widgets).toHaveLength(0);
      expect(console.error).toHaveBeenCalledWith(
        'Widget type invalid-widget-type not found in library'
      );
    });

    it('should not add widget if currentLayout is null', async () => {
      const { result } = renderHook(() => useDashboard());
      
      // Don't wait for loading to complete, try to add widget immediately
      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      expect(mockGenerateWidgetId).not.toHaveBeenCalled();
    });
  });

  describe('Removing Widgets', () => {
    it('should remove a widget from the layout', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add a widget first
      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      const widgetId = result.current.currentLayout?.widgets[0].id;
      expect(widgetId).toBeDefined();

      // Remove the widget
      act(() => {
        result.current.removeWidget(widgetId!);
      });

      expect(result.current.currentLayout?.widgets).toHaveLength(0);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should handle removing non-existent widget gracefully', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.removeWidget('non-existent-widget-id');
      });

      expect(result.current.currentLayout?.widgets).toHaveLength(0);
    });
  });

  describe('Edit Mode', () => {
    it('should toggle edit mode', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isEditMode).toBe(false);

      act(() => {
        result.current.toggleEditMode();
      });

      expect(result.current.isEditMode).toBe(true);

      act(() => {
        result.current.toggleEditMode();
      });

      expect(result.current.isEditMode).toBe(false);
    });

    it('should auto-enable edit mode when adding widgets', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isEditMode).toBe(false);

      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      expect(result.current.isEditMode).toBe(true);
    });
  });

  describe('Layout Saving', () => {
    it('should save layout successfully', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add a widget to create unsaved changes
      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      // Save layout
      await act(async () => {
        await result.current.saveLayout();
      });

      expect(mockDashboardService.saveLayout).toHaveBeenCalledWith(
        result.current.currentLayout
      );
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should handle save layout errors', async () => {
      mockDashboardService.saveLayout.mockRejectedValue(
        new Error('Save failed')
      );

      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add a widget
      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      // Try to save (should throw)
      await expect(
        act(async () => {
          await result.current.saveLayout();
        })
      ).rejects.toThrow('Save failed');

      expect(console.error).toHaveBeenCalledWith(
        'Failed to save dashboard layout:',
        expect.any(Error)
      );
    });

    it('should auto-save when exiting edit mode with unsaved changes', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add a widget (auto-enables edit mode)
      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      expect(result.current.isEditMode).toBe(true);
      expect(result.current.hasUnsavedChanges).toBe(true);

      // Exit edit mode (should trigger auto-save)
      act(() => {
        result.current.toggleEditMode();
      });

      // Wait for auto-save to trigger
      await waitFor(() => {
        expect(mockDashboardService.saveLayout).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Layout Updates', () => {
    it('should update layout when called', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newLayout = {
        widgets: [
          {
            id: 'test-widget',
            type: 'portfolio-overview' as WidgetType,
            layout: {
              lg: { x: 0, y: 0, w: 4, h: 3 },
            },
            config: {},
          },
        ],
      };

      act(() => {
        result.current.updateLayout(newLayout);
      });

      expect(result.current.currentLayout).toEqual(newLayout);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe('Widget Configuration', () => {
    it('should update widget configuration', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add a widget first
      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      const widgetId = result.current.currentLayout?.widgets[0].id;
      const newConfig = { showCash: false, refreshInterval: 60000 };

      act(() => {
        result.current.updateWidgetConfig(widgetId!, newConfig);
      });

      const updatedWidget = result.current.currentLayout?.widgets[0];
      expect(updatedWidget?.config).toEqual(newConfig);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe('Reset Layout', () => {
    it('should reset layout to saved state', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const originalLayout = result.current.currentLayout;

      // Add a widget to create changes
      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      expect(result.current.currentLayout?.widgets).toHaveLength(1);

      // Reset layout
      act(() => {
        result.current.resetLayout();
      });

      expect(result.current.currentLayout).toEqual(originalLayout);
    });
  });

  describe('Computed Properties', () => {
    it('should compute existing widget types correctly', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.existingWidgetTypes).toEqual([]);

      // Add widgets
      act(() => {
        result.current.addWidget('portfolio-overview');
        result.current.addWidget('watchlist');
        result.current.addWidget('portfolio-overview'); // Duplicate type
      });

      expect(result.current.existingWidgetTypes).toEqual([
        'portfolio-overview',
        'watchlist',
        'portfolio-overview',
      ]);
    });

    it('should detect unsaved changes correctly', async () => {
      const { result } = renderHook(() => useDashboard());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasUnsavedChanges).toBe(false);

      // Add a widget
      act(() => {
        result.current.addWidget('portfolio-overview');
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      // Save layout
      await act(async () => {
        await result.current.saveLayout();
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });
}); 