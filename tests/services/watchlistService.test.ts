/**
 * WatchlistService Tests
 * Tests for Story 2.4 - Watchlist Service functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { watchlistService, WatchlistService } from '../../src/services/watchlistService';
import { apiClient } from '../../src/services/api';
import { WatchlistData } from '../../src/types/widget-data';

// Mock API client
vi.mock('../../src/services/api');

const mockWatchlistData: WatchlistData = {
  watchlistId: 'test-watchlist',
  name: 'Test Watchlist',
  items: [
    {
      id: 'item1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 185.42,
      change: 2.34,
      changePercent: 1.28,
      volume: 45678912,
      marketCap: 2890000000000,
      logoUrl: 'https://logo.clearbit.com/apple.com',
    },
    {
      id: 'item2',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 142.78,
      change: -1.56,
      changePercent: -1.08,
      volume: 23456789,
      marketCap: 1780000000000,
      logoUrl: 'https://logo.clearbit.com/google.com',
    },
  ],
};

describe('WatchlistService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear service cache
    watchlistService.invalidateCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('returns the same instance', () => {
      const instance1 = WatchlistService.getInstance();
      const instance2 = WatchlistService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('exported service is singleton instance', () => {
      const instance = WatchlistService.getInstance();
      expect(watchlistService).toBe(instance);
    });
  });

  describe('getUserWatchlist', () => {
    it('fetches watchlist from API successfully', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: mockWatchlistData,
        },
      });

      const result = await watchlistService.getUserWatchlist();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/users/me/watchlist');
      expect(result).toEqual(mockWatchlistData);
    });

    it('uses cached data when available and fresh', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: mockWatchlistData,
        },
      });

      // First call
      await watchlistService.getUserWatchlist();
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result = await watchlistService.getUserWatchlist();
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockWatchlistData);
    });

    it('forces refresh when forceRefresh is true', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: mockWatchlistData,
        },
      });

      // First call
      await watchlistService.getUserWatchlist();
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Second call with force refresh
      await watchlistService.getUserWatchlist(true);
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });

    it('falls back to mock data when API fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      const result = await watchlistService.getUserWatchlist();

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(3); // Fallback data has 3 items
      expect(result.items[0].symbol).toBe('AAPL');
    });

    it('handles API error response gracefully', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: false,
          message: 'Unauthorized',
        },
      });

      const result = await watchlistService.getUserWatchlist();

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(3); // Falls back to mock data
    });
  });

  describe('addSymbolToWatchlist', () => {
    beforeEach(() => {
      // Setup getUserWatchlist mock for dependency
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: mockWatchlistData,
        },
      });
    });

    it('successfully adds a new symbol', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: { symbol: 'TSLA', name: 'Tesla Inc.' },
          message: 'Symbol added successfully',
        },
      });

      const result = await watchlistService.addSymbolToWatchlist('TSLA', 'Tesla Inc.');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/users/me/watchlist', {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('TSLA added to watchlist successfully');
    });

    it('normalizes symbol to uppercase', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: { symbol: 'TSLA' },
        },
      });

      await watchlistService.addSymbolToWatchlist('tsla');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/users/me/watchlist', {
        symbol: 'TSLA',
        name: undefined,
      });
    });

    it('validates symbol input', async () => {
      const result = await watchlistService.addSymbolToWatchlist('');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Symbol is required');
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('checks for duplicate symbols', async () => {
      const result = await watchlistService.addSymbolToWatchlist('AAPL');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('AAPL is already in your watchlist');
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      const result = await watchlistService.addSymbolToWatchlist('TSLA');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Network error');
    });

    it('simulates success when API is unavailable', async () => {
      const networkError = new Error('Connection refused');
      (networkError as any).code = 'ECONNREFUSED';
      vi.mocked(apiClient.post).mockRejectedValue(networkError);

      const result = await watchlistService.addSymbolToWatchlist('TSLA');

      expect(result.success).toBe(true);
      expect(result.message).toContain('demo mode');
    });

    it('invalidates cache after successful addition', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: { symbol: 'TSLA' },
        },
      });

      // First call to populate cache
      await watchlistService.getUserWatchlist();
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Add symbol
      await watchlistService.addSymbolToWatchlist('TSLA');

      // Next call should refetch due to cache invalidation
      await watchlistService.getUserWatchlist();
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeSymbolFromWatchlist', () => {
    beforeEach(() => {
      // Setup getUserWatchlist mock for dependency
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: mockWatchlistData,
        },
      });
    });

    it('successfully removes a symbol', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: {
          success: true,
          message: 'Symbol removed successfully',
        },
      });

      const result = await watchlistService.removeSymbolFromWatchlist('AAPL');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/users/me/watchlist/AAPL');
      expect(result.success).toBe(true);
      expect(result.message).toBe('AAPL removed from watchlist successfully');
    });

    it('normalizes symbol to uppercase', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: { success: true },
      });

      await watchlistService.removeSymbolFromWatchlist('aapl');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/users/me/watchlist/AAPL');
    });

    it('validates symbol input', async () => {
      const result = await watchlistService.removeSymbolFromWatchlist('');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Symbol is required');
      expect(apiClient.delete).not.toHaveBeenCalled();
    });

    it('checks if symbol exists in watchlist', async () => {
      const result = await watchlistService.removeSymbolFromWatchlist('TSLA');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('TSLA is not in your watchlist');
      expect(apiClient.delete).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Network error'));

      const result = await watchlistService.removeSymbolFromWatchlist('AAPL');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Network error');
    });

    it('simulates success when API is unavailable', async () => {
      const networkError = new Error('Connection refused');
      (networkError as any).code = 'ECONNREFUSED';
      vi.mocked(apiClient.delete).mockRejectedValue(networkError);

      const result = await watchlistService.removeSymbolFromWatchlist('AAPL');

      expect(result.success).toBe(true);
      expect(result.message).toContain('demo mode');
    });

    it('invalidates cache after successful removal', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: { success: true },
      });

      // First call to populate cache
      await watchlistService.getUserWatchlist();
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Remove symbol
      await watchlistService.removeSymbolFromWatchlist('AAPL');

      // Next call should refetch due to cache invalidation
      await watchlistService.getUserWatchlist();
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSymbolQuote', () => {
    it('fetches quote data successfully', async () => {
      const mockQuote = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 185.42,
        change: 2.34,
        changePercent: 1.28,
        volume: 45678912,
        marketCap: 2890000000000,
        logoUrl: 'https://logo.clearbit.com/apple.com',
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: mockQuote,
        },
      });

      const result = await watchlistService.getSymbolQuote('AAPL');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/market/quote/AAPL');
      expect(result).toEqual(mockQuote);
    });

    it('returns null when quote not found', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: false,
          message: 'Symbol not found',
        },
      });

      const result = await watchlistService.getSymbolQuote('INVALID');

      expect(result).toBeNull();
    });

    it('handles API errors gracefully', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      const result = await watchlistService.getSymbolQuote('AAPL');

      expect(result).toBeNull();
    });
  });

  describe('validateSymbol', () => {
    it('validates empty symbol', async () => {
      const result = await watchlistService.validateSymbol('');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Symbol cannot be empty');
    });

    it('validates symbol format', async () => {
      const result = await watchlistService.validateSymbol('INVALID123');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Symbol must be 1-5 letters only');
    });

    it('validates symbol with quote API', async () => {
      const mockQuote = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 185.42,
        change: 2.34,
        changePercent: 1.28,
        volume: 45678912,
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: mockQuote,
        },
      });

      const result = await watchlistService.validateSymbol('AAPL');

      expect(result.valid).toBe(true);
      expect(result.name).toBe('Apple Inc.');
      expect(result.message).toBe('AAPL is valid');
    });

    it('falls back to common symbols when API fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      const result = await watchlistService.validateSymbol('AAPL');

      expect(result.valid).toBe(true);
      expect(result.name).toBe('AAPL Corp.');
      expect(result.message).toContain('demo mode');
    });

    it('rejects unknown symbols when API fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      const result = await watchlistService.validateSymbol('UNKNOWN');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Could not validate UNKNOWN');
    });
  });

  describe('Cache Management', () => {
    it('caches data for specified duration', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: mockWatchlistData,
        },
      });

      // First call
      const result1 = await watchlistService.getUserWatchlist();
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Immediate second call should use cache
      const result2 = await watchlistService.getUserWatchlist();
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
    });

    it('invalidates cache manually', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: mockWatchlistData,
        },
      });

      // First call to populate cache
      await watchlistService.getUserWatchlist();
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Invalidate cache
      watchlistService.invalidateCache();

      // Next call should refetch
      await watchlistService.getUserWatchlist();
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Real-time Updates Subscription', () => {
    it('returns unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = watchlistService.subscribeToRealTimeUpdates(callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Should not throw when called
      expect(() => unsubscribe()).not.toThrow();
    });

    it('logs subscription start and end', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const callback = vi.fn();
      const unsubscribe = watchlistService.subscribeToRealTimeUpdates(callback);
      
      expect(consoleSpy).toHaveBeenCalledWith('[WatchlistService] Real-time updates subscription started');
      
      unsubscribe();
      
      expect(consoleSpy).toHaveBeenCalledWith('[WatchlistService] Real-time updates subscription ended');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Demo Simulation', () => {
    beforeEach(() => {
      // Setup getUserWatchlist with empty list for simulation tests
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: { ...mockWatchlistData, items: [] },
        },
      });
    });

    it('simulates adding symbol in demo mode', async () => {
      const networkError = new Error('Connection refused');
      (networkError as any).code = 'ECONNREFUSED';
      vi.mocked(apiClient.post).mockRejectedValue(networkError);

      const result = await watchlistService.addSymbolToWatchlist('TSLA', 'Tesla Inc.');

      expect(result.success).toBe(true);
      expect(result.message).toContain('demo mode');
    });

    it('simulates removing symbol in demo mode', async () => {
      // First add the symbol to cache
      await watchlistService.getUserWatchlist();
      
      const networkError = new Error('Connection refused');
      (networkError as any).code = 'ECONNREFUSED';
      vi.mocked(apiClient.delete).mockRejectedValue(networkError);

      const result = await watchlistService.removeSymbolFromWatchlist('AAPL');

      expect(result.success).toBe(true);
      expect(result.message).toContain('demo mode');
    });
  });
}); 