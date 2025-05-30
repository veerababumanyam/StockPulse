/**
 * Market Data Hook
 * Custom React hook for managing real-time market data
 * Provides caching, error handling, and WebSocket integration
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketSummary } from '../types/portfolio';

// Market data service interface
interface MarketDataService {
  getMarketSummary: () => Promise<MarketSummary>;
  subscribeToUpdates: (callback: (data: MarketSummary) => void) => () => void;
}

// Hook options
interface UseMarketDataOptions {
  enableRealTime?: boolean;
  refreshInterval?: number;
  cacheTimeout?: number;
}

// Hook return type
interface UseMarketDataReturn {
  marketData: MarketSummary | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isRealTime: boolean;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

// Cache management
interface CacheEntry {
  data: MarketSummary;
  timestamp: number;
  expiresAt: number;
}

class MarketDataCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL = 30000; // 30 seconds

  set(key: string, data: MarketSummary, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  get(key: string): MarketSummary | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  isStale(key: string, maxAge: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > maxAge;
  }
}

// Global cache instance
const marketDataCache = new MarketDataCache();

// Mock market data service (replace with actual implementation)
const mockMarketDataService: MarketDataService = {
  async getMarketSummary(): Promise<MarketSummary> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      market_status: Math.random() > 0.5 ? 'OPEN' : 'CLOSED',
      market_close_time: new Date().toISOString(),
      sp500_price: 4200 + Math.random() * 200,
      sp500_change: (Math.random() - 0.5) * 100,
      sp500_change_percentage: (Math.random() - 0.5) * 3,
      nasdaq_price: 13000 + Math.random() * 1000,
      nasdaq_change: (Math.random() - 0.5) * 200,
      nasdaq_change_percentage: (Math.random() - 0.5) * 4,
      dow_price: 33000 + Math.random() * 2000,
      dow_change: (Math.random() - 0.5) * 300,
      dow_change_percentage: (Math.random() - 0.5) * 2,
    };
  },

  subscribeToUpdates(callback: (data: MarketSummary) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const data = await this.getMarketSummary();
        callback(data);
      } catch (error) {
        console.error('Market data subscription error:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  },
};

export const useMarketData = (options: UseMarketDataOptions = {}): UseMarketDataReturn => {
  const {
    enableRealTime = true,
    refreshInterval = 30000,
    cacheTimeout = 30000,
  } = options;

  // State management
  const [marketData, setMarketData] = useState<MarketSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRealTime, setIsRealTime] = useState(enableRealTime);

  // Refs for cleanup
  const mountedRef = useRef(true);
  const subscriptionRef = useRef<(() => void) | null>(null);
  const refreshTimeoutRef = useRef<number | null>(null);

  // Set mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load market data with caching
  const loadMarketData = useCallback(async (useCache: boolean = true): Promise<void> => {
    if (!mountedRef.current) return;

    try {
      // Check cache first if enabled
      if (useCache) {
        const cachedData = marketDataCache.get('market_summary');
        if (cachedData) {
          setMarketData(cachedData);
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      const data = await mockMarketDataService.getMarketSummary();

      if (mountedRef.current) {
        setMarketData(data);
        setLastUpdated(new Date());
        
        // Cache the data
        marketDataCache.set('market_summary', data, cacheTimeout);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load market data';
        setError(errorMessage);
        console.error('Market data loading error:', err);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [cacheTimeout]);

  // Manual refresh (bypasses cache)
  const refreshData = useCallback(async (): Promise<void> => {
    await loadMarketData(false);
  }, [loadMarketData]);

  // Setup real-time subscription
  useEffect(() => {
    if (!enableRealTime || !isRealTime) return;

    const unsubscribe = mockMarketDataService.subscribeToUpdates((data) => {
      if (mountedRef.current) {
        setMarketData(data);
        setLastUpdated(new Date());
        marketDataCache.set('market_summary', data, cacheTimeout);
      }
    });

    subscriptionRef.current = unsubscribe;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [enableRealTime, isRealTime, cacheTimeout]);

  // Setup periodic refresh fallback
  useEffect(() => {
    if (refreshInterval > 0 && !isRealTime) {
      const refresh = () => {
        if (mountedRef.current && !isLoading) {
          // Check if data is stale
          if (marketDataCache.isStale('market_summary', refreshInterval)) {
            loadMarketData(false);
          }
        }
      };

      refreshTimeoutRef.current = window.setInterval(refresh, refreshInterval);

      return () => {
        if (refreshTimeoutRef.current) {
          clearInterval(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }
      };
    }
  }, [refreshInterval, isRealTime, isLoading, loadMarketData]);

  // Initial data load
  useEffect(() => {
    loadMarketData(true);
  }, [loadMarketData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    marketData,
    isLoading,
    error,
    lastUpdated,
    isRealTime,
    refreshData,
    clearError,
  };
};

export default useMarketData; 