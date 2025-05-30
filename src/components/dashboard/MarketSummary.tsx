/**
 * Market Summary Component
 * Real-time market data display with fallback handling and accessibility features
 * Integrates with useMarketData hook for optimized data management
 */
import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { MarketSummary as MarketSummaryType } from '../../types/portfolio';
import { formatCurrency, formatPercentage } from '../../utils/portfolioCalculations';
import { MarketSummarySkeleton } from '../ui/SkeletonLoader';
import ValueChangeDisplay from '../ui/ValueChangeDisplay';
import useMarketData from '../../hooks/useMarketData';
import { cn } from '../../utils/tailwind';

// Component props
interface MarketSummaryProps {
  marketData?: MarketSummaryType;
  isLoading?: boolean;
  useRealTimeData?: boolean;
  onRefresh?: () => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Market index data structure
interface MarketIndex {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercentage: number;
  displayName: string;
}

// Market status badge component
const MarketStatusBadge: React.FC<{ 
  status: string; 
  closeTime?: string;
}> = React.memo(({ status, closeTime }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'default';
      case 'CLOSED':
        return 'secondary';
      case 'PRE_MARKET':
      case 'AFTER_HOURS':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'text-green-600';
      case 'CLOSED':
        return 'text-red-600';
      case 'PRE_MARKET':
      case 'AFTER_HOURS':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatStatusText = (status: string) => {
    switch (status) {
      case 'PRE_MARKET':
        return 'Pre-Market';
      case 'AFTER_HOURS':
        return 'After Hours';
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={getStatusVariant(status)}
        className={cn("text-xs", getStatusColor(status))}
      >
        <Activity className="w-2 h-2 mr-1" />
        {formatStatusText(status)}
      </Badge>
      {closeTime && status === 'CLOSED' && (
        <span className="text-xs text-muted-foreground">
          <Clock className="w-3 h-3 inline mr-1" />
          Closed {new Date(closeTime).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            timeZoneName: 'short'
          })}
        </span>
      )}
    </div>
  );
});

MarketStatusBadge.displayName = 'MarketStatusBadge';

// Market index item component
const MarketIndexItem: React.FC<{
  index: MarketIndex;
  isCompact?: boolean;
}> = React.memo(({ index, isCompact = false }) => {
  return (
    <div 
      className="flex items-center justify-between text-sm py-1"
      role="row"
      aria-label={`${index.displayName} market data`}
    >
      <span 
        className="font-medium"
        role="rowheader"
      >
        {isCompact ? index.symbol : index.displayName}
      </span>
      <ValueChangeDisplay
        value={index.price}
        change={index.change}
        changePercentage={index.changePercentage}
        currency={true}
        size="xs"
        showArrow={!isCompact}
      />
    </div>
  );
});

MarketIndexItem.displayName = 'MarketIndexItem';

// Connection status indicator
const ConnectionStatus: React.FC<{
  isRealTime: boolean;
  isConnected: boolean;
  lastUpdated: Date | null;
}> = React.memo(({ isRealTime, isConnected, lastUpdated }) => {
  const formatLastUpdated = useCallback((date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 30) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  }, []);

  if (!isRealTime) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Static data</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3 text-green-600" />
          <span className="text-green-600">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-red-600" />
          <span className="text-red-600">Disconnected</span>
        </>
      )}
      {lastUpdated && (
        <span className="text-muted-foreground ml-1">
          • {formatLastUpdated(lastUpdated)}
        </span>
      )}
    </div>
  );
});

ConnectionStatus.displayName = 'ConnectionStatus';

// Error fallback component
const MarketDataError: React.FC<{
  error: string;
  onRetry?: () => void;
}> = React.memo(({ error, onRetry }) => {
  return (
    <div className="text-center py-6">
      <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
      <p className="text-sm text-muted-foreground mb-3">
        {error === 'Failed to load market data' 
          ? 'Unable to load market data' 
          : error
        }
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
});

MarketDataError.displayName = 'MarketDataError';

// Main component
export const MarketSummary: React.FC<MarketSummaryProps> = React.memo(({
  marketData: propMarketData,
  isLoading: propIsLoading = false,
  useRealTimeData = true,
  onRefresh,
  className,
  isCollapsed = false,
  onToggleCollapse
}) => {
  // Use real-time data hook if enabled
  const {
    marketData: realTimeData,
    isLoading: realTimeLoading,
    error: realTimeError,
    lastUpdated,
    isRealTime,
    refreshData,
    clearError
  } = useMarketData({
    enableRealTime: useRealTimeData,
    refreshInterval: 30000,
    cacheTimeout: 60000,
  });

  // Determine which data source to use
  const marketData = useRealTimeData ? realTimeData : propMarketData;
  const isLoading = useRealTimeData ? realTimeLoading : propIsLoading;
  const error = useRealTimeData ? realTimeError : null;

  // Memoized market indices data
  const marketIndices = useMemo((): MarketIndex[] => {
    if (!marketData) return [];

    return [
      {
        name: 'SP500',
        symbol: 'SPX',
        displayName: 'S&P 500',
        price: marketData.sp500_price,
        change: marketData.sp500_change,
        changePercentage: marketData.sp500_change_percentage,
      },
      {
        name: 'NASDAQ',
        symbol: 'IXIC',
        displayName: 'NASDAQ',
        price: marketData.nasdaq_price,
        change: marketData.nasdaq_change,
        changePercentage: marketData.nasdaq_change_percentage,
      },
      {
        name: 'DOW',
        symbol: 'DJI',
        displayName: 'Dow Jones',
        price: marketData.dow_price,
        change: marketData.dow_change,
        changePercentage: marketData.dow_change_percentage,
      },
    ];
  }, [marketData]);

  // Handle refresh with error clearing
  const handleRefresh = useCallback(() => {
    if (error) {
      clearError();
    }
    
    if (useRealTimeData) {
      refreshData();
    } else if (onRefresh) {
      onRefresh();
    }
  }, [error, clearError, useRealTimeData, refreshData, onRefresh]);

  // Loading state
  if (isLoading && !marketData) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <MarketSummarySkeleton />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && !marketData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarketDataError error={error} onRetry={handleRefresh} />
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!marketData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="mx-auto h-8 w-8 mb-2" />
            <p>Market data unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Market Overview
          </div>
          <div className="flex items-center gap-2">
            {(useRealTimeData || onRefresh) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
                aria-label="Refresh market data"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
            )}
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                aria-label={isCollapsed ? 'Expand market summary' : 'Collapse market summary'}
              >
                {isCollapsed ? <Eye size={16} /> : <EyeOff size={16} />}
              </Button>
            )}
          </div>
        </CardTitle>
        
        {/* Connection status and last updated */}
        <div className="flex items-center justify-between">
          <ConnectionStatus
            isRealTime={useRealTimeData && isRealTime}
            isConnected={!error}
            lastUpdated={lastUpdated}
          />
          {error && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isCollapsed && (
          <>
            {/* Market Status */}
            <MarketStatusBadge 
              status={marketData.market_status}
              closeTime={marketData.market_close_time}
            />
            
            {/* Market Indices */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Major Indices</h4>
              <div 
                className="space-y-1"
                role="table"
                aria-label="Market indices"
              >
                {marketIndices.map((index) => (
                  <MarketIndexItem
                    key={index.name}
                    index={index}
                    isCompact={marketIndices.length > 3}
                  />
                ))}
              </div>
            </div>

            {/* Market Sentiment Indicator */}
            {marketIndices.length > 0 && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Market Sentiment</span>
                  {(() => {
                    const positiveCount = marketIndices.filter(i => i.change > 0).length;
                    const sentiment = positiveCount >= 2 ? 'Bullish' : positiveCount === 1 ? 'Mixed' : 'Bearish';
                    const color = positiveCount >= 2 ? 'text-green-600' : positiveCount === 1 ? 'text-yellow-600' : 'text-red-600';
                    
                    return (
                      <span className={cn("font-medium", color)}>
                        {sentiment}
                      </span>
                    );
                  })()}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

MarketSummary.displayName = 'MarketSummary';

export default MarketSummary; 