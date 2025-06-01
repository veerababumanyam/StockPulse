/**
 * Enhanced Portfolio Page
 * Complete portfolio management interface with real-time data, analytics,
 * advanced filtering, mobile responsiveness, and accessibility features
 */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Settings,
  RefreshCw,
  Download,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Activity,
  Eye,
  Filter,
  Maximize2,
  Minimize2,
  HelpCircle,
  Bell,
  PieChart,
  LineChart,
  Newspaper,
  DollarSign,
  Target,
  Shield,
  MoreVertical,
} from 'lucide-react';

// Custom hooks and components
import { usePortfolioData } from '../hooks/usePortfolioData';
import { PortfolioSummaryCard } from '../components/portfolio/PortfolioSummaryCard';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import {
  PortfolioPageSkeleton,
  PortfolioSummarySkeleton,
  HoldingsTableSkeleton,
  PortfolioAnalyticsSkeleton,
  NewsAndAlertsSkeleton,
} from '../components/portfolio/PortfolioSkeletonLoader';

// Types
import {
  PositionAction,
  ExportOptions,
  PortfolioPageConfig,
  PortfolioAnalytics,
  StockNews,
  PriceAlert,
} from '../types/portfolio';
import {
  formatCurrency,
  formatPercentage,
} from '../utils/portfolioCalculations';
import { cn } from '../utils/cn';

// Enhanced Portfolio Analytics Component
const PortfolioAnalyticsSection: React.FC<{
  analytics: PortfolioAnalytics | null;
  isLoading: boolean;
  compactMode: boolean;
  className?: string;
}> = React.memo(({ analytics, isLoading, compactMode, className }) => {
  if (isLoading || !analytics) {
    return (
      <PortfolioAnalyticsSkeleton
        className={className}
        compactMode={compactMode}
      />
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Portfolio Analytics
          </h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of your portfolio performance and risk
            metrics
          </p>
        </div>
        {!compactMode && (
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Report
          </Button>
        )}
      </div>

      {/* Performance metrics grid */}
      <div
        className={cn(
          'grid gap-4',
          compactMode
            ? 'grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        )}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(
                analytics.performanceMetrics.total_return_percentage,
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.performanceMetrics.total_return)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.riskMetrics.sharpeRatio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Beta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.riskMetrics.beta.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Market correlation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{analytics.riskMetrics.maxDrawdown.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Largest peak-to-trough decline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alpha</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                analytics.comparisonData.alpha >= 0
                  ? 'text-green-600'
                  : 'text-red-600',
              )}
            >
              {analytics.comparisonData.alpha >= 0 ? '+' : ''}
              {analytics.comparisonData.alpha.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs {analytics.comparisonData.benchmark}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Volatility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.riskMetrics.volatility.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Annualized volatility
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Diversification metrics */}
      {!compactMode && analytics.diversificationMetrics && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Sector allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.diversificationMetrics.sectorAllocation.map(
                  (sector) => (
                    <div
                      key={sector.sector}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        <span className="text-sm font-medium">
                          {sector.sector}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {sector.percentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(sector.value)}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Concentration Risk</span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      analytics.diversificationMetrics.concentrationRisk > 0.3
                        ? 'text-red-600'
                        : 'text-green-600',
                    )}
                  >
                    {(
                      analytics.diversificationMetrics.concentrationRisk * 100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Value at Risk (95%)</span>
                  <span className="text-sm font-medium text-red-600">
                    -{formatCurrency(analytics.riskMetrics.valueAtRisk)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Herfindahl Index</span>
                  <span className="text-sm font-medium">
                    {analytics.diversificationMetrics.herfindahlIndex.toFixed(
                      3,
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});

PortfolioAnalyticsSection.displayName = 'PortfolioAnalyticsSection';

// News and Alerts Section Component
const NewsAndAlertsSection: React.FC<{
  news: StockNews[];
  alerts: PriceAlert[];
  isLoading: boolean;
  compactMode: boolean;
  className?: string;
}> = React.memo(({ news, alerts, isLoading, compactMode, className }) => {
  if (isLoading) {
    return (
      <NewsAndAlertsSkeleton className={className} compactMode={compactMode} />
    );
  }

  return (
    <div
      className={cn(
        'grid gap-6',
        compactMode ? 'lg:grid-cols-1' : 'lg:grid-cols-2',
        className,
      )}
    >
      {/* News section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Market News
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {news.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent news available
            </div>
          ) : (
            <div className="space-y-4">
              {news.slice(0, 3).map((article) => (
                <div
                  key={article.id}
                  className="flex gap-3 p-3 border rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-medium line-clamp-2">
                      {article.headline}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                      <Badge
                        variant={
                          article.sentiment === 'POSITIVE'
                            ? 'default'
                            : article.sentiment === 'NEGATIVE'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {article.sentiment.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Price Alerts
            </CardTitle>
            <Button variant="outline" size="sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              New Alert
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active alerts
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 p-2 border rounded"
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      alert.isActive ? 'bg-green-500' : 'bg-gray-400',
                    )}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{alert.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {alert.alertType.replace('_', ' ').toLowerCase()}{' '}
                      {alert.threshold}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

NewsAndAlertsSection.displayName = 'NewsAndAlertsSection';

// Main Portfolio Page Component
export default function PortfolioPage() {
  // Portfolio data hook
  const {
    summary,
    holdings,
    analytics,
    realtimeData,
    news,
    alerts,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    tableState,
    filteredPositions,
    config,
    loadPortfolioData,
    refreshData,
    updateFilters,
    updateTableState,
    exportData,
    clearError,
    buyMore,
    sellPosition,
    setAlert,
    updateConfig,
  } = usePortfolioData({
    portfolioId: '1',
    enableRealTime: true,
    autoLoad: true,
  });

  // Local state
  const [selectedAction, setSelectedAction] = useState<PositionAction | null>(
    null,
  );
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Handle position actions
  const handlePositionAction = useCallback(
    async (action: PositionAction) => {
      setSelectedAction(action);

      switch (action.type) {
        case 'BUY_MORE':
          // Mock buy more action
          console.log(`Buy more ${action.symbol}`);
          break;
        case 'SELL':
          // Mock sell action
          console.log(`Sell ${action.symbol}`);
          break;
        case 'SET_ALERT':
          // Mock set alert action
          await setAlert({
            symbol: action.symbol,
            alertType: 'PRICE_ABOVE',
            threshold: action.data?.currentPrice * 1.1 || 100,
            isActive: true,
          });
          break;
        case 'VIEW_DETAILS':
          // Navigate to position details
          console.log(`View details for ${action.symbol}`);
          break;
        case 'VIEW_NEWS':
          // Navigate to stock news
          console.log(`View news for ${action.symbol}`);
          break;
        case 'ANALYZE':
          // Navigate to analysis page
          console.log(`Analyze ${action.symbol}`);
          break;
      }
    },
    [setAlert],
  );

  // Handle export
  const handleExport = useCallback(async () => {
    const exportOptions: ExportOptions = {
      format: 'CSV',
      includeTransactions: true,
      includeAnalytics: true,
    };

    try {
      await exportData(exportOptions);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [exportData]);

  // Handle configuration changes
  const handleConfigChange = useCallback(
    (key: keyof PortfolioPageConfig, value: any) => {
      updateConfig({ [key]: value });
    },
    [updateConfig],
  );

  // Memoized page calculations
  const pageMetrics = useMemo(() => {
    if (!summary || !filteredPositions) return null;

    const totalPositions = filteredPositions.length;
    const profitablePositions = filteredPositions.filter(
      (p) => p.gainLoss > 0,
    ).length;
    const biggestGainer = filteredPositions.reduce(
      (max, pos) =>
        pos.gainLossPercentage > max.gainLossPercentage ? pos : max,
      filteredPositions[0] || { gainLossPercentage: 0 },
    );
    const biggestLoser = filteredPositions.reduce(
      (min, pos) =>
        pos.gainLossPercentage < min.gainLossPercentage ? pos : min,
      filteredPositions[0] || { gainLossPercentage: 0 },
    );

    return {
      totalPositions,
      profitablePositions,
      profitabilityRate:
        totalPositions > 0 ? (profitablePositions / totalPositions) * 100 : 0,
      biggestGainer:
        biggestGainer.gainLossPercentage > 0 ? biggestGainer : null,
      biggestLoser: biggestLoser.gainLossPercentage < 0 ? biggestLoser : null,
    };
  }, [summary, filteredPositions]);

  // Error handling
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Error loading portfolio data: {error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (isLoading && !summary) {
    return (
      <PortfolioPageSkeleton
        compactMode={config.compactMode}
        showAnalytics={config.showAnalytics}
        showNews={config.showNews}
      />
    );
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            Monitor and manage your investment portfolio with real-time data and
            analytics
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Real-time indicator */}
          {realtimeData && (
            <Badge variant="outline" className="gap-1">
              <Activity className="w-3 h-3" />
              Live Data
            </Badge>
          )}

          {/* Action buttons */}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')}
            />
            Refresh
          </Button>

          {/* Configuration menu */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfigModal(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Banner */}
      {pageMetrics && !config.compactMode && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Positions
                  </p>
                  <p className="text-2xl font-bold">
                    {pageMetrics.totalPositions}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pageMetrics.profitabilityRate.toFixed(1)}% profitable
                  </p>
                </div>
                <PieChart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold">
                    {summary ? formatCurrency(summary.totalValue) : '---'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Portfolio worth
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {pageMetrics.biggestGainer && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Top Performer
                    </p>
                    <p className="text-lg font-bold">
                      {pageMetrics.biggestGainer.symbol}
                    </p>
                    <p className="text-xs text-green-600">
                      +{pageMetrics.biggestGainer.gainLossPercentage.toFixed(2)}
                      %
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          )}

          {pageMetrics.biggestLoser && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Biggest Loser
                    </p>
                    <p className="text-lg font-bold">
                      {pageMetrics.biggestLoser.symbol}
                    </p>
                    <p className="text-xs text-red-600">
                      {pageMetrics.biggestLoser.gainLossPercentage.toFixed(2)}%
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Portfolio Summary */}
      {config.showSummaryCards && summary && (
        <PortfolioSummaryCard
          summary={summary}
          isLoading={isLoading}
          compactMode={config.compactMode}
          showAnimations={true}
        />
      )}

      {/* Holdings Table */}
      <HoldingsTable
        positions={filteredPositions}
        tableState={tableState}
        realtimeData={realtimeData}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        enableQuickActions={config.enableQuickActions}
        enableExport={config.enableExport}
        compactMode={config.compactMode}
        onUpdateTableState={updateTableState}
        onUpdateFilters={updateFilters}
        onPositionAction={handlePositionAction}
        onExport={handleExport}
        onRefresh={refreshData}
      />

      {/* Analytics Section */}
      {config.showAnalytics && (
        <PortfolioAnalyticsSection
          analytics={analytics}
          isLoading={isLoading}
          compactMode={config.compactMode}
        />
      )}

      {/* News and Alerts Section */}
      {(config.showNews || config.showAlerts) && (
        <NewsAndAlertsSection
          news={news}
          alerts={alerts}
          isLoading={isLoading}
          compactMode={config.compactMode}
        />
      )}
    </div>
  );
}
