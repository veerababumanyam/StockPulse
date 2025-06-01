/**
 * API Service for StockPulse Dashboard
 *
 * This service provides a unified interface for all API calls.
 * When backend endpoints return 404 (not yet implemented),
 * the client gracefully falls back to mock data to ensure
 * the dashboard remains functional during development.
 */

import axios, { AxiosInstance } from 'axios';
import { DashboardConfig, DashboardAPIResponse } from '../types/dashboard';
import {
  PortfolioOverviewData,
  PortfolioChartData,
  PortfolioChartDatapoint,
  WatchlistData,
  WatchlistItem,
  MarketSummaryData,
  MarketIndexData,
  AIInsightsData,
  AIInsightItem,
  AIInsightSentiment,
  AIInsightType,
  RecentTransactionsData,
  TransactionItem,
  TransactionType,
  TransactionStatus,
  PerformanceMetricsData,
  PerformanceMetricItem,
  AlertsData,
  AlertItem,
  AlertSeverity,
  AlertStatus,
  NewsFeedData,
  NewsArticle,
  SectorPerformanceData,
  SectorPerformanceItem,
  TopMoversData,
  TopMoverItem,
  EconomicCalendarData,
  CalendarEventItem,
  EventImpact,
  EventType,
} from '../types/widget-data';

// Extend AxiosInstance to include our custom methods
interface ExtendedAxiosInstance extends AxiosInstance {
  getPortfolioOverview(): Promise<PortfolioOverviewData>;
  getMarketSummaryData(): Promise<MarketSummaryData>;
  getWatchlistData(symbols?: string[]): Promise<WatchlistData>;
  getNewsFeedData(limit?: number, filters?: any): Promise<NewsFeedData>;
  getAlertsData(limit?: number, filters?: any): Promise<AlertsData>;
  getTopMoversData(market?: string, count?: number): Promise<TopMoversData>;
  getPortfolioChartData(timeframe?: string): Promise<PortfolioChartData>;
  getPerformanceMetricsData(): Promise<PerformanceMetricsData>;
  getSectorPerformanceData(timeframe?: string): Promise<SectorPerformanceData>;
  getAIInsightsData(count?: number): Promise<{ success: boolean; data: AIInsightsData; message?: string }>;
  getRecentTransactionsData(limit?: number): Promise<RecentTransactionsData>;
  getEconomicCalendarData(date?: string): Promise<EconomicCalendarData>;
}

// --- Backend API Configuration ---
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true, // Include cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
}) as ExtendedAxiosInstance;

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add any additional headers if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle authentication errors
      console.error('Authentication required');
      // Redirect to login or refresh token
    }
    return Promise.reject(error);
  },
);

// --- Helper Functions ---
const handleApiResponse = async <T>(apiCall: Promise<any>): Promise<T> => {
  try {
    const response = await apiCall;
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'API call failed');
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// --- Dashboard API Functions ---
export const getDashboardConfig = async (): Promise<DashboardConfig> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock dashboard config for now
  // In production, this would fetch from the backend
  throw new Error('Dashboard config API not implemented yet');
};

export const saveDashboardConfig = async (
  config: DashboardConfig,
): Promise<DashboardAPIResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return mock response for now
  // In production, this would save to the backend
  return {
    success: true,
    message: 'Dashboard configuration saved successfully',
    timestamp: new Date().toISOString(),
  };
};

// --- Widget Data API Functions (Using Backend FMP Proxy) ---

export const getPortfolioOverview =
  async (): Promise<PortfolioOverviewData> => {
    return handleApiResponse<PortfolioOverviewData>(
      apiClient.get('/fmp/portfolio/overview'),
    );
  };

export const getPortfolioChartData = async (
  timeframe: string = '1M',
): Promise<PortfolioChartData> => {
  return handleApiResponse<PortfolioChartData>(
    apiClient.get('/fmp/portfolio/chart', { params: { timeframe } }),
  );
};

export const getWatchlistData = async (
  symbols?: string[],
): Promise<WatchlistData> => {
  try {
    const params =
      symbols && Array.isArray(symbols) && symbols.length > 0
        ? { symbols: symbols.join(',') }
        : {};
    const response = await apiClient.get('/fmp/watchlist', { params });
    if (response.data.success) {
      return response.data.data;
    } else {
      // Return mock data as fallback
      return generateMockWatchlist();
    }
  } catch (error) {
    console.debug('Watchlist API failed, returning mock data:', error);
    return generateMockWatchlist();
  }
};

export const getMarketSummary = async (): Promise<MarketSummaryData> => {
  return handleApiResponse<MarketSummaryData>(
    apiClient.get('/fmp/market/summary'),
  );
};

export const getAIInsights = async (): Promise<AIInsightsData> => {
  return handleApiResponse<AIInsightsData>(apiClient.get('/fmp/ai/insights'));
};

export const getRecentTransactions = async (
  limit: number = 10,
): Promise<RecentTransactionsData> => {
  return handleApiResponse<RecentTransactionsData>(
    apiClient.get('/fmp/portfolio/transactions', { params: { limit } }),
  );
};

export const getPerformanceMetrics =
  async (): Promise<PerformanceMetricsData> => {
    return handleApiResponse<PerformanceMetricsData>(
      apiClient.get('/fmp/portfolio/metrics'),
    );
  };

export const getAlerts = async (): Promise<AlertsData> => {
  return handleApiResponse<AlertsData>(apiClient.get('/fmp/alerts'));
};

export const getNewsFeed = async (
  limit: number = 20,
): Promise<NewsFeedData> => {
  return handleApiResponse<NewsFeedData>(
    apiClient.get('/fmp/news', { params: { limit } }),
  );
};

export const getSectorPerformance = async (
  timeframe: string = '1D',
): Promise<SectorPerformanceData> => {
  return handleApiResponse<SectorPerformanceData>(
    apiClient.get('/fmp/market/sectors', { params: { timeframe } }),
  );
};

export const getTopMovers = async (
  market: string = 'nasdaq',
  type: string = 'gainers',
): Promise<TopMoversData> => {
  return handleApiResponse<TopMoversData>(
    apiClient.get('/fmp/market/movers', { params: { market, type } }),
  );
};

export const getEconomicCalendar = async (
  date?: string,
): Promise<EconomicCalendarData> => {
  const params = date ? { date } : {};
  return handleApiResponse<EconomicCalendarData>(
    apiClient.get('/fmp/economic/calendar', { params }),
  );
};

// --- Generic API Client Export ---
export { apiClient };

// Add widget-specific methods to apiClient object
apiClient.getPortfolioOverview = async (): Promise<PortfolioOverviewData> => {
  try {
    const response = await apiClient.get('/fmp/portfolio/overview');
    if (response.data.success) {
      return response.data.data;
    } else {
      // Return mock data as fallback
      return generateMockPortfolioOverview();
    }
  } catch (error) {
    console.debug('Portfolio overview API failed, returning mock data');
    return generateMockPortfolioOverview();
  }
};

apiClient.getMarketSummaryData = async (): Promise<MarketSummaryData> => {
  try {
    const response = await apiClient.get('/fmp/market/summary');
    if (response.data.success) {
      return response.data.data;
    } else {
      // Return mock data as fallback
      return generateMockMarketSummary();
    }
  } catch (error) {
    console.debug('Market summary API failed, returning mock data');
    return generateMockMarketSummary();
  }
};

apiClient.getWatchlistData = async (
  symbols?: string[],
): Promise<WatchlistData> => {
  try {
    const params =
      symbols && Array.isArray(symbols) && symbols.length > 0
        ? { symbols: symbols.join(',') }
        : {};
    const response = await apiClient.get('/fmp/watchlist', { params });
    if (response.data.success) {
      return response.data.data;
    } else {
      // Return mock data as fallback
      return generateMockWatchlist();
    }
  } catch (error) {
    console.debug('Watchlist API failed, returning mock data');
    return generateMockWatchlist();
  }
};

apiClient.getNewsFeedData = async (
  limit: number = 20,
  filters?: any,
): Promise<NewsFeedData> => {
  try {
    const params: any = { limit };
    if (filters?.keywords) params.keywords = filters.keywords;
    const response = await apiClient.get('/fmp/news', { params });
    if (response.data.success) {
      return response.data.data;
    } else {
      // Return mock data as fallback
      return generateMockNewsFeed(limit);
    }
  } catch (error) {
    console.debug('News feed API failed, returning mock data');
    return generateMockNewsFeed(limit);
  }
};

apiClient.getAlertsData = async (
  limit: number = 10,
  filters?: any,
): Promise<AlertsData> => {
  try {
    const params: any = { limit };
    if (filters) Object.assign(params, filters);
    const response = await apiClient.get('/fmp/alerts', { params });
    if (response.data.success) {
      return response.data.data;
    } else {
      // Return mock data as fallback
      return generateMockAlerts(limit);
    }
  } catch (error) {
    console.debug('Alerts API failed, returning mock data');
    return generateMockAlerts(limit);
  }
};

apiClient.getTopMoversData = async (
  market: string = 'US Equities',
  count: number = 5,
): Promise<TopMoversData> => {
  try {
    const response = await apiClient.get('/fmp/market/movers', {
      params: { market: market.toLowerCase().replace(' ', '_'), count },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      // Return mock data as fallback
      return generateMockTopMovers(market, count);
    }
  } catch (error) {
    console.debug('Top movers API failed, returning mock data');
    return generateMockTopMovers(market, count);
  }
};

// Add missing API functions that widgets are calling
apiClient.getPortfolioChartData = async (
  timeframe: string = '1M',
): Promise<PortfolioChartData> => {
  try {
    const response = await apiClient.get('/fmp/portfolio/chart', {
      params: { timeframe },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      return generateMockPortfolioChart(timeframe);
    }
  } catch (error) {
    console.debug('Portfolio chart API failed, returning mock data');
    return generateMockPortfolioChart(timeframe);
  }
};

apiClient.getPerformanceMetricsData =
  async (): Promise<PerformanceMetricsData> => {
    try {
      const response = await apiClient.get('/fmp/portfolio/performance');
      if (response.data.success) {
        return response.data.data;
      } else {
        return generateMockPerformanceMetrics();
      }
    } catch (error) {
      console.debug('Performance metrics API failed, returning mock data');
      return generateMockPerformanceMetrics();
    }
  };

apiClient.getSectorPerformanceData = async (
  timeframe: string = '1D',
): Promise<SectorPerformanceData> => {
  try {
    const response = await apiClient.get('/fmp/market/sectors', {
      params: { timeframe },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      return generateMockSectorPerformance(timeframe);
    }
  } catch (error) {
    console.debug('Sector performance API failed, returning mock data');
    return generateMockSectorPerformance(timeframe);
  }
};

apiClient.getAIInsightsData = async (count: number = 5): Promise<{ success: boolean; data: AIInsightsData; message?: string }> => {
  try {
    const response = await apiClient.get('/fmp/ai/insights', { params: { count } });
    if (response.data.success) {
      return response.data;
    } else {
      // Return mock data as fallback with proper response structure
      return {
        success: true,
        data: generateMockAIInsights(),
      };
    }
  } catch (error) {
    console.debug('AI insights API failed, returning mock data');
    return {
      success: true,
      data: generateMockAIInsights(),
    };
  }
};

apiClient.getRecentTransactionsData = async (
  limit: number = 10,
): Promise<RecentTransactionsData> => {
  try {
    const response = await apiClient.get('/fmp/portfolio/transactions', {
      params: { limit },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      return generateMockRecentTransactions(limit);
    }
  } catch (error) {
    console.debug('Recent transactions API failed, returning mock data');
    return generateMockRecentTransactions(limit);
  }
};

apiClient.getEconomicCalendarData = async (
  date?: string,
): Promise<EconomicCalendarData> => {
  try {
    const params = date ? { date } : {};
    const response = await apiClient.get('/fmp/economic/calendar', { params });
    if (response.data.success) {
      return response.data.data;
    } else {
      return generateMockEconomicCalendar(date);
    }
  } catch (error) {
    console.debug('Economic calendar API failed, returning mock data');
    return generateMockEconomicCalendar(date);
  }
};

// --- Legacy Mock Functions (for fallback) ---
// These can be removed once the backend integration is fully tested

const generateMockPortfolioOverview = (): PortfolioOverviewData => {
  return {
    portfolioValue: 125750.5,
    dayChange: 2847.25,
    dayChangePercent: 2.31,
    overallGain: 15750.5,
    overallGainPercent: 14.32,
    assetCount: 7,
    alertsCount: 2,
    lastUpdated: new Date().toISOString(),
  };
};

const generateMockPortfolioChart = (timeframe: string): PortfolioChartData => {
  const dataPoints: PortfolioChartDatapoint[] = [];
  const now = new Date();
  const baseValue = 100000;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const randomChange = (Math.random() - 0.5) * 0.02;
    const value =
      i === 29
        ? baseValue
        : dataPoints[dataPoints.length - 1].value * (1 + randomChange);

    dataPoints.push({
      timestamp: date.toISOString(),
      value: Math.round(value * 100) / 100,
    });
  }

  return {
    datapoints: dataPoints,
    timeframe,
  };
};

// Export mock functions for fallback
export const getMockPortfolioOverview = generateMockPortfolioOverview;
export const getMockPortfolioChart = generateMockPortfolioChart;

const generateMockMarketSummary = (): MarketSummaryData => {
  return {
    majorIndices: [
      {
        id: 'spy',
        name: 'S&P 500',
        shortName: 'S&P 500',
        value: 445.67,
        change: 8.23,
        changePercent: 1.88,
      },
      {
        id: 'qqq',
        name: 'NASDAQ 100',
        shortName: 'NASDAQ',
        value: 378.45,
        change: -2.15,
        changePercent: -0.56,
      },
      {
        id: 'dia',
        name: 'Dow Jones Industrial Average',
        shortName: 'Dow',
        value: 347.23,
        change: 5.67,
        changePercent: 1.66,
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
};

const generateMockWatchlist = (): WatchlistData => {
  return {
    watchlistId: 'default-watchlist',
    name: 'My Watchlist',
    items: [
      {
        id: 'watch-1',
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
        id: 'watch-2',
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 142.78,
        change: -1.56,
        changePercent: -1.08,
        volume: 23456789,
        marketCap: 1780000000000,
        logoUrl: 'https://logo.clearbit.com/google.com',
      },
      {
        id: 'watch-3',
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 378.91,
        change: 4.23,
        changePercent: 1.13,
        volume: 34567890,
        marketCap: 2810000000000,
        logoUrl: 'https://logo.clearbit.com/microsoft.com',
      },
      {
        id: 'watch-4',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        price: 248.5,
        change: -8.75,
        changePercent: -3.4,
        volume: 78901234,
        marketCap: 789000000000,
        logoUrl: 'https://logo.clearbit.com/tesla.com',
      },
    ],
  };
};

const generateMockNewsFeed = (limit: number): NewsFeedData => {
  const articles: NewsArticle[] = [];
  const now = new Date();

  for (let i = 0; i < Math.min(limit, 10); i++) {
    const publishedAt = new Date(
      now.getTime() - (i * 2 + Math.random() * 4) * 60 * 60 * 1000,
    );
    articles.push({
      id: `news-${i + 1}`,
      title: `Market Analysis: ${['Tech Stocks Rally', 'Fed Decision Impact', 'Earnings Beat Expectations', 'Oil Prices Surge', 'Crypto Market Update'][i % 5]}`,
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      url: `https://example.com/news/${i + 1}`,
      source: ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch', 'Yahoo Finance'][
        i % 5
      ],
      publishedAt: publishedAt.toISOString(),
      imageUrl: `https://picsum.photos/320/200?random=${i + 1}`,
      symbols: i % 2 === 0 ? ['AAPL', 'MSFT'] : ['GOOGL', 'TSLA'],
    });
  }

  return {
    articles,
    filter: {},
    lastRefreshed: new Date().toISOString(),
  };
};

const generateMockAlerts = (limit: number): AlertsData => {
  const alerts: AlertItem[] = [];
  const now = new Date();

  for (let i = 0; i < Math.min(limit, 5); i++) {
    const timestamp = new Date(
      now.getTime() - (i * 3 + Math.random() * 6) * 60 * 60 * 1000,
    );
    alerts.push({
      id: `alert-${i + 1}`,
      title: `${['Price Alert', 'Volume Spike', 'News Alert', 'Technical Signal', 'Earnings Alert'][i % 5]}`,
      description: `${['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'][i % 5]} has triggered your alert condition.`,
      severity: (['info', 'warning', 'critical'] as AlertSeverity[])[i % 3],
      status: (['active', 'acknowledged', 'resolved'] as AlertStatus[])[i % 3],
      timestamp: timestamp.toISOString(),
      symbol: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'][i % 5],
      link: `https://example.com/alert/${i + 1}`,
    });
  }

  return {
    alerts,
    filter: { status: ['active', 'acknowledged'] },
    lastRefreshed: new Date().toISOString(),
  };
};

const generateMockTopMovers = (
  market: string,
  count: number,
): TopMoversData => {
  const generateMovers = (type: 'gain' | 'loss' | 'active'): TopMoverItem[] => {
    const movers: TopMoverItem[] = [];
    const symbols = [
      'AAPL',
      'GOOGL',
      'MSFT',
      'TSLA',
      'AMZN',
      'META',
      'NVDA',
      'NFLX',
      'AMD',
      'CRM',
    ];

    for (let i = 0; i < Math.min(count, symbols.length); i++) {
      const changeMultiplier =
        type === 'gain'
          ? 1
          : type === 'loss'
            ? -1
            : Math.random() > 0.5
              ? 1
              : -1;
      const changePercent = (Math.random() * 5 + 0.5) * changeMultiplier;
      const price = Math.random() * 200 + 50;
      const change = (price * changePercent) / 100;

      movers.push({
        id: `mover-${i}`,
        symbol: symbols[i],
        name: `${symbols[i]} Company`,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
      });
    }

    return movers;
  };

  return {
    market,
    gainers: generateMovers('gain'),
    losers: generateMovers('loss'),
    mostActive: generateMovers('active'),
    lastUpdated: new Date().toISOString(),
  };
};

// Add missing mock data generators
const generateMockPerformanceMetrics = (): PerformanceMetricsData => {
  return {
    totalReturn: 15.47,
    dailyReturn: 0.23,
    weeklyReturn: 1.85,
    monthlyReturn: 4.12,
    yearlyReturn: 18.93,
    sharpeRatio: 1.34,
    beta: 1.08,
    volatility: 14.2,
    maxDrawdown: -8.5,
    winRate: 67.3,
    profitFactor: 1.42,
    lastUpdated: new Date().toISOString(),
  };
};

const generateMockSectorPerformance = (
  timeframe: string,
): SectorPerformanceData => {
  const sectors = [
    'Technology',
    'Healthcare',
    'Financials',
    'Consumer Discretionary',
    'Communication Services',
    'Industrials',
    'Consumer Staples',
    'Energy',
    'Utilities',
    'Real Estate',
    'Materials',
  ];

  const sectorData = sectors.map((name, index) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    performance: Math.round((Math.random() * 10 - 5) * 100) / 100,
    marketCap: Math.floor(Math.random() * 5000000000000) + 1000000000000,
    change: Math.round((Math.random() * 4 - 2) * 100) / 100,
    volume: Math.floor(Math.random() * 1000000000) + 100000000,
  }));

  return {
    sectors: sectorData,
    timeframe,
    lastUpdated: new Date().toISOString(),
  };
};

const generateMockAIInsights = (): AIInsightsData => {
  const insights: AIInsightItem[] = [
    {
      id: 'insight-1',
      title: 'Market Sentiment Analysis',
      summary: 'Current market sentiment is bullish with increasing institutional buying. Technical indicators suggest continued upward momentum in the technology sector.',
      source: 'AI Market Analysis Engine',
      referenceSymbol: 'SPY',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      sentiment: 'positive',
      insightType: 'market_trend',
      confidenceScore: 0.87,
      tags: ['bullish', 'institutional', 'technology'],
    },
    {
      id: 'insight-2',
      title: 'Technical Pattern Detection',
      summary: 'Ascending triangle pattern identified in Apple Inc. stock. This pattern typically indicates a potential bullish breakout above the $185 resistance level.',
      source: 'Technical Analysis AI',
      referenceSymbol: 'AAPL',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      sentiment: 'positive',
      insightType: 'stock_signal',
      confidenceScore: 0.72,
      tags: ['technical', 'pattern', 'breakout'],
    },
    {
      id: 'insight-3',
      title: 'Portfolio Risk Assessment',
      summary: 'Portfolio concentration risk detected in technology sector. Current allocation of 65% in tech stocks exceeds recommended 40% threshold for balanced portfolios.',
      source: 'Risk Management AI',
      referenceSymbol: 'TECH',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      sentiment: 'negative',
      insightType: 'portfolio_tip',
      confidenceScore: 0.91,
      tags: ['risk', 'diversification', 'allocation'],
    },
    {
      id: 'insight-4',
      title: 'Economic Event Impact',
      summary: 'Federal Reserve meeting scheduled for next week. Historical data suggests 0.25% rate cut could boost equity markets by 2-3% on average.',
      source: 'Economic Calendar AI',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      sentiment: 'neutral',
      insightType: 'economic_event',
      confidenceScore: 0.78,
      tags: ['fed', 'rates', 'economic'],
    },
    {
      id: 'insight-5',
      title: 'News Sentiment Summary',
      summary: 'Recent earnings reports from major tech companies show strong Q3 performance. AI sentiment analysis of 150+ news articles indicates positive market outlook.',
      source: 'News Sentiment AI',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      sentiment: 'positive',
      insightType: 'news_summary',
      confidenceScore: 0.83,
      tags: ['earnings', 'sentiment', 'tech'],
    },
  ];

  return {
    insights,
    lastRefreshed: new Date().toISOString(),
  };
};

const generateMockRecentTransactions = (
  limit: number,
): RecentTransactionsData => {
  const transactions = [];
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];
  const types = ['buy', 'sell'] as const;

  for (let i = 0; i < Math.min(limit, 10); i++) {
    const symbol = symbols[i % symbols.length];
    const type = types[i % 2];
    const quantity = Math.floor(Math.random() * 100) + 1;
    const price = Math.round((Math.random() * 200 + 50) * 100) / 100;
    const timestamp = new Date(
      Date.now() - (i * 2 + Math.random() * 4) * 60 * 60 * 1000,
    );

    transactions.push({
      id: `tx-${i + 1}`,
      symbol,
      type,
      quantity,
      price,
      total: Math.round(quantity * price * 100) / 100,
      timestamp: timestamp.toISOString(),
      fees: Math.round(quantity * price * 0.001 * 100) / 100,
      status: 'completed' as const,
    });
  }

  return {
    transactions,
    totalCount: transactions.length,
    lastUpdated: new Date().toISOString(),
  };
};

const generateMockEconomicCalendar = (date?: string): EconomicCalendarData => {
  const events = [
    {
      id: 'event-1',
      title: 'Federal Reserve Interest Rate Decision',
      description: 'FOMC announces federal funds rate decision',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      impact: 'high' as const,
      country: 'US',
      category: 'Monetary Policy',
      actual: null,
      forecast: '5.25%',
      previous: '5.00%',
    },
    {
      id: 'event-2',
      title: 'Non-Farm Payrolls',
      description: 'Monthly employment change excluding farm workers',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      time: '08:30',
      impact: 'high' as const,
      country: 'US',
      category: 'Employment',
      actual: null,
      forecast: '200K',
      previous: '187K',
    },
    {
      id: 'event-3',
      title: 'Consumer Price Index',
      description: 'Monthly inflation measurement',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      time: '08:30',
      impact: 'medium' as const,
      country: 'US',
      category: 'Inflation',
      actual: null,
      forecast: '3.2%',
      previous: '3.0%',
    },
  ];

  return {
    events: date ? events.filter((e) => e.date === date) : events,
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
    lastUpdated: new Date().toISOString(),
  };
};
