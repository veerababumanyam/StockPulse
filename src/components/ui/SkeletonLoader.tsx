/**
 * Skeleton Loader Components
 * Provides skeleton loading states for various dashboard components
 * Includes animations and accessibility features
 */
import React from 'react';
import { cn } from '../../utils/theme/tailwind';

// Base skeleton component
interface SkeletonProps {
  className?: string;
  animate?: boolean;
  'aria-label'?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  animate = true,
  'aria-label': ariaLabel = 'Loading content...'
}) => {
  return (
    <div
      className={cn(
        'bg-muted rounded-md',
        animate && 'animate-pulse',
        className
      )}
      role="status"
      aria-label={ariaLabel}
    />
  );
};

// Portfolio Overview Card Skeleton
export const PortfolioOverviewSkeleton: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="bg-card rounded-lg border p-6 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" aria-label="Loading metric title" />
            <Skeleton className="h-4 w-4 rounded" aria-label="Loading metric icon" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" aria-label="Loading metric value" />
            <Skeleton className="h-3 w-20" aria-label="Loading metric subtitle" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Portfolio Positions Skeleton
export const PositionsListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" aria-label="Loading positions header" />
        <Skeleton className="h-8 w-24 rounded-md" aria-label="Loading sort button" />
      </div>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" aria-label="Loading symbol" />
            <Skeleton className="h-4 w-32" aria-label="Loading position details" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-5 w-20" aria-label="Loading position value" />
            <Skeleton className="h-4 w-16" aria-label="Loading P&L" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Recent Transactions Skeleton
export const TransactionsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-40" aria-label="Loading transactions header" />
      {[...Array(count)].map((_, index) => (
        <div key={index} className="flex items-center justify-between py-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-12 rounded-full" aria-label="Loading transaction type" />
              <Skeleton className="h-5 w-16" aria-label="Loading symbol" />
            </div>
            <Skeleton className="h-4 w-20" aria-label="Loading transaction date" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-5 w-16" aria-label="Loading quantity" />
            <Skeleton className="h-4 w-20" aria-label="Loading price" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Market Summary Skeleton
export const MarketSummarySkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" aria-label="Loading market status label" />
        <Skeleton className="h-5 w-16 rounded-full" aria-label="Loading market status badge" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" aria-label="Loading indices header" />
        {['S&P 500', 'NASDAQ', 'Dow Jones'].map((index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-16" aria-label={`Loading ${index} label`} />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" aria-label={`Loading ${index} value`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// AI Insights Skeleton
export const AIInsightsSkeleton: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <div className="space-y-4">
      <div className="text-center py-6">
        <Skeleton className="h-8 w-8 rounded mx-auto mb-2" aria-label="Loading AI icon" />
        <Skeleton className="h-4 w-48 mx-auto" aria-label="Loading AI message" />
      </div>
      {count > 0 && (
        <div className="space-y-4">
          {[...Array(count)].map((_, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <Skeleton className="h-4 w-32" aria-label="Loading insight title" />
                <Skeleton className="h-4 w-12 rounded-full" aria-label="Loading insight priority" />
              </div>
              <Skeleton className="h-4 w-full mb-2" aria-label="Loading insight content line 1" />
              <Skeleton className="h-4 w-3/4 mb-2" aria-label="Loading insight content line 2" />
              <Skeleton className="h-3 w-20" aria-label="Loading confidence score" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Performance Metrics Skeleton
export const PerformanceMetricsSkeleton: React.FC = () => {
  const metrics = [
    'Total Return',
    'Day Return',
    'Sharpe Ratio',
    'Volatility',
    'Beta',
  ];

  return (
    <div className="space-y-3">
      {metrics.map((metric) => (
        <div key={metric} className="flex justify-between text-sm">
          <Skeleton className="h-4 w-20" aria-label={`Loading ${metric} label`} />
          <Skeleton className="h-4 w-16" aria-label={`Loading ${metric} value`} />
        </div>
      ))}
    </div>
  );
};

// Chart Skeleton
export const ChartSkeleton: React.FC<{ 
  height?: number; 
  showLegend?: boolean;
  type?: 'line' | 'bar' | 'pie';
}> = ({ 
  height = 200, 
  showLegend = false,
  type = 'line'
}) => {
  return (
    <div className="space-y-3">
      {showLegend && (
        <div className="flex items-center gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded" aria-label="Loading legend color" />
              <Skeleton className="h-3 w-12" aria-label="Loading legend label" />
            </div>
          ))}
        </div>
      )}
      
      <div 
        className="bg-muted rounded-lg flex items-center justify-center animate-pulse"
        style={{ height: `${height}px` }}
        role="status"
        aria-label={`Loading ${type} chart`}
      >
        <div className="text-muted-foreground text-sm">
          Loading chart...
        </div>
      </div>
    </div>
  );
};

// Search and Filter Skeleton
export const SearchFilterSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <Skeleton className="h-10 flex-1" aria-label="Loading search input" />
      <Skeleton className="h-10 w-32" aria-label="Loading sort dropdown" />
      <Skeleton className="h-10 w-24" aria-label="Loading filter button" />
    </div>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  columns?: number; 
  rows?: number; 
  showHeader?: boolean;
}> = ({ 
  columns = 4, 
  rows = 5, 
  showHeader = true 
}) => {
  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, index) => (
            <Skeleton key={index} className="h-4 w-20" aria-label="Loading table header" />
          ))}
        </div>
      )}
      
      {[...Array(rows)].map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4 py-2 border-b border-muted" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className="h-4 w-16" 
              aria-label={`Loading table cell ${rowIndex + 1}-${colIndex + 1}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Dashboard Main Skeleton (combines all sections)
export const DashboardMainSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" aria-label="Loading page title" />
            <Skeleton className="h-4 w-80" aria-label="Loading page description" />
          </div>
          <Skeleton className="h-10 w-32" aria-label="Loading refresh button" />
        </div>

        {/* Portfolio Overview Cards */}
        <PortfolioOverviewSkeleton />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Portfolio Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" aria-label="Loading portfolio overview title" />
                  <Skeleton className="h-4 w-60" aria-label="Loading portfolio description" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" aria-label="Loading total invested label" />
                    <Skeleton className="h-8 w-32" aria-label="Loading total invested value" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" aria-label="Loading current value label" />
                    <Skeleton className="h-8 w-32" aria-label="Loading current value" />
                  </div>
                </div>
                
                <PositionsListSkeleton />
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-card rounded-lg border p-6">
              <TransactionsSkeleton />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Summary */}
            <div className="bg-card rounded-lg border p-6">
              <MarketSummarySkeleton />
            </div>

            {/* AI Insights */}
            <div className="bg-card rounded-lg border p-6">
              <AIInsightsSkeleton />
            </div>

            {/* Performance Metrics */}
            <div className="bg-card rounded-lg border p-6">
              <PerformanceMetricsSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  Skeleton,
  PortfolioOverviewSkeleton,
  PositionsListSkeleton,
  TransactionsSkeleton,
  MarketSummarySkeleton,
  AIInsightsSkeleton,
  PerformanceMetricsSkeleton,
  ChartSkeleton,
  SearchFilterSkeleton,
  TableSkeleton,
  DashboardMainSkeleton,
}; 
