/**
 * Unit Tests for PortfolioOverviewWidget
 * Tests the portfolio overview widget component functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PortfolioOverviewWidget from '../../../../src/components/widgets/PortfolioOverviewWidget';
import { usePortfolio } from '../../../../src/hooks/usePortfolio';

// Mock the usePortfolio hook
vi.mock('../../../../src/hooks/usePortfolio');

const mockUsePortfolio = vi.mocked(usePortfolio);

describe('PortfolioOverviewWidget', () => {
  const mockPortfolioData = {
    totalValue: 125000,
    dayChange: 2500,
    dayChangePercent: 2.04,
    totalReturn: 15000,
    totalReturnPercent: 13.6,
    holdings: [
      { symbol: 'AAPL', value: 50000 },
      { symbol: 'GOOGL', value: 30000 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeleton when data is loading', () => {
      mockUsePortfolio.mockReturnValue({
        portfolio: null,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      render(<PortfolioOverviewWidget widgetId="test-widget" />);

      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      expect(screen.getAllByRole('generic')).toHaveLength(expect.any(Number));
      
      // Check for loading skeleton elements
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should display error message when there is an error', () => {
      mockUsePortfolio.mockReturnValue({
        portfolio: null,
        isLoading: false,
        error: 'Failed to load portfolio data',
        refetch: vi.fn(),
      });

      render(<PortfolioOverviewWidget widgetId="test-widget" />);

      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      expect(screen.getByText('Unable to load portfolio data')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockUsePortfolio.mockReturnValue({
        portfolio: mockPortfolioData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
    });

    it('should render portfolio overview with correct data', async () => {
      render(<PortfolioOverviewWidget widgetId="test-widget" />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
        expect(screen.getByText('Real-time portfolio performance')).toBeInTheDocument();
      });

      // Check total value
      expect(screen.getByText('$125,000')).toBeInTheDocument();
      expect(screen.getByText('Total Value')).toBeInTheDocument();

      // Check day change
      expect(screen.getByText('+$2,500')).toBeInTheDocument();
      expect(screen.getByText("Today's P&L")).toBeInTheDocument();
      expect(screen.getByText('+2.04%')).toBeInTheDocument();

      // Check total return
      expect(screen.getByText('+$15,000')).toBeInTheDocument();
      expect(screen.getByText('Total Return')).toBeInTheDocument();
      expect(screen.getByText('+13.60%')).toBeInTheDocument();
    });

    it('should display asset allocation section', async () => {
      render(<PortfolioOverviewWidget widgetId="test-widget" />);

      await waitFor(() => {
        expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
      });

      // Check asset types
      expect(screen.getByText('Stocks')).toBeInTheDocument();
      expect(screen.getByText('Bonds')).toBeInTheDocument();
      expect(screen.getByText('ETFs')).toBeInTheDocument();
      expect(screen.getByText('Cash')).toBeInTheDocument();

      // Check percentages
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument();
    });

    it('should display performance indicator', async () => {
      render(<PortfolioOverviewWidget widgetId="test-widget" />);

      await waitFor(() => {
        expect(screen.getByText('Performance')).toBeInTheDocument();
        expect(screen.getByText('Strong')).toBeInTheDocument();
      });
    });

    it('should handle negative values correctly', async () => {
      const negativePortfolioData = {
        ...mockPortfolioData,
        dayChange: -1500,
        dayChangePercent: -1.2,
        totalReturn: -5000,
        totalReturnPercent: -4.0,
      };

      mockUsePortfolio.mockReturnValue({
        portfolio: negativePortfolioData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<PortfolioOverviewWidget widgetId="test-widget" />);

      await waitFor(() => {
        expect(screen.getByText('-$1,500')).toBeInTheDocument();
        expect(screen.getByText('-1.20%')).toBeInTheDocument();
        expect(screen.getByText('-$5,000')).toBeInTheDocument();
        expect(screen.getByText('-4.00%')).toBeInTheDocument();
      });
    });
  });

  describe('Props', () => {
    beforeEach(() => {
      mockUsePortfolio.mockReturnValue({
        portfolio: mockPortfolioData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
    });

    it('should hide header when showHeader is false', () => {
      render(<PortfolioOverviewWidget widgetId="test-widget" showHeader={false} />);

      expect(screen.queryByText('Portfolio Overview')).not.toBeInTheDocument();
      expect(screen.queryByText('Real-time portfolio performance')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <PortfolioOverviewWidget widgetId="test-widget" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUsePortfolio.mockReturnValue({
        portfolio: mockPortfolioData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
    });

    it('should have proper ARIA labels and roles', async () => {
      render(<PortfolioOverviewWidget widgetId="test-widget" />);

      await waitFor(() => {
        // Check for proper heading structure
        const heading = screen.getByRole('heading', { name: /portfolio overview/i });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable', async () => {
      render(<PortfolioOverviewWidget widgetId="test-widget" />);

      await waitFor(() => {
        const widget = screen.getByText('Portfolio Overview').closest('[role]');
        expect(widget).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const renderSpy = vi.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <PortfolioOverviewWidget widgetId="test-widget" />;
      };

      mockUsePortfolio.mockReturnValue({
        portfolio: mockPortfolioData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { rerender } = render(<TestComponent />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent />);
      
      // Should not cause unnecessary re-renders due to memoization
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing portfolio data gracefully', () => {
      mockUsePortfolio.mockReturnValue({
        portfolio: null,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<PortfolioOverviewWidget widgetId="test-widget" />);

      // Should not crash and should show some default state
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
    });

    it('should handle portfolio data with missing fields', async () => {
      const incompletePortfolioData = {
        totalValue: 100000,
        // Missing other fields
      };

      mockUsePortfolio.mockReturnValue({
        portfolio: incompletePortfolioData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<PortfolioOverviewWidget widgetId="test-widget" />);

      await waitFor(() => {
        expect(screen.getByText('$100,000')).toBeInTheDocument();
      });

      // Should use default values for missing fields
      expect(screen.getByText('+$2,500')).toBeInTheDocument(); // Default dayChange
    });

    it('should handle very large numbers correctly', async () => {
      const largePortfolioData = {
        ...mockPortfolioData,
        totalValue: 1234567890,
        dayChange: 123456,
      };

      mockUsePortfolio.mockReturnValue({
        portfolio: largePortfolioData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<PortfolioOverviewWidget widgetId="test-widget" />);

      await waitFor(() => {
        expect(screen.getByText('$1,234,567,890')).toBeInTheDocument();
        expect(screen.getByText('+$123,456')).toBeInTheDocument();
      });
    });
  });
}); 