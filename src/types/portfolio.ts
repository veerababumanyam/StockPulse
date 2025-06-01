/**
 * Portfolio Types
 * Type definitions for portfolio-related data structures
 * Aligned with backend Pydantic schemas for consistency
 */

// Base portfolio information
export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  total_value: number;
  cash_balance: number;
  total_cost: number;
  total_pnl: number;
  total_pnl_percentage: number;
  day_pnl: number;
  day_pnl_percentage: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Individual portfolio position
export interface PortfolioPosition {
  id: string;
  portfolio_id: string;
  symbol: string;
  quantity: number;
  average_cost: number;
  current_price: number;
  market_value: number;
  total_cost: number;
  unrealized_pnl: number;
  unrealized_pnl_percentage: number;
  day_pnl: number;
  day_pnl_percentage: number;
  weight_percentage: number;
  created_at: string;
  updated_at: string;
}

// Transaction record
export interface Transaction {
  id: string;
  portfolio_id: string;
  symbol: string;
  transaction_type: 'BUY' | 'SELL' | 'DIVIDEND' | 'SPLIT' | 'TRANSFER';
  quantity: number;
  price: number;
  total_amount: number;
  fees: number;
  transaction_date: string;
  created_at: string;
  notes?: string;
}

// AI-generated portfolio insights
export interface AIPortfolioInsight {
  id: string;
  portfolio_id: string;
  insight_type: 'ANALYSIS' | 'RECOMMENDATION' | 'ALERT' | 'SUMMARY';
  title: string;
  content: string;
  confidence_score: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
  expires_at?: string;
  is_read: boolean;
  metadata?: Record<string, any>;
}

// Portfolio snapshot for historical tracking
export interface PortfolioSnapshot {
  id: string;
  portfolio_id: string;
  snapshot_date: string;
  total_value: number;
  cash_balance: number;
  total_cost: number;
  total_pnl: number;
  total_pnl_percentage: number;
  positions_count: number;
  metadata?: Record<string, any>;
}

// Dashboard summary response
export interface DashboardSummary {
  portfolio: Portfolio;
  positions: PortfolioPosition[];
  recent_transactions: Transaction[];
  ai_insights: AIPortfolioInsight[];
  market_summary: MarketSummary;
  performance_metrics: PerformanceMetrics;
}

// Market summary data
export interface MarketSummary {
  market_status: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS';
  market_close_time?: string;
  sp500_price: number;
  sp500_change: number;
  sp500_change_percentage: number;
  nasdaq_price: number;
  nasdaq_change: number;
  nasdaq_change_percentage: number;
  dow_price: number;
  dow_change: number;
  dow_change_percentage: number;
}

// Performance metrics
export interface PerformanceMetrics {
  total_return: number;
  total_return_percentage: number;
  day_return: number;
  day_return_percentage: number;
  week_return: number;
  week_return_percentage: number;
  month_return: number;
  month_return_percentage: number;
  year_return: number;
  year_return_percentage: number;
  sharpe_ratio?: number;
  volatility?: number;
  beta?: number;
  max_drawdown?: number;
}

// API request types
export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  initial_cash?: number;
}

export interface UpdatePortfolioRequest {
  name?: string;
  description?: string;
  cash_balance?: number;
}

export interface AddPositionRequest {
  symbol: string;
  quantity: number;
  price: number;
  transaction_type: 'BUY' | 'SELL';
  notes?: string;
}

export interface UpdatePositionRequest {
  quantity?: number;
  notes?: string;
}

// API response types
export interface PortfolioListResponse {
  portfolios: Portfolio[];
  total_count: number;
}

export interface PortfolioDetailResponse {
  portfolio: Portfolio;
  positions: PortfolioPosition[];
  recent_transactions: Transaction[];
  performance_metrics: PerformanceMetrics;
}

// Error types
export interface PortfolioError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Loading states for UI
export interface PortfolioLoadingState {
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated?: string;
  error?: PortfolioError;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  change?: number;
  change_percentage?: number;
}

export interface PortfolioChartData {
  labels: string[];
  values: number[];
  changes: number[];
  timeframe: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ALL';
}

// Widget data for dashboard cards
export interface DashboardWidget {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  change_percentage?: number;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  subtitle?: string;
  icon?: string;
  color?: 'green' | 'red' | 'blue' | 'gray';
}

// Filter and sorting options
export interface PortfolioFilters {
  timeframe?: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  asset_type?: 'STOCK' | 'ETF' | 'CRYPTO' | 'BOND' | 'OPTION';
  sort_by?: 'symbol' | 'value' | 'pnl' | 'percentage' | 'weight';
  sort_order?: 'ASC' | 'DESC';
  search?: string;
}

// Real-time updates
export interface PortfolioUpdate {
  type: 'PRICE_UPDATE' | 'POSITION_CHANGE' | 'TRANSACTION' | 'INSIGHT';
  portfolio_id: string;
  data: any;
  timestamp: string;
}

// Enhanced portfolio types for PortfolioPage
export interface Position {
  id: string;
  symbol: string;
  companyName: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  dayChange?: number;
  dayChangePercentage?: number;
  weight?: number;
  sector?: string;
  lastUpdated?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  dayChange: number;
  dayChangePercentage: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  openPositions: number;
  profitablePositions: number;
  cashBalance: number;
  cashPercentage: number;
  portfolioReturn: number;
  totalInvested: number;
}

export interface Holdings {
  positions: Position[];
  totalValue: number;
  lastUpdated: string;
}

export type HoldingsSortBy =
  | 'symbol'
  | 'companyName'
  | 'shares'
  | 'avgCost'
  | 'currentPrice'
  | 'marketValue'
  | 'gainLoss'
  | 'gainLossPercentage'
  | 'dayChange'
  | 'weight';

export type SortDirection = 'asc' | 'desc';

export interface HoldingsFilter {
  searchTerm: string;
  sector?: string;
  profitableOnly: boolean;
  minValue?: number;
  maxValue?: number;
  sortBy: HoldingsSortBy;
  sortDirection: SortDirection;
}

export interface PortfolioAnalytics {
  performanceMetrics: PerformanceMetrics;
  riskMetrics: RiskMetrics;
  diversificationMetrics: DiversificationMetrics;
  comparisonData: BenchmarkComparison;
}

export interface RiskMetrics {
  volatility: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  valueAtRisk: number;
  conditionalValueAtRisk: number;
  correlationMatrix?: Record<string, Record<string, number>>;
}

export interface DiversificationMetrics {
  sectorAllocation: Array<{
    sector: string;
    percentage: number;
    value: number;
  }>;
  geographicAllocation: Array<{
    region: string;
    percentage: number;
    value: number;
  }>;
  marketCapAllocation: Array<{
    category: string;
    percentage: number;
    value: number;
  }>;
  concentrationRisk: number;
  herfindahlIndex: number;
}

export interface BenchmarkComparison {
  benchmark: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  alpha: number;
  beta: number;
  correlationCoefficient: number;
  trackingError: number;
  informationRatio: number;
}

export interface PriceUpdate {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercentage: number;
  timestamp: string;
  volume?: number;
  bid?: number;
  ask?: number;
}

export interface RealtimeData {
  prices: Record<string, PriceUpdate>;
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS';
  lastUpdated: string;
}

export interface ExportOptions {
  format: 'CSV' | 'PDF' | 'EXCEL';
  includeTransactions: boolean;
  includeAnalytics: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  customFields?: string[];
}

export interface PositionAction {
  type:
    | 'BUY_MORE'
    | 'SELL'
    | 'SET_ALERT'
    | 'VIEW_DETAILS'
    | 'VIEW_NEWS'
    | 'ANALYZE';
  symbol: string;
  data?: any;
}

export interface StockNews {
  id: string;
  symbol: string;
  headline: string;
  summary: string;
  source: string;
  publishedAt: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  url: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  alertType: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PERCENT_CHANGE' | 'VOLUME';
  threshold: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface TableState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortBy?: HoldingsSortBy;
  sortDirection?: SortDirection;
  filters: HoldingsFilter;
}

export interface PortfolioPageConfig {
  showSummaryCards: boolean;
  showAnalytics: boolean;
  showNews: boolean;
  showAlerts: boolean;
  enableRealTimeUpdates: boolean;
  refreshInterval: number;
  defaultPageSize: number;
  enableExport: boolean;
  enableQuickActions: boolean;
  compactMode: boolean;
}
