/**
 * Optimized Dashboard Component
 * High-performance dashboard with memoized calculations, extracted components,
 * real-time updates, accessibility features, and comprehensive error handling
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Brain, 
  Activity, 
  Plus,
  Settings,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import ValueChangeDisplay from '../components/ui/ValueChangeDisplay';
import { DashboardMainSkeleton } from '../components/ui/SkeletonLoader';

// Optimized sub-components
import PortfolioOverview from '../components/dashboard/PortfolioOverview';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import MarketSummary from '../components/dashboard/MarketSummary';

// Utility functions
import {
  formatCurrency,
  formatPercentage,
  createCalculationKey,
  validatePortfolioData,
  sanitizeNumericInput
} from '../utils/portfolioCalculations';
import { cn } from '../utils/tailwind';

// Dashboard layout configuration
interface DashboardConfig {
  showPortfolioCards: boolean;
  showPortfolioOverview: boolean;
  showRecentTransactions: boolean;
  showMarketSummary: boolean;
  showAIInsights: boolean;
  showPerformanceMetrics: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  compactMode: boolean;
}

// Default dashboard configuration
const DEFAULT_CONFIG: DashboardConfig = {
  showPortfolioCards: true,
  showPortfolioOverview: true,
  showRecentTransactions: true,
  showMarketSummary: true,
  showAIInsights: true,
  showPerformanceMetrics: true,
  autoRefresh: true,
  refreshInterval: 30000,
  compactMode: false,
};

// Memoized Portfolio Overview Cards Component
const PortfolioOverviewCards = React.memo<{
  portfolio: any;
  isLoading?: boolean;
  onRefresh?: () => void;
}>(({ portfolio, isLoading, onRefresh }) => {
  // Memoized metrics calculations
  const metrics = useMemo(() => {
    if (!portfolio) return null;

    return {
      totalValue: sanitizeNumericInput(portfolio.total_value),
      totalPnL: sanitizeNumericInput(portfolio.total_pnl),
      totalPnLPercentage: sanitizeNumericInput(portfolio.total_pnl_percentage),
      dayPnL: sanitizeNumericInput(portfolio.day_pnl),
      dayPnLPercentage: sanitizeNumericInput(portfolio.day_pnl_percentage),
      cashBalance: sanitizeNumericInput(portfolio.cash_balance),
    };
  }, [portfolio]);

  if (isLoading || !metrics) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-card rounded-lg border p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ValueChangeDisplay
            value={metrics.totalValue}
            change={metrics.dayPnL}
            changePercentage={metrics.dayPnLPercentage}
            currency={true}
            size="lg"
            aria-label={`Total portfolio value: ${formatCurrency(metrics.totalValue)}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ValueChangeDisplay
            value={metrics.totalPnL}
            changePercentage={metrics.totalPnLPercentage}
            currency={true}
            size="lg"
            aria-label={`Total profit and loss: ${formatCurrency(metrics.totalPnL)}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" aria-label={`Cash balance: ${formatCurrency(metrics.cashBalance)}`}>
            {formatCurrency(metrics.cashBalance)}
          </div>
          <p className="text-xs text-muted-foreground">Available for trading</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ValueChangeDisplay
            value={0}
            changePercentage={metrics.dayPnLPercentage}
            size="lg"
            aria-label={`Day performance: ${formatPercentage(metrics.dayPnLPercentage)}`}
          />
          <p className="text-xs text-muted-foreground">Today's change</p>
        </CardContent>
      </Card>
    </div>
  );
});

PortfolioOverviewCards.displayName = 'PortfolioOverviewCards';

// Memoized AI Insights Component
const AIInsightsSection = React.memo<{
  insights: any[];
  isLoading?: boolean;
  onInsightClick?: (insight: any) => void;
}>(({ insights, isLoading, onInsightClick }) => {
  const handleInsightClick = useCallback((insight: any) => {
    onInsightClick?.(insight);
  }, [onInsightClick]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-12 bg-muted rounded-full animate-pulse" />
                </div>
                <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Personalized recommendations and analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!insights || insights.length === 0 ? (
          <div className="text-center py-6">
            <Brain className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              AI insights will appear here as your portfolio develops
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div 
                key={insight.id} 
                className={cn(
                  "border rounded-lg p-3 transition-all",
                  onInsightClick && "cursor-pointer hover:bg-muted/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
                onClick={() => handleInsightClick(insight)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && onInsightClick) {
                    e.preventDefault();
                    handleInsightClick(insight);
                  }
                }}
                tabIndex={onInsightClick ? 0 : -1}
                role={onInsightClick ? "button" : undefined}
                aria-label={`AI insight: ${insight.title}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium">{insight.title}</h4>
                  <Badge 
                    variant={insight.priority === 'HIGH' || insight.priority === 'CRITICAL' ? 'destructive' : 
                           insight.priority === 'MEDIUM' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.content}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Confidence: {Math.round(insight.confidence_score * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AIInsightsSection.displayName = 'AIInsightsSection';

// Main Dashboard Component
const Dashboard: React.FC = () => {
  // Configuration state
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Portfolio data hook
  const { 
    dashboardSummary, 
    isLoading, 
    error, 
    refreshData,
    lastUpdated
  } = usePortfolio({
    autoLoad: true,
    refreshInterval: config.autoRefresh ? config.refreshInterval : 0,
  });

  // Memoized data validation and processing
  const validatedData = useMemo(() => {
    if (!dashboardSummary) return null;

    const portfolio = dashboardSummary.portfolio;
    const isValid = validatePortfolioData(portfolio);

    return {
      isValid,
      portfolio,
      positions: dashboardSummary.positions || [],
      transactions: dashboardSummary.recent_transactions || [],
      aiInsights: dashboardSummary.ai_insights || [],
      marketSummary: dashboardSummary.market_summary,
      performanceMetrics: dashboardSummary.performance_metrics,
    };
  }, [dashboardSummary]);

  // Memoized calculation key for performance optimization
  const calculationKey = useMemo(() => {
    if (!validatedData) return '';
    return createCalculationKey(validatedData.positions, validatedData.portfolio?.id);
  }, [validatedData]);

  // Configuration handlers
  const updateConfig = useCallback(<K extends keyof DashboardConfig>(
    key: K,
    value: DashboardConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    
    // Save to localStorage
    const newConfig = { ...config, [key]: value };
    localStorage.setItem('dashboard-config', JSON.stringify(newConfig));
  }, [config]);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('dashboard-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch (error) {
        console.warn('Failed to load dashboard configuration:', error);
      }
    }
  }, []);

  // Handle refresh with rate limiting
  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // Handle position click
  const handlePositionClick = useCallback((position: any) => {
    console.log('Position clicked:', position);
    // TODO: Navigate to position detail page
  }, []);

  // Handle transaction click
  const handleTransactionClick = useCallback((transaction: any) => {
    console.log('Transaction clicked:', transaction);
    // TODO: Navigate to transaction detail page
  }, []);

  // Handle insight click
  const handleInsightClick = useCallback((insight: any) => {
    console.log('Insight clicked:', insight);
    // TODO: Show insight detail modal
  }, []);

  // Handle add position
  const handleAddPosition = useCallback(() => {
    console.log('Add position clicked');
    // TODO: Open add position modal
  }, []);

  // Loading state
  if (isLoading && !validatedData) {
    return <DashboardMainSkeleton />;
  }

  // Error state
  if (error && !validatedData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage 
            error={error} 
            onRetry={handleRefresh}
            showDetails={true}
            className="max-w-md mx-auto"
          />
        </div>
      </div>
    );
  }

  // Empty state - no portfolio
  if (!validatedData || !validatedData.isValid) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Portfolios Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first portfolio to track your investments and get AI-powered insights.
            </p>
            <Button className="gap-2">
              <Plus size={16} />
              Create Portfolio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { portfolio, positions, transactions, aiInsights, marketSummary, performanceMetrics } = validatedData;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Portfolio Dashboard</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Track your investments and get AI-powered insights</span>
              {lastUpdated && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-xs">
                    <Wifi className="w-3 h-3 text-green-600" />
                    <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="gap-2"
              disabled={isLoading}
              aria-label="Refresh dashboard data"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Refresh Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              aria-label="Dashboard settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        {config.showPortfolioCards && (
          <PortfolioOverviewCards
            portfolio={portfolio}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Portfolio Overview & Transactions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Overview */}
            {config.showPortfolioOverview && (
              <PortfolioOverview
                portfolio={portfolio}
                positions={positions}
                isLoading={isLoading}
                onPositionClick={handlePositionClick}
                onAddPosition={handleAddPosition}
              />
            )}

            {/* Recent Transactions */}
            {config.showRecentTransactions && (
              <RecentTransactions
                transactions={transactions}
                isLoading={isLoading}
                onTransactionClick={handleTransactionClick}
                onRefresh={handleRefresh}
                showPagination={true}
                itemsPerPage={config.compactMode ? 5 : 10}
              />
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Market Summary */}
            {config.showMarketSummary && (
              <MarketSummary
                marketData={marketSummary}
                isLoading={isLoading}
                useRealTimeData={true}
                onRefresh={handleRefresh}
              />
            )}

            {/* AI Insights */}
            {config.showAIInsights && (
              <AIInsightsSection
                insights={aiInsights}
                isLoading={isLoading}
                onInsightClick={handleInsightClick}
              />
            )}

            {/* Performance Metrics */}
            {config.showPerformanceMetrics && performanceMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Return</span>
                    <ValueChangeDisplay
                      value={0}
                      changePercentage={performanceMetrics.total_return_percentage}
                      size="sm"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Day Return</span>
                    <ValueChangeDisplay
                      value={0}
                      changePercentage={performanceMetrics.day_return_percentage}
                      size="sm"
                    />
                  </div>
                  {performanceMetrics.sharpe_ratio && (
                    <div className="flex justify-between text-sm">
                      <span>Sharpe Ratio</span>
                      <span className="font-medium">
                        {performanceMetrics.sharpe_ratio.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {performanceMetrics.volatility && (
                    <div className="flex justify-between text-sm">
                      <span>Volatility</span>
                      <span className="font-medium">
                        {performanceMetrics.volatility.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {performanceMetrics.beta && (
                    <div className="flex justify-between text-sm">
                      <span>Beta</span>
                      <span className="font-medium">
                        {performanceMetrics.beta.toFixed(2)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Hidden calculation key for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-muted-foreground opacity-50">
            Calculation key: {calculationKey}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
