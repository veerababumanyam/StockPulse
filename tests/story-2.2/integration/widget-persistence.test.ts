/**
 * Widget Persistence Integration Tests
 * Tests the complete widget lifecycle: add, persist, remove, save
 * 
 * This test suite verifies:
 * - Adding widgets to dashboard
 * - Widget persistence across page reloads
 * - Removing widgets
 * - Layout saving and loading
 * - Multiple widgets of same type
 * - Auto-save functionality
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock the dashboard service
const mockDashboardService = {
  getDashboardConfig: vi.fn(),
  saveLayout: vi.fn(),
  updateWidgetConfig: vi.fn(),
  resetToDefault: vi.fn(),
};

// Mock the auth service
const mockAuthService = {
  getCsrfToken: vi.fn(() => 'mock-csrf-token'),
  isAuthenticated: vi.fn(() => true),
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock modules
vi.mock('../../../src/services/dashboardService', () => ({
  dashboardService: mockDashboardService,
}));

vi.mock('../../../src/services/authService', () => ({
  authService: mockAuthService,
}));

// Mock react-grid-layout
vi.mock('react-grid-layout', () => ({
  Responsive: ({ children, onLayoutChange, onBreakpointChange }: any) => (
    <div data-testid="responsive-grid" onClick={() => {
      // Simulate layout change
      if (onLayoutChange) {
        onLayoutChange([]);
      }
      if (onBreakpointChange) {
        onBreakpointChange('lg');
      }
    }}>
      {children}
    </div>
  ),
  WidthProvider: (Component: any) => Component,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Import components after mocks
import Dashboard from '../../../src/pages/Dashboard';
import { DashboardConfig, DashboardLayout, WidgetType } from '../../../src/types/dashboard';

// Test utilities
const createMockDashboardConfig = (widgets: any[] = []): DashboardConfig => ({
  id: 'test-dashboard',
  name: 'Test Dashboard',
  layout: { widgets },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createMockWidget = (type: WidgetType, id?: string) => ({
  id: id || `widget-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  type,
  layout: {
    lg: { x: 0, y: 0, w: 4, h: 3 },
    md: { x: 0, y: 0, w: 4, h: 3 },
    sm: { x: 0, y: 0, w: 3, h: 3 },
    xs: { x: 0, y: 0, w: 2, h: 3 },
    xxs: { x: 0, y: 0, w: 2, h: 2 },
  },
  config: {},
});

describe('Widget Persistence Tests', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock responses
    mockDashboardService.getDashboardConfig.mockResolvedValue(
      createMockDashboardConfig()
    );
    mockDashboardService.saveLayout.mockResolvedValue(
      createMockDashboardConfig()
    );
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Adding Widgets', () => {
    it('should add a widget when clicked in widget library', async () => {
      render(<Dashboard />);
      
      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/start customizing/i)).toBeInTheDocument();
      });

      // Click customize dashboard button
      const customizeButton = screen.getByText(/start customizing/i);
      await user.click(customizeButton);

      // Wait for widget library to open
      await waitFor(() => {
        expect(screen.getByText(/widget library/i)).toBeInTheDocument();
      });

      // Find and click add widget button for portfolio overview
      const addWidgetButtons = screen.getAllByText(/add widget/i);
      expect(addWidgetButtons.length).toBeGreaterThan(0);
      
      await user.click(addWidgetButtons[0]);

      // Verify widget was added (check for widget placeholder or content)
      await waitFor(() => {
        expect(screen.getByTestId('responsive-grid')).toBeInTheDocument();
      });

      // Verify save layout was called
      expect(mockDashboardService.saveLayout).toHaveBeenCalled();
    });

    it('should allow adding multiple widgets of the same type', async () => {
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/start customizing/i)).toBeInTheDocument();
      });

      // Enter edit mode
      const customizeButton = screen.getByText(/start customizing/i);
      await user.click(customizeButton);

      // Add first widget
      await waitFor(() => {
        expect(screen.getByText(/widget library/i)).toBeInTheDocument();
      });
      
      const addButtons = screen.getAllByText(/add widget/i);
      await user.click(addButtons[0]); // Add first portfolio widget
      
      // Close modal and reopen
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      // Reopen widget library
      const addWidgetButton = screen.getByText(/add widget/i);
      await user.click(addWidgetButton);
      
      // Add second widget of same type
      await waitFor(() => {
        expect(screen.getByText(/widget library/i)).toBeInTheDocument();
      });
      
      const addButtonsSecond = screen.getAllByText(/add widget/i);
      await user.click(addButtonsSecond[0]); // Add second portfolio widget

      // Verify both widgets were added (saveLayout called twice)
      expect(mockDashboardService.saveLayout).toHaveBeenCalledTimes(2);
    });

    it('should auto-enable edit mode when adding widgets', async () => {
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/start customizing/i)).toBeInTheDocument();
      });

      // Initially not in edit mode
      expect(screen.queryByText(/widget edit mode/i)).not.toBeInTheDocument();

      // Add a widget
      const customizeButton = screen.getByText(/start customizing/i);
      await user.click(customizeButton);

      await waitFor(() => {
        expect(screen.getByText(/widget library/i)).toBeInTheDocument();
      });
      
      const addButtons = screen.getAllByText(/add widget/i);
      await user.click(addButtons[0]);

      // Should now be in edit mode
      await waitFor(() => {
        expect(screen.getByText(/widget edit mode/i)).toBeInTheDocument();
      });
    });
  });

  describe('Widget Persistence', () => {
    it('should persist widgets across page reloads', async () => {
      const mockWidgets = [
        createMockWidget('portfolio-overview', 'widget-1'),
        createMockWidget('watchlist', 'widget-2'),
      ];

      // Mock dashboard with existing widgets
      mockDashboardService.getDashboardConfig.mockResolvedValue(
        createMockDashboardConfig(mockWidgets)
      );

      const { rerender } = render(<Dashboard />);
      
      // Wait for dashboard to load with widgets
      await waitFor(() => {
        expect(mockDashboardService.getDashboardConfig).toHaveBeenCalled();
      });

      // Simulate page reload by re-rendering
      rerender(<Dashboard />);

      // Verify dashboard config is loaded again
      await waitFor(() => {
        expect(mockDashboardService.getDashboardConfig).toHaveBeenCalledTimes(2);
      });

      // Widgets should still be present (grid should be rendered)
      expect(screen.getByTestId('responsive-grid')).toBeInTheDocument();
    });

    it('should handle empty dashboard state correctly', async () => {
      // Mock empty dashboard
      mockDashboardService.getDashboardConfig.mockResolvedValue(
        createMockDashboardConfig([])
      );

      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/welcome to your custom dashboard/i)).toBeInTheDocument();
      });

      // Should show empty state
      expect(screen.getByText(/start customizing/i)).toBeInTheDocument();
      expect(screen.getByText(/build your perfect trading dashboard/i)).toBeInTheDocument();
    });

    it('should handle dashboard loading errors gracefully', async () => {
      // Mock service error
      mockDashboardService.getDashboardConfig.mockRejectedValue(
        new Error('Failed to load dashboard')
      );

      render(<Dashboard />);
      
      // Should still render dashboard with fallback state
      await waitFor(() => {
        expect(screen.getByText(/start customizing/i)).toBeInTheDocument();
      });
    });
  });

  describe('Removing Widgets', () => {
    it('should remove widgets when delete button is clicked', async () => {
      const mockWidgets = [
        createMockWidget('portfolio-overview', 'widget-1'),
      ];

      mockDashboardService.getDashboardConfig.mockResolvedValue(
        createMockDashboardConfig(mockWidgets)
      );

      render(<Dashboard />);
      
      // Wait for dashboard to load
      await waitFor(() => {
        expect(mockDashboardService.getDashboardConfig).toHaveBeenCalled();
      });

      // Enter edit mode
      const customizeButton = screen.getByText(/customize dashboard/i);
      await user.click(customizeButton);

      // Look for remove widget button (X button)
      await waitFor(() => {
        const removeButtons = screen.getAllByLabelText(/remove.*widget/i);
        expect(removeButtons.length).toBeGreaterThan(0);
      });

      const removeButton = screen.getAllByLabelText(/remove.*widget/i)[0];
      await user.click(removeButton);

      // Verify widget was removed (saveLayout should be called)
      await waitFor(() => {
        expect(mockDashboardService.saveLayout).toHaveBeenCalled();
      });
    });
  });

  describe('Layout Saving', () => {
    it('should save layout when exiting edit mode', async () => {
      const mockWidgets = [
        createMockWidget('portfolio-overview', 'widget-1'),
      ];

      mockDashboardService.getDashboardConfig.mockResolvedValue(
        createMockDashboardConfig(mockWidgets)
      );

      render(<Dashboard />);
      
      await waitFor(() => {
        expect(mockDashboardService.getDashboardConfig).toHaveBeenCalled();
      });

      // Enter edit mode
      const customizeButton = screen.getByText(/customize dashboard/i);
      await user.click(customizeButton);

      await waitFor(() => {
        expect(screen.getByText(/widget edit mode/i)).toBeInTheDocument();
      });

      // Exit edit mode
      const exitButton = screen.getByText(/exit edit/i);
      await user.click(exitButton);

      // Should auto-save when exiting edit mode
      await waitFor(() => {
        expect(mockDashboardService.saveLayout).toHaveBeenCalled();
      });
    });

    it('should handle save layout errors gracefully', async () => {
      mockDashboardService.saveLayout.mockRejectedValue(
        new Error('Failed to save layout')
      );

      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/start customizing/i)).toBeInTheDocument();
      });

      // Try to add a widget (which triggers save)
      const customizeButton = screen.getByText(/start customizing/i);
      await user.click(customizeButton);

      await waitFor(() => {
        expect(screen.getByText(/widget library/i)).toBeInTheDocument();
      });
      
      const addButtons = screen.getAllByText(/add widget/i);
      await user.click(addButtons[0]);

      // Should handle error gracefully (not crash)
      await waitFor(() => {
        expect(mockDashboardService.saveLayout).toHaveBeenCalled();
      });

      // Dashboard should still be functional
      expect(screen.getByTestId('responsive-grid')).toBeInTheDocument();
    });
  });

  describe('Widget Configuration', () => {
    it('should open widget settings modal when settings button is clicked', async () => {
      const mockWidgets = [
        createMockWidget('portfolio-overview', 'widget-1'),
      ];

      mockDashboardService.getDashboardConfig.mockResolvedValue(
        createMockDashboardConfig(mockWidgets)
      );

      render(<Dashboard />);
      
      await waitFor(() => {
        expect(mockDashboardService.getDashboardConfig).toHaveBeenCalled();
      });

      // Enter edit mode
      const customizeButton = screen.getByText(/customize dashboard/i);
      await user.click(customizeButton);

      // Look for settings button
      await waitFor(() => {
        const settingsButtons = screen.getAllByLabelText(/configure.*widget/i);
        expect(settingsButtons.length).toBeGreaterThan(0);
      });

      const settingsButton = screen.getAllByLabelText(/configure.*widget/i)[0];
      await user.click(settingsButton);

      // Should open settings modal
      await waitFor(() => {
        expect(screen.getByText(/widget settings/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid widget additions without issues', async () => {
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/start customizing/i)).toBeInTheDocument();
      });

      const customizeButton = screen.getByText(/start customizing/i);
      await user.click(customizeButton);

      await waitFor(() => {
        expect(screen.getByText(/widget library/i)).toBeInTheDocument();
      });

      // Rapidly add multiple widgets
      const addButtons = screen.getAllByText(/add widget/i);
      
      for (let i = 0; i < Math.min(3, addButtons.length); i++) {
        await user.click(addButtons[i]);
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should handle all additions
      expect(mockDashboardService.saveLayout).toHaveBeenCalledTimes(3);
    });

    it('should handle widget library modal open/close correctly', async () => {
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/start customizing/i)).toBeInTheDocument();
      });

      // Open widget library
      const customizeButton = screen.getByText(/start customizing/i);
      await user.click(customizeButton);

      await waitFor(() => {
        expect(screen.getByText(/widget library/i)).toBeInTheDocument();
      });

      // Close widget library
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/widget library/i)).not.toBeInTheDocument();
      });

      // Should be able to reopen
      const addWidgetButton = screen.getByText(/add widget/i);
      await user.click(addWidgetButton);

      await waitFor(() => {
        expect(screen.getByText(/widget library/i)).toBeInTheDocument();
      });
    });
  });
}); 