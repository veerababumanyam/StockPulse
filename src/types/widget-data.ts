/**
 * StockPulse Widget-Specific Data Types
 * Defines data structures for individual widgets.
 */

export interface PortfolioOverviewData {
  portfolioValue: number;
  dayChange: number;
  dayChangePercent: number;
  overallGain: number;
  overallGainPercent: number;
  assetCount: number;
  alertsCount: number;
  lastUpdated: string;
}

export interface PortfolioChartDatapoint {
  timestamp: string; // ISO string or Date object
  value: number;
}

export interface PortfolioChartData {
  portfolioId: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  dataPoints: PortfolioChartDatapoint[];
  previousClose?: number; // For 1D chart to show +/- from prev day
  currency: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  logoUrl?: string; // Optional: URL to the company logo
}

export interface WatchlistData {
  watchlistId: string;
  name: string;
  items: WatchlistItem[];
}

export interface MarketIndexData {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  shortName?: string; // e.g. S&P 500, DJI, IXIC
}

export interface MarketSummaryData {
  majorIndices: MarketIndexData[];
  // Could add other summary points like top gainers/losers overview, market sentiment, etc.
  lastUpdated: string;
}

export type AIInsightSentiment = 'positive' | 'negative' | 'neutral' | 'mixed';
export type AIInsightType = 'market_trend' | 'stock_signal' | 'portfolio_tip' | 'economic_event' | 'news_summary';

export interface AIInsightItem {
  id: string;
  title: string;
  summary: string;
  source?: string; // e.g., News article, Analyst report
  referenceSymbol?: string; // e.g., AAPL, SPY
  timestamp: string;
  sentiment?: AIInsightSentiment;
  insightType: AIInsightType;
  confidenceScore?: number; // 0 to 1
  tags?: string[];
}

export interface AIInsightsData {
  insights: AIInsightItem[];
  lastRefreshed: string;
}

export type TransactionType = 'buy' | 'sell' | 'dividend' | 'deposit' | 'withdrawal' | 'fee';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';

export interface TransactionItem {
  id: string;
  date: string; // ISO string
  type: TransactionType;
  symbol?: string; // e.g., AAPL, not present for deposit/withdrawal
  description: string; // e.g., Bought 10 AAPL, Dividend payment, Withdrawal to Bank XXXX
  amount: number; // Positive for buy/deposit/dividend, negative for sell/withdrawal/fee
  currency: string;
  quantity?: number; // Number of shares/units for buy/sell
  pricePerUnit?: number; // Price per share/unit for buy/sell
  status: TransactionStatus;
}

export interface RecentTransactionsData {
  transactions: TransactionItem[];
  filter?: TransactionType[]; // Optional: if widget supports filtering by type
  lastUpdated: string;
}

export interface PerformanceMetricItem {
  id: string;
  label: string; // e.g., "Annualized Return", "Sharpe Ratio", "Max Drawdown"
  value: string; // Can be string to accommodate percentages, ratios, or currency
  trend?: 'up' | 'down' | 'neutral';
  tooltip?: string; // Explanation of the metric
  period?: string; // e.g., "YTD", "1Y", "3Y", "Since Inception"
}

export interface PerformanceMetricsData {
  portfolioId: string;
  metrics: PerformanceMetricItem[];
  asOfDate: string;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

export interface AlertItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  symbol?: string; // If alert is related to a specific stock
  targetValue?: number | string; // e.g., Price target reached
  currentValue?: number | string; // e.g., Current price when alert triggered
  link?: string; // Link to more details or relevant page
}

export interface AlertsData {
  alerts: AlertItem[];
  filter?: {
    severity?: AlertSeverity[];
    status?: AlertStatus[];
  };
  lastRefreshed: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string; // e.g., "Reuters", "Bloomberg", "Yahoo Finance"
  url: string;
  publishedAt: string; // ISO string
  summary?: string;
  imageUrl?: string;
  symbols?: string[]; // Related stock symbols
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface NewsFeedData {
  articles: NewsArticle[];
  filter?: {
    sources?: string[];
    symbols?: string[];
    keywords?: string;
  };
  lastRefreshed: string;
}

export interface SectorPerformanceItem {
  id: string; // e.g., "technology", "healthcare"
  name: string; // e.g., "Technology", "Healthcare"
  changePercent: number;
  marketCapChange?: number;
  topGainer?: { symbol: string; changePercent: number };
  topLoser?: { symbol: string; changePercent: number };
  color?: string; // Optional: for chart visualization
}

export interface SectorPerformanceData {
  sectors: SectorPerformanceItem[];
  timeframe: '1D' | '1W' | '1M' | 'YTD'; // Timeframe for the performance data
  lastUpdated: string;
}

export interface TopMoverItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  logoUrl?: string;
}

export interface TopMoversData {
  gainers: TopMoverItem[];
  losers: TopMoverItem[];
  mostActive: TopMoverItem[]; // By volume or number of trades
  market: string; // e.g., "US Equities", "NASDAQ", "Crypto"
  lastUpdated: string;
}

export type EventImpact = 'low' | 'medium' | 'high';
export type EventType = 'earnings' | 'dividend' | 'ipo' | 'split' | 'fed_meeting' | 'cpi_report' | 'gdp_report' | 'unemployment_report' | 'other_economic';

export interface CalendarEventItem {
  id: string;
  date: string; // ISO string for the event date/time
  title: string;
  country?: string; // e.g., "US", "EU", "CN"
  eventType: EventType;
  impact?: EventImpact;
  actual?: string | number; // Actual value released
  forecast?: string | number; // Forecasted value
  previous?: string | number; // Previous value
  source?: string;
  notes?: string;
}

export interface EconomicCalendarData {
  events: CalendarEventItem[];
  filter?: {
    countries?: string[];
    impactLevels?: EventImpact[];
    eventTypes?: EventType[];
    dateRange?: { startDate: string; endDate: string };
  };
  lastRefreshed: string;
}

// Add other widget-specific data interfaces here as we implement them
// e.g., PortfolioChartData, WatchlistItem, MarketIndex, AIInsight, etc. 