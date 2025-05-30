/**
 * Portfolio Hook
 * Custom React hook for managing portfolio data and state
 * Provides loading states, error handling, and data management
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DashboardSummary,
  Portfolio,
  PortfolioPosition,
  Transaction,
  AIPortfolioInsight,
  PortfolioLoadingState,
  PortfolioError,
  MarketSummary,
  CreatePortfolioRequest,
  AddPositionRequest,
} from '../types/portfolio';
import portfolioService from '../services/portfolioService';

// Hook return type
interface UsePortfolioReturn {
  // Data
  dashboardSummary: DashboardSummary | null;
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  positions: PortfolioPosition[];
  transactions: Transaction[];
  aiInsights: AIPortfolioInsight[];
  marketSummary: MarketSummary | null;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  error: PortfolioError | null;
  lastUpdated: Date | null;
  
  // Actions
  loadDashboard: (portfolioId?: string) => Promise<void>;
  loadPortfolios: () => Promise<void>;
  loadPortfolioDetail: (portfolioId: string) => Promise<void>;
  createPortfolio: (request: CreatePortfolioRequest) => Promise<Portfolio | null>;
  addPosition: (portfolioId: string, request: AddPositionRequest) => Promise<boolean>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  markInsightAsRead: (portfolioId: string, insightId: string) => Promise<void>;
}

// Hook options
interface UsePortfolioOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
  portfolioId?: string;
}

export const usePortfolio = (options: UsePortfolioOptions = {}): UsePortfolioReturn => {
  const {
    autoLoad = true,
    refreshInterval = 30000, // 30 seconds
    portfolioId,
  } = options;

  // State management
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiInsights, setAiInsights] = useState<AIPortfolioInsight[]>([]);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<PortfolioError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs for cleanup
  const refreshIntervalRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // Set mounted state on initialization
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Error handling utility
  const handleError = useCallback((err: any) => {
    if (!mountedRef.current) return;
    
    console.error('Portfolio hook error:', err);
    
    const portfolioError: PortfolioError = {
      code: err.response?.data?.code || 'UNKNOWN_ERROR',
      message: err.response?.data?.message || err.message || 'An unexpected error occurred',
      details: err.response?.data?.details || {},
    };
    
    setError(portfolioError);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load dashboard summary
  const loadDashboard = useCallback(async (targetPortfolioId?: string) => {
    if (!mountedRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const summary = await portfolioService.getDashboardSummary(
        targetPortfolioId || portfolioId
      );
      
      if (mountedRef.current) {
        setDashboardSummary(summary);
        setCurrentPortfolio(summary.portfolio);
        setPositions(summary.positions);
        setAiInsights(summary.ai_insights);
        setMarketSummary(summary.market_summary);
        setLastUpdated(new Date());
      }
    } catch (err) {
      handleError(err);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [portfolioId, handleError]);

  // Load portfolios list
  const loadPortfolios = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await portfolioService.getPortfolios();
      
      if (mountedRef.current) {
        setPortfolios(response.portfolios);
        setLastUpdated(new Date());
      }
    } catch (err) {
      handleError(err);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [handleError]);

  // Load detailed portfolio data
  const loadPortfolioDetail = useCallback(async (targetPortfolioId: string) => {
    if (!mountedRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [detail, aiInsightsResponse, recentTransactions] = await Promise.all([
        portfolioService.getPortfolioDetail(targetPortfolioId),
        portfolioService.getAIInsights(targetPortfolioId, 5),
        portfolioService.getTransactions(targetPortfolioId, 10),
      ]);
      
      if (mountedRef.current) {
        setCurrentPortfolio(detail.portfolio);
        setPositions(detail.positions);
        setTransactions(recentTransactions);
        setAiInsights(aiInsightsResponse);
        setLastUpdated(new Date());
      }
    } catch (err) {
      handleError(err);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [handleError]);

  // Create new portfolio
  const createPortfolio = useCallback(async (
    request: CreatePortfolioRequest
  ): Promise<Portfolio | null> => {
    if (!mountedRef.current) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const portfolio = await portfolioService.createPortfolio(request);
      
      if (mountedRef.current) {
        setCurrentPortfolio(portfolio);
        // Refresh portfolios list
        await loadPortfolios();
        setLastUpdated(new Date());
        return portfolio;
      }
    } catch (err) {
      handleError(err);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
    
    return null;
  }, [handleError, loadPortfolios]);

  // Add position to portfolio
  const addPosition = useCallback(async (
    targetPortfolioId: string,
    request: AddPositionRequest
  ): Promise<boolean> => {
    if (!mountedRef.current) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await portfolioService.addPosition(targetPortfolioId, request);
      
      if (mountedRef.current) {
        // Refresh current portfolio data
        if (portfolioId === targetPortfolioId) {
          await loadDashboard(targetPortfolioId);
        }
        setLastUpdated(new Date());
        return true;
      }
    } catch (err) {
      handleError(err);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
    
    return false;
  }, [handleError, loadDashboard, portfolioId]);

  // Mark AI insight as read
  const markInsightAsRead = useCallback(async (
    targetPortfolioId: string,
    insightId: string
  ) => {
    if (!mountedRef.current) return;
    
    try {
      await portfolioService.markInsightAsRead(targetPortfolioId, insightId);
      
      if (mountedRef.current) {
        // Update local state
        setAiInsights(prev => 
          prev.map(insight => 
            insight.id === insightId 
              ? { ...insight, is_read: true }
              : insight
          )
        );
      }
    } catch (err) {
      console.error('Failed to mark insight as read:', err);
      // Don't show error for this action as it's not critical
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Clear cache to force fresh data
      portfolioService.clearCache();
      
      // Reload current data
      if (portfolioId) {
        await loadDashboard(portfolioId);
      } else {
        await loadDashboard();
      }
      
      if (mountedRef.current) {
        setLastUpdated(new Date());
      }
    } catch (err) {
      handleError(err);
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [portfolioId, loadDashboard, handleError]);

  // Auto refresh setup
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (mountedRef.current && !isLoading && !isRefreshing) {
          refreshData();
        }
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshInterval, refreshData, isLoading, isRefreshing]);

  // Initial data loading
  useEffect(() => {
    if (autoLoad && mountedRef.current) {
      if (portfolioId) {
        loadDashboard(portfolioId);
      } else {
        loadDashboard();
      }
    }
  }, [autoLoad, portfolioId, loadDashboard]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    // Data
    dashboardSummary,
    portfolios,
    currentPortfolio,
    positions,
    transactions,
    aiInsights,
    marketSummary,
    
    // Loading states
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    
    // Actions
    loadDashboard,
    loadPortfolios,
    loadPortfolioDetail,
    createPortfolio,
    addPosition,
    refreshData,
    clearError,
    markInsightAsRead,
  };
};

export default usePortfolio; 