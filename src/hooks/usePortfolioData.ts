/**
 * Portfolio Data Hook
 * Custom React hook for managing portfolio data with real-time updates,
 * caching, error handling, and optimized state management
 */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Position,
  PortfolioSummary,
  Holdings,
  HoldingsFilter,
  TableState,
  PortfolioAnalytics,
  PriceUpdate,
  RealtimeData,
  ExportOptions,
  PortfolioPageConfig,
  StockNews,
  PriceAlert,
  HoldingsSortBy,
  SortDirection,
} from "../types/portfolio";

// Hook configuration
interface UsePortfolioDataOptions {
  portfolioId?: string;
  enableRealTime?: boolean;
  refreshInterval?: number;
  autoLoad?: boolean;
  cacheTimeout?: number;
}

// Hook return type
interface UsePortfolioDataReturn {
  // Data
  summary: PortfolioSummary | null;
  holdings: Holdings | null;
  analytics: PortfolioAnalytics | null;
  realtimeData: RealtimeData | null;
  news: StockNews[];
  alerts: PriceAlert[];

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Table state
  tableState: TableState;
  filteredPositions: Position[];

  // Actions
  loadPortfolioData: (portfolioId?: string) => Promise<void>;
  refreshData: () => Promise<void>;
  updateFilters: (filters: Partial<HoldingsFilter>) => void;
  updateTableState: (state: Partial<TableState>) => void;
  exportData: (options: ExportOptions) => Promise<void>;
  clearError: () => void;

  // Quick actions
  buyMore: (
    symbol: string,
    quantity: number,
    price: number,
  ) => Promise<boolean>;
  sellPosition: (
    symbol: string,
    quantity: number,
    price: number,
  ) => Promise<boolean>;
  setAlert: (alert: Omit<PriceAlert, "id" | "createdAt">) => Promise<boolean>;

  // Configuration
  config: PortfolioPageConfig;
  updateConfig: (config: Partial<PortfolioPageConfig>) => void;
}

// Default configuration
const DEFAULT_CONFIG: PortfolioPageConfig = {
  showSummaryCards: true,
  showAnalytics: true,
  showNews: true,
  showAlerts: true,
  enableRealTimeUpdates: true,
  refreshInterval: 30000,
  defaultPageSize: 20,
  enableExport: true,
  enableQuickActions: true,
  compactMode: false,
};

// Default table state
const DEFAULT_TABLE_STATE: TableState = {
  page: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 0,
  sortBy: "marketValue",
  sortDirection: "desc",
  filters: {
    searchTerm: "",
    profitableOnly: false,
    sortBy: "marketValue",
    sortDirection: "desc",
  },
};

// Cache management
class PortfolioDataCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  set(key: string, data: any, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Global cache instance
const portfolioCache = new PortfolioDataCache();

// Mock data service (replace with actual API calls)
class PortfolioDataService {
  static async getPortfolioSummary(
    portfolioId: string,
  ): Promise<PortfolioSummary> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      totalValue: 124568.92,
      dayChange: 2345.67,
      dayChangePercentage: 1.92,
      totalGainLoss: 15234.56,
      totalGainLossPercentage: 13.94,
      openPositions: 12,
      profitablePositions: 8,
      cashBalance: 15432.87,
      cashPercentage: 12.39,
      portfolioReturn: 13.94,
      totalInvested: 109334.36,
    };
  }

  static async getHoldings(portfolioId: string): Promise<Holdings> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 700));

    const positions: Position[] = [
      {
        id: "1",
        symbol: "AAPL",
        companyName: "Apple Inc.",
        shares: 50,
        avgCost: 165.32,
        currentPrice: 182.63,
        marketValue: 9131.5,
        gainLoss: 865.5,
        gainLossPercentage: 10.47,
        dayChange: 123.45,
        dayChangePercentage: 1.37,
        weight: 7.33,
        sector: "Technology",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "2",
        symbol: "MSFT",
        companyName: "Microsoft Corp.",
        shares: 25,
        avgCost: 380.45,
        currentPrice: 415.32,
        marketValue: 10383.0,
        gainLoss: 871.75,
        gainLossPercentage: 9.17,
        dayChange: 234.56,
        dayChangePercentage: 2.31,
        weight: 8.33,
        sector: "Technology",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "3",
        symbol: "GOOGL",
        companyName: "Alphabet Inc.",
        shares: 30,
        avgCost: 180.23,
        currentPrice: 175.98,
        marketValue: 5279.4,
        gainLoss: -127.5,
        gainLossPercentage: -2.36,
        dayChange: -45.67,
        dayChangePercentage: -0.86,
        weight: 4.24,
        sector: "Technology",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "4",
        symbol: "AMZN",
        companyName: "Amazon.com Inc.",
        shares: 15,
        avgCost: 165.78,
        currentPrice: 178.15,
        marketValue: 2672.25,
        gainLoss: 185.55,
        gainLossPercentage: 7.46,
        dayChange: 67.89,
        dayChangePercentage: 2.61,
        weight: 2.14,
        sector: "Consumer Discretionary",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "5",
        symbol: "NVDA",
        companyName: "NVIDIA Corp.",
        shares: 10,
        avgCost: 850.32,
        currentPrice: 924.73,
        marketValue: 9247.3,
        gainLoss: 744.1,
        gainLossPercentage: 8.75,
        dayChange: 156.78,
        dayChangePercentage: 1.72,
        weight: 7.42,
        sector: "Technology",
        lastUpdated: new Date().toISOString(),
      },
    ];

    return {
      positions,
      totalValue: positions.reduce((sum, pos) => sum + pos.marketValue, 0),
      lastUpdated: new Date().toISOString(),
    };
  }

  static async getAnalytics(portfolioId: string): Promise<PortfolioAnalytics> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      performanceMetrics: {
        total_return: 15234.56,
        total_return_percentage: 13.94,
        day_return: 2345.67,
        day_return_percentage: 1.92,
        week_return: 3456.78,
        week_return_percentage: 2.85,
        month_return: 4567.89,
        month_return_percentage: 3.81,
        year_return: 12345.67,
        year_return_percentage: 11.29,
        sharpe_ratio: 1.42,
        volatility: 18.5,
        beta: 1.15,
        max_drawdown: 12.3,
      },
      riskMetrics: {
        volatility: 18.5,
        beta: 1.15,
        sharpeRatio: 1.42,
        maxDrawdown: 12.3,
        valueAtRisk: 8567.89,
        conditionalValueAtRisk: 12345.67,
      },
      diversificationMetrics: {
        sectorAllocation: [
          { sector: "Technology", percentage: 65.2, value: 81234.56 },
          {
            sector: "Consumer Discretionary",
            percentage: 21.4,
            value: 26678.9,
          },
          { sector: "Healthcare", percentage: 13.4, value: 16655.46 },
        ],
        geographicAllocation: [
          { region: "United States", percentage: 85.6, value: 106655.46 },
          { region: "International", percentage: 14.4, value: 17913.46 },
        ],
        marketCapAllocation: [
          { category: "Large Cap", percentage: 78.9, value: 98270.65 },
          { category: "Mid Cap", percentage: 15.3, value: 19050.88 },
          { category: "Small Cap", percentage: 5.8, value: 7247.39 },
        ],
        concentrationRisk: 0.25,
        herfindahlIndex: 0.18,
      },
      comparisonData: {
        benchmark: "S&P 500",
        portfolioReturn: 13.94,
        benchmarkReturn: 11.2,
        alpha: 2.74,
        beta: 1.15,
        correlationCoefficient: 0.87,
        trackingError: 4.2,
        informationRatio: 0.65,
      },
    };
  }

  static async getRealtimeData(symbols: string[]): Promise<RealtimeData> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const prices: Record<string, PriceUpdate> = {};

    symbols.forEach((symbol) => {
      prices[symbol] = {
        symbol,
        currentPrice: Math.random() * 1000 + 100,
        change: (Math.random() - 0.5) * 20,
        changePercentage: (Math.random() - 0.5) * 5,
        timestamp: new Date().toISOString(),
        volume: Math.floor(Math.random() * 1000000),
      };
    });

    return {
      prices,
      marketStatus: "OPEN",
      lastUpdated: new Date().toISOString(),
    };
  }

  static async exportPortfolioData(
    portfolioId: string,
    options: ExportOptions,
  ): Promise<void> {
    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`Exporting portfolio ${portfolioId} as ${options.format}`);
  }
}

export const usePortfolioData = (
  options: UsePortfolioDataOptions = {},
): UsePortfolioDataReturn => {
  const {
    portfolioId = "1",
    enableRealTime = true,
    refreshInterval = 30000,
    autoLoad = true,
    cacheTimeout = 30000,
  } = options;

  // State management
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<Holdings | null>(null);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [news, setNews] = useState<StockNews[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [tableState, setTableState] = useState<TableState>(DEFAULT_TABLE_STATE);
  const [config, setConfig] = useState<PortfolioPageConfig>(DEFAULT_CONFIG);

  // Refs for cleanup
  const mountedRef = useRef(true);
  const intervalRef = useRef<number | null>(null);

  // Memoized filtered and sorted positions
  const filteredPositions = useMemo(() => {
    if (!holdings?.positions) return [];

    let filtered = [...holdings.positions];
    const { filters } = tableState;

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pos) =>
          pos.symbol.toLowerCase().includes(searchLower) ||
          pos.companyName.toLowerCase().includes(searchLower),
      );
    }

    // Apply profitable only filter
    if (filters.profitableOnly) {
      filtered = filtered.filter((pos) => pos.gainLoss > 0);
    }

    // Apply sector filter
    if (filters.sector) {
      filtered = filtered.filter((pos) => pos.sector === filters.sector);
    }

    // Apply value range filters
    if (filters.minValue !== undefined) {
      filtered = filtered.filter((pos) => pos.marketValue >= filters.minValue!);
    }
    if (filters.maxValue !== undefined) {
      filtered = filtered.filter((pos) => pos.marketValue <= filters.maxValue!);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { sortBy, sortDirection } = filters;
      let aValue: any = a[sortBy as keyof Position];
      let bValue: any = b[sortBy as keyof Position];

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [holdings, tableState]);

  // Update table state with pagination
  useEffect(() => {
    const totalItems = filteredPositions.length;
    const totalPages = Math.ceil(totalItems / tableState.pageSize);

    setTableState((prev) => ({
      ...prev,
      totalItems,
      totalPages,
      page: Math.min(prev.page, totalPages || 1),
    }));
  }, [filteredPositions.length, tableState.pageSize]);

  // Error handling
  const handleError = useCallback((err: any) => {
    if (!mountedRef.current) return;

    console.error("Portfolio data error:", err);
    setError(err.message || "An unexpected error occurred");
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load portfolio data
  const loadPortfolioData = useCallback(
    async (targetPortfolioId?: string) => {
      if (!mountedRef.current) return;

      const id = targetPortfolioId || portfolioId;

      try {
        setIsLoading(true);
        setError(null);

        // Check cache first
        const cacheKey = `portfolio-${id}`;
        const cachedData = portfolioCache.get(cacheKey);

        if (cachedData && !isRefreshing) {
          setSummary(cachedData.summary);
          setHoldings(cachedData.holdings);
          setAnalytics(cachedData.analytics);
          setIsLoading(false);
          return;
        }

        // Load data in parallel
        const [summaryData, holdingsData, analyticsData] = await Promise.all([
          PortfolioDataService.getPortfolioSummary(id),
          PortfolioDataService.getHoldings(id),
          PortfolioDataService.getAnalytics(id),
        ]);

        if (mountedRef.current) {
          setSummary(summaryData);
          setHoldings(holdingsData);
          setAnalytics(analyticsData);
          setLastUpdated(new Date());

          // Cache the data
          portfolioCache.set(
            cacheKey,
            {
              summary: summaryData,
              holdings: holdingsData,
              analytics: analyticsData,
            },
            cacheTimeout,
          );
        }
      } catch (err) {
        handleError(err);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [portfolioId, isRefreshing, cacheTimeout, handleError],
  );

  // Refresh data
  const refreshData = useCallback(async () => {
    if (!mountedRef.current) return;

    setIsRefreshing(true);
    portfolioCache.clear();
    await loadPortfolioData();
  }, [loadPortfolioData]);

  // Update filters
  const updateFilters = useCallback((filters: Partial<HoldingsFilter>) => {
    setTableState((prev) => ({
      ...prev,
      page: 1, // Reset to first page when filters change
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  // Update table state
  const updateTableState = useCallback((state: Partial<TableState>) => {
    setTableState((prev) => ({ ...prev, ...state }));
  }, []);

  // Update configuration
  const updateConfig = useCallback(
    (newConfig: Partial<PortfolioPageConfig>) => {
      setConfig((prev) => ({ ...prev, ...newConfig }));

      // Save to localStorage
      const updatedConfig = { ...config, ...newConfig };
      localStorage.setItem(
        "portfolio-page-config",
        JSON.stringify(updatedConfig),
      );
    },
    [config],
  );

  // Export data
  const exportData = useCallback(
    async (options: ExportOptions) => {
      try {
        await PortfolioDataService.exportPortfolioData(portfolioId, options);
      } catch (err) {
        handleError(err);
      }
    },
    [portfolioId, handleError],
  );

  // Quick actions
  const buyMore = useCallback(
    async (
      symbol: string,
      quantity: number,
      price: number,
    ): Promise<boolean> => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Buying ${quantity} shares of ${symbol} at $${price}`);

        // Refresh data after successful transaction
        await refreshData();
        return true;
      } catch (err) {
        handleError(err);
        return false;
      }
    },
    [refreshData, handleError],
  );

  const sellPosition = useCallback(
    async (
      symbol: string,
      quantity: number,
      price: number,
    ): Promise<boolean> => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Selling ${quantity} shares of ${symbol} at $${price}`);

        // Refresh data after successful transaction
        await refreshData();
        return true;
      } catch (err) {
        handleError(err);
        return false;
      }
    },
    [refreshData, handleError],
  );

  const setAlert = useCallback(
    async (alert: Omit<PriceAlert, "id" | "createdAt">): Promise<boolean> => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newAlert: PriceAlert = {
          ...alert,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };

        setAlerts((prev) => [...prev, newAlert]);
        return true;
      } catch (err) {
        handleError(err);
        return false;
      }
    },
    [handleError],
  );

  // Real-time data updates
  useEffect(() => {
    if (!enableRealTime || !holdings?.positions) return;

    const symbols = holdings.positions.map((pos) => pos.symbol);

    const updateRealTimeData = async () => {
      try {
        const data = await PortfolioDataService.getRealtimeData(symbols);
        if (mountedRef.current) {
          setRealtimeData(data);
        }
      } catch (err) {
        console.error("Real-time data update failed:", err);
      }
    };

    // Initial load
    updateRealTimeData();

    // Set up interval
    if (config.refreshInterval > 0) {
      intervalRef.current = window.setInterval(
        updateRealTimeData,
        config.refreshInterval,
      );
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableRealTime, holdings, config.refreshInterval]);

  // Load configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem("portfolio-page-config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch (err) {
        console.warn("Failed to load portfolio page configuration:", err);
      }
    }
  }, []);

  // Initial data load
  useEffect(() => {
    if (autoLoad) {
      loadPortfolioData();
    }
  }, [autoLoad, loadPortfolioData]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // Data
    summary,
    holdings,
    analytics,
    realtimeData,
    news,
    alerts,

    // UI State
    isLoading,
    isRefreshing,
    error,
    lastUpdated,

    // Table state
    tableState,
    filteredPositions,

    // Actions
    loadPortfolioData,
    refreshData,
    updateFilters,
    updateTableState,
    exportData,
    clearError,

    // Quick actions
    buyMore,
    sellPosition,
    setAlert,

    // Configuration
    config,
    updateConfig,
  };
};

export default usePortfolioData;
