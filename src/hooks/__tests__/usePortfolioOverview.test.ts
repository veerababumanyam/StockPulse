import { renderHook, act } from '@testing-library/react-hooks';
import { vi, describe, it, expect, beforeEach, afterEach, MockedFunction } from 'vitest';
import { usePortfolioOverview } from '../usePortfolioOverview';
import { apiClient } from '../../services/api';

// Mock the API client
vi.mock('../../services/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('usePortfolioOverview', () => {
  const mockData = {
    portfolioValue: 125000.75,
    dayChange: 1250.5,
    dayChangePercent: 1.01,
    overallGain: 25000.25,
    overallGainPercent: 25.0,
    assetCount: 8,
    alertsCount: 2,
    lastUpdated: '2023-06-01T12:00:00Z',
  };

  const defaultProps = {
    widgetId: 'portfolio-overview-1',
    refreshInterval: 60000,
    autoRefresh: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch data on mount', async () => {
    (apiClient.get as any).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => usePortfolioOverview(defaultProps));

    // Initial state
    expect(result.current.isLoading).toBe(true);

    // Wait for the effect to complete
    await vi.waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/api/portfolio/overview');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(mockData);
      expect(result.current.formattedData).toMatchObject({
        portfolioValue: '$125,000.75',
        dayChange: '+$1,250.50 (1.01%)',
        dayChangeIsPositive: true,
        overallGain: '+$25,000.25 (25.00%)',
        overallGainIsPositive: true,
        assetCount: 8,
        alertsCount: 2,
        lastUpdated: mockData.lastUpdated,
      });
    });
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Network error';
    (apiClient.get as any).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => usePortfolioOverview(defaultProps));

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.data).toBeNull();
      expect(result.current.formattedData).toBeNull();
    });
  });

  it('should refetch data when refetch is called', async () => {
    (apiClient.get as MockedFunction<typeof apiClient.get>).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => usePortfolioOverview(defaultProps));

    await vi.waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  it('should auto-refresh data based on refreshInterval', async () => {
    (apiClient.get as MockedFunction<typeof apiClient.get>).mockResolvedValue({ data: mockData });

    const refreshInterval = 1000;
    renderHook(() =>
      usePortfolioOverview({
        ...defaultProps,
        refreshInterval,
      })
    );

    await vi.waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    // Fast-forward time to trigger the interval
    act(() => {
      vi.advanceTimersByTime(refreshInterval);
    });

    await vi.waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  it('should clean up interval on unmount', async () => {
    (apiClient.get as MockedFunction<typeof apiClient.get>).mockResolvedValue({ data: mockData });

    const { unmount } = renderHook(() =>
      usePortfolioOverview({
        ...defaultProps,
        refreshInterval: 1000,
      })
    );

    await vi.waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Fast-forward time to verify no more calls are made after unmount
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it('should not auto-refresh when autoRefresh is false', async () => {
    (apiClient.get as MockedFunction<typeof apiClient.get>).mockResolvedValue({ data: mockData });

    renderHook(() =>
      usePortfolioOverview({
        ...defaultProps,
        autoRefresh: false,
        refreshInterval: 1000,
      })
    );

    await vi.waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    // Fast-forward time to verify no interval was set
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });
});
