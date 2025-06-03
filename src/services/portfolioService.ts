/**
 * Portfolio Service
 * Handles API communication for portfolio management
 * Follows enterprise patterns with proper error handling and caching
 */
import axios, { AxiosError } from "axios";
import {
  Portfolio,
  PortfolioPosition,
  Transaction,
  AIPortfolioInsight,
  DashboardSummary,
  PortfolioListResponse,
  PortfolioDetailResponse,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  AddPositionRequest,
  UpdatePositionRequest,
  PortfolioError,
  MarketSummary,
  PerformanceMetrics,
} from "../types/portfolio";
import apiClient, { API_ENDPOINTS } from "../config/api";

// Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class PortfolioService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = {
    DASHBOARD_SUMMARY: 30 * 1000, // 30 seconds
    PORTFOLIO_LIST: 60 * 1000, // 1 minute
    PORTFOLIO_DETAIL: 30 * 1000, // 30 seconds
    MARKET_SUMMARY: 60 * 1000, // 1 minute
  };

  /**
   * Get data from cache if valid
   */
  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Store data in cache
   */
  private setCached<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear cache for specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get dashboard summary with portfolio overview and market data
   */
  async getDashboardSummary(portfolioId?: string): Promise<DashboardSummary> {
    const cacheKey = `dashboard_summary_${portfolioId || "default"}`;
    const cached = this.getCached<DashboardSummary>(cacheKey);
    if (cached) return cached;

    try {
      // Use the correct API endpoint for dashboard summary
      const url = "/api/v1/portfolio/summary/dashboard";

      const response = await apiClient.get(url);
      const summary: DashboardSummary = response.data;

      // Cache the result
      this.setCached(cacheKey, summary, this.CACHE_TTL.DASHBOARD_SUMMARY);

      return summary;
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get list of user's portfolios
   */
  async getPortfolios(): Promise<PortfolioListResponse> {
    const cacheKey = "portfolio_list";
    const cached = this.getCached<PortfolioListResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get("/api/v1/portfolio/");
      const portfolios: PortfolioListResponse = response.data;

      // Cache the result
      this.setCached(cacheKey, portfolios, this.CACHE_TTL.PORTFOLIO_LIST);

      return portfolios;
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get detailed portfolio information
   */
  async getPortfolioDetail(
    portfolioId: string,
  ): Promise<PortfolioDetailResponse> {
    const cacheKey = `portfolio_detail_${portfolioId}`;
    const cached = this.getCached<PortfolioDetailResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get(`/api/v1/portfolio/${portfolioId}`);
      const detail: PortfolioDetailResponse = response.data;

      // Cache the result
      this.setCached(cacheKey, detail, this.CACHE_TTL.PORTFOLIO_DETAIL);

      return detail;
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Create a new portfolio
   */
  async createPortfolio(request: CreatePortfolioRequest): Promise<Portfolio> {
    try {
      const response = await apiClient.post("/api/v1/portfolio/", request);
      const portfolio: Portfolio = response.data;

      // Clear list cache to force refresh
      this.clearCache("portfolio_list");

      return portfolio;
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Update portfolio information
   */
  async updatePortfolio(
    portfolioId: string,
    request: UpdatePortfolioRequest,
  ): Promise<Portfolio> {
    try {
      const response = await apiClient.put(
        `/api/v1/portfolio/${portfolioId}`,
        request,
      );
      const portfolio: Portfolio = response.data;

      // Clear relevant caches
      this.clearCache(`portfolio_detail_${portfolioId}`);
      this.clearCache("portfolio_list");
      this.clearCache(`dashboard_summary_${portfolioId}`);

      return portfolio;
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Delete a portfolio
   */
  async deletePortfolio(portfolioId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/portfolio/${portfolioId}`);

      // Clear all related caches
      this.clearCache(`portfolio_detail_${portfolioId}`);
      this.clearCache("portfolio_list");
      this.clearCache(`dashboard_summary_${portfolioId}`);
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get portfolio positions
   */
  async getPositions(portfolioId: string): Promise<PortfolioPosition[]> {
    try {
      const response = await apiClient.get(
        `/api/v1/portfolio/${portfolioId}/positions`,
      );
      return response.data.positions || [];
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Add a new position to portfolio
   */
  async addPosition(
    portfolioId: string,
    request: AddPositionRequest,
  ): Promise<PortfolioPosition> {
    try {
      const response = await apiClient.post(
        `/api/v1/portfolio/${portfolioId}/positions`,
        request,
      );
      const position: PortfolioPosition = response.data;

      // Clear relevant caches
      this.clearCache(`portfolio_detail_${portfolioId}`);
      this.clearCache(`dashboard_summary_${portfolioId}`);

      return position;
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Update an existing position
   */
  async updatePosition(
    portfolioId: string,
    positionId: string,
    request: UpdatePositionRequest,
  ): Promise<PortfolioPosition> {
    try {
      const response = await apiClient.put(
        `/api/v1/portfolio/${portfolioId}/positions/${positionId}`,
        request,
      );
      const position: PortfolioPosition = response.data;

      // Clear relevant caches
      this.clearCache(`portfolio_detail_${portfolioId}`);
      this.clearCache(`dashboard_summary_${portfolioId}`);

      return position;
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Delete a position
   */
  async deletePosition(portfolioId: string, positionId: string): Promise<void> {
    try {
      await apiClient.delete(
        `/api/v1/portfolio/${portfolioId}/positions/${positionId}`,
      );

      // Clear relevant caches
      this.clearCache(`portfolio_detail_${portfolioId}`);
      this.clearCache(`dashboard_summary_${portfolioId}`);
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get portfolio transactions
   */
  async getTransactions(
    portfolioId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Transaction[]> {
    try {
      const response = await apiClient.get(
        `/api/v1/portfolio/${portfolioId}/transactions`,
        { params: { limit, offset } },
      );
      return response.data.transactions || [];
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get AI insights for portfolio
   */
  async getAIInsights(
    portfolioId: string,
    limit: number = 10,
  ): Promise<AIPortfolioInsight[]> {
    try {
      const response = await apiClient.get(
        `/api/v1/portfolio/${portfolioId}/insights`,
        { params: { limit } },
      );
      return response.data.insights || [];
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Mark AI insight as read
   */
  async markInsightAsRead(
    portfolioId: string,
    insightId: string,
  ): Promise<void> {
    try {
      await apiClient.patch(
        `/api/v1/portfolio/${portfolioId}/insights/${insightId}/read`,
      );

      // Clear dashboard cache to reflect updated insights
      this.clearCache(`dashboard_summary_${portfolioId}`);
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get market summary data
   */
  async getMarketSummary(): Promise<MarketSummary> {
    const cacheKey = "market_summary";
    const cached = this.getCached<MarketSummary>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get("/api/v1/portfolio/market-summary");
      const summary: MarketSummary = response.data;

      // Cache the result
      this.setCached(cacheKey, summary, this.CACHE_TTL.MARKET_SUMMARY);

      return summary;
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get portfolio performance metrics
   */
  async getPerformanceMetrics(
    portfolioId: string,
    timeframe: "DAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR" = "DAY",
  ): Promise<PerformanceMetrics> {
    try {
      const response = await apiClient.get(
        `/api/v1/portfolio/${portfolioId}/performance`,
        { params: { timeframe } },
      );
      return response.data;
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Refresh portfolio data (force update from market data)
   */
  async refreshPortfolio(portfolioId: string): Promise<Portfolio> {
    try {
      const response = await apiClient.post(
        `/api/v1/portfolio/${portfolioId}/refresh`,
      );
      const portfolio: Portfolio = response.data;

      // Clear all related caches to force fresh data
      this.clearCache(`portfolio_detail_${portfolioId}`);
      this.clearCache(`dashboard_summary_${portfolioId}`);
      this.clearCache("portfolio_list");

      return portfolio;
    } catch (error) {
      this.handlePortfolioError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Handle portfolio-specific errors
   */
  private handlePortfolioError(error: AxiosError): void {
    // Log error for debugging
    console.error("Portfolio API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - dispatch auth event
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    } else if (error.response?.status === 404) {
      // Portfolio not found
      console.warn("Portfolio not found:", error.config?.url);
    } else if (error.response?.status >= 500) {
      // Server error - might want to show user-friendly message
      console.error("Server error occurred:", error.response?.data);
    }
  }

  /**
   * Utility method to format currency values
   */
  formatCurrency(value: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Utility method to format percentage values
   */
  formatPercentage(value: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  }

  /**
   * Utility method to determine trend color
   */
  getTrendColor(value: number): "green" | "red" | "gray" {
    if (value > 0) return "green";
    if (value < 0) return "red";
    return "gray";
  }
}

// Export singleton instance
export const portfolioService = new PortfolioService();
export default portfolioService;
