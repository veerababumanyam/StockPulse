/**
 * Integration Tests for Dashboard Widget System
 * Tests the complete widget system integration including grid, library, and persistence
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Dashboard from '../../../../src/pages/Dashboard';
import { dashboardService } from '../../../../src/services/dashboardService';
import { usePortfolio } from '../../../../src/hooks/usePortfolio';
import { useToast } from '../../../../src/hooks/useToast';

// Mock dependencies
vi.mock('../../../../src/services/dashboardService');
vi.mock('../../../../src/hooks/usePortfolio');
vi.mock('../../../../src/hooks/useToast');

const mockDashboardService = vi.mocked(dashboardService);
const mockUsePortfolio = vi.mocked(usePortfolio);
const mockUseToast = vi.mocked(useToast);

describe('Dashboard Widget System Integration', () => {
  const mockToast = vi.fn();
  
  const mockDashboardConfig = {
    id: 'test-config',
    userId: 'test-user',
    layouts: {
      xxs: [
        { i: 'portfolio-overview-1', x: 0, y: 0, w: 2, h: 3 },
        { i: 'portfolio-chart-1', x: 0, y: 3, w: 2, h: 4 },
      ],
      xs: [
        { i: 'portfolio-overview-1', x: 0, y: 0, w: 2, h: 3 },
        { i: 'portfolio-chart-1', x: 2, y: 0, w: 2, h: 3 },
      ],
      sm: [
        { i: 'portfolio-overview-1', x: 0, y: 0, w: 3, h: 3 },
        { i: 'portfolio-chart-1', x: 3, y: 0, w: 3, h: 3 },
      ],
      md: [
        { i: 'portfolio-overview-1', x: 0, y: 0, w: 5, h: 3 },
        { i: 'portfolio-chart-1', x: 5, y: 0, w: 5, h: 3 },
      ],
      lg: [
        { i: 'portfolio-overview-1', x: 0, y: 0, w: 6, h: 3 },
        { i: 'portfolio-chart-1', x: 6, y: 0, w: 6, h: 3 },
      ],
    },
    widgets: [
      {
        id: 'portfolio-overview-1',
        type: 'portfolio-overview',
        title: 'Portfolio Overview',
        description: 'Portfolio performance summary',
        config: {},
      },
      {
        id: 'portfolio-chart-1',
        type: 'portfolio-chart',
        title: 'Portfolio Chart',
        description: 'Portfolio performance chart',
        config: {},
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockPortfolioData = {
    totalValue: 125000,
    dayChange: 2500,
    dayChangePercent: 2.04,
    totalReturn: 15000,
    totalReturnPercent: 13.6,
    holdings: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: [],
    });

    mockUsePortfolio.mockReturnValue({
      portfolio: mockPortfolioData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockDashboardService.getDashboardConfig.mockResolvedValue(mockDashboardConfig);
    mockDashboardService.saveLayout.mockResolvedValue({
      success: true,
      config: mockDashboardConfig,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Dashboard Loading and Initialization', () => {
    it('should load dashboard configuration on mount', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(mockDashboardService.getDashboardConfig).toHaveBeenCalledTimes(1);
      });

      // Should display widgets from configuration
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Chart')).toBeInTheDocument();
    });

    it('should handle loading state correctly', async () => {
      // Mock delayed response
      mockDashboardService.getDashboardConfig.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockDashboardConfig), 100))
      );

      render(<Dashboard />);

      // Should show loading state
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });
    });

    it('should handle configuration load error gracefully', async () => {
      mockDashboardService.getDashboardConfig.mockRejectedValue(
        new Error('Failed to load configuration')
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard configuration')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode Functionality', () => {
    it('should toggle edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Should show edit mode controls
      expect(screen.getByText('Exit Edit Mode')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add widget/i })).toBeInTheDocument();
    });

    it('should show widget controls in edit mode', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Should show remove buttons on widgets (on hover)
      const widgets = screen.getAllByTestId(/widget-/);
      expect(widgets.length).toBeGreaterThan(0);
    });
  });

  describe('Widget Library Modal', () => {
    it('should open widget library when add widget button is clicked', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Open widget library
      const addWidgetButton = screen.getByRole('button', { name: /add widget/i });
      await user.click(addWidgetButton);

      // Should show widget library modal
      expect(screen.getByText('Widget Library')).toBeInTheDocument();
      expect(screen.getByText('Choose widgets to add to your dashboard')).toBeInTheDocument();
    });

    it('should filter widgets in library based on search', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Enter edit mode and open widget library
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const addWidgetButton = screen.getByRole('button', { name: /add widget/i });
      await user.click(addWidgetButton);

      // Search for specific widget
      const searchInput = screen.getByPlaceholderText('Search widgets...');
      await user.type(searchInput, 'portfolio');

      // Should filter results
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Chart')).toBeInTheDocument();
    });

    it('should add widget when selected from library', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Enter edit mode and open widget library
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const addWidgetButton = screen.getByRole('button', { name: /add widget/i });
      await user.click(addWidgetButton);

      // Add a watchlist widget
      const watchlistWidget = screen.getByText('Watchlist');
      const addButton = within(watchlistWidget.closest('.widget-card')).getByRole('button', { name: /add/i });
      await user.click(addButton);

      // Should close modal and add widget to dashboard
      await waitFor(() => {
        expect(screen.queryByText('Widget Library')).not.toBeInTheDocument();
      });

      // Should show the new widget
      expect(screen.getByText('Watchlist')).toBeInTheDocument();
    });
  });

  describe('Widget Removal', () => {
    it('should remove widget when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Find and click remove button for portfolio overview widget
      const portfolioWidget = screen.getByText('Portfolio Overview').closest('[data-testid]');
      const removeButton = within(portfolioWidget).getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      // Should remove the widget
      await waitFor(() => {
        expect(screen.queryByText('Portfolio Overview')).not.toBeInTheDocument();
      });
    });
  });

  describe('Layout Persistence', () => {
    it('should save layout when changes are made', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Make a change (add widget)
      const addWidgetButton = screen.getByRole('button', { name: /add widget/i });
      await user.click(addWidgetButton);

      const watchlistWidget = screen.getByText('Watchlist');
      const addButton = within(watchlistWidget.closest('.widget-card')).getByRole('button', { name: /add/i });
      await user.click(addButton);

      // Exit edit mode (should trigger save)
      const exitEditButton = screen.getByText('Exit Edit Mode');
      await user.click(exitEditButton);

      await waitFor(() => {
        expect(mockDashboardService.saveLayout).toHaveBeenCalled();
      });
    });

    it('should show unsaved changes indicator', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Make a change
      const addWidgetButton = screen.getByRole('button', { name: /add widget/i });
      await user.click(addWidgetButton);

      const watchlistWidget = screen.getByText('Watchlist');
      const addButton = within(watchlistWidget.closest('.widget-card')).getByRole('button', { name: /add/i });
      await user.click(addButton);

      // Should show unsaved changes indicator
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });

    it('should handle save errors gracefully', async () => {
      const user = userEvent.setup();
      mockDashboardService.saveLayout.mockRejectedValue(new Error('Save failed'));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Enter edit mode and make changes
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const addWidgetButton = screen.getByRole('button', { name: /add widget/i });
      await user.click(addWidgetButton);

      const watchlistWidget = screen.getByText('Watchlist');
      const addButton = within(watchlistWidget.closest('.widget-card')).getByRole('button', { name: /add/i });
      await user.click(addButton);

      // Exit edit mode
      const exitEditButton = screen.getByText('Exit Edit Mode');
      await user.click(exitEditButton);

      // Should show error toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: expect.stringContaining('Failed to save'),
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt layout for different screen sizes', async () => {
      // Mock window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // Tablet size
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Should use appropriate layout for screen size
      const gridContainer = document.querySelector('.react-grid-layout');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Widget Data Integration', () => {
    it('should pass data to individual widgets correctly', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Portfolio widget should display data from usePortfolio hook
      expect(screen.getByText('$125,000')).toBeInTheDocument();
      expect(screen.getByText('+$2,500')).toBeInTheDocument();
    });

    it('should handle widget data loading states', async () => {
      mockUsePortfolio.mockReturnValue({
        portfolio: null,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Should show loading state in widget
      const loadingElements = document.querySelectorAll('.animate-pulse');
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    it('should handle widget data errors', async () => {
      mockUsePortfolio.mockReturnValue({
        portfolio: null,
        isLoading: false,
        error: 'Failed to load portfolio data',
        refetch: vi.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Should show error state in widget
      expect(screen.getByText('Unable to load portfolio data')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render widgets unnecessarily', async () => {
      const renderSpy = vi.fn();
      
      // Mock a widget component to track renders
      vi.doMock('../../../../src/components/widgets/PortfolioOverviewWidget', () => ({
        default: () => {
          renderSpy();
          return <div>Portfolio Overview</div>;
        },
      }));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      const initialRenderCount = renderSpy.mock.calls.length;

      // Trigger a re-render that shouldn't affect widgets
      fireEvent.resize(window);

      // Should not cause unnecessary widget re-renders
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Should be able to tab through interactive elements
      const editButton = screen.getByRole('button', { name: /edit/i });
      editButton.focus();
      expect(document.activeElement).toBe(editButton);
    });

    it('should have proper ARIA labels', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Check for proper ARIA labels
      const dashboard = screen.getByRole('main');
      expect(dashboard).toBeInTheDocument();
    });

    it('should announce changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Should have appropriate announcements
      expect(screen.getByText('Edit mode enabled')).toBeInTheDocument();
    });
  });
}); 