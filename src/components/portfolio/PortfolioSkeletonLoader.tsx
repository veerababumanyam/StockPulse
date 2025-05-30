/**
 * Portfolio Page Skeleton Loaders
 * Specialized skeleton loading components for portfolio page sections
 */
import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { cn } from '../../utils/tailwind';

// Portfolio Summary Skeleton
export const PortfolioSummarySkeleton: React.FC<{
  className?: string;
  compactMode?: boolean;
}> = ({ className, compactMode = false }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Metrics Grid */}
      <div className={cn(
        "grid gap-4",
        compactMode ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      )}>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 w-28 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Summary Stats */}
      {!compactMode && (
        <Card className="animate-pulse">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="h-4 w-24 bg-muted rounded mx-auto" />
                  <div className="h-6 w-20 bg-muted rounded mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Holdings Table Skeleton
export const HoldingsTableSkeleton: React.FC<{
  className?: string;
  compactMode?: boolean;
  rowCount?: number;
}> = ({ className, compactMode = false, rowCount = 5 }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 bg-muted rounded animate-pulse" />
            <div className="h-9 w-9 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-10 flex-1 bg-muted rounded animate-pulse" />
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>

        {/* Table skeleton */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/30 px-6 py-3">
            <div className="grid grid-cols-6 gap-4">
              {[...Array(compactMode ? 6 : 7)].map((_, index) => (
                <div key={index} className="h-4 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          </div>
          
          <div className="divide-y divide-border">
            {[...Array(rowCount)].map((_, index) => (
              <div key={index} className="px-6 py-4">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <div className="space-y-1">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    {!compactMode && (
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    )}
                  </div>
                  <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  {!compactMode && (
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-10 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="flex items-center gap-1">
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Portfolio Analytics Skeleton
export const PortfolioAnalyticsSkeleton: React.FC<{
  className?: string;
  compactMode?: boolean;
}> = ({ className, compactMode = false }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        </div>
        {!compactMode && (
          <div className="h-9 w-32 bg-muted rounded animate-pulse" />
        )}
      </div>

      {/* Performance metrics grid */}
      <div className={cn(
        "grid gap-4",
        compactMode ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-20 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-6 w-16 bg-muted rounded" />
                <div className="h-3 w-12 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and visualizations */}
      {!compactMode && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Sector allocation chart */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-5 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>

          {/* Performance chart */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-5 w-36 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk metrics */}
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 w-24 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// News and Alerts Skeleton
export const NewsAndAlertsSkeleton: React.FC<{
  className?: string;
  compactMode?: boolean;
}> = ({ className, compactMode = false }) => {
  return (
    <div className={cn("grid gap-6", compactMode ? "lg:grid-cols-1" : "lg:grid-cols-2", className)}>
      {/* News section */}
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex gap-3 p-3 border rounded">
                <div className="w-12 h-12 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts section */}
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 bg-muted rounded" />
            <div className="h-8 w-24 bg-muted rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-2 border rounded">
                <div className="w-8 h-8 bg-muted rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-2/3 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
                <div className="w-6 h-6 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Complete Portfolio Page Skeleton
export const PortfolioPageSkeleton: React.FC<{
  className?: string;
  compactMode?: boolean;
  showAnalytics?: boolean;
  showNews?: boolean;
}> = ({ 
  className, 
  compactMode = false, 
  showAnalytics = true, 
  showNews = true 
}) => {
  return (
    <div className={cn("space-y-8 p-6", className)}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
          <div className="h-9 w-20 bg-muted rounded animate-pulse" />
          <div className="h-9 w-9 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Portfolio summary */}
      <PortfolioSummarySkeleton compactMode={compactMode} />

      {/* Holdings table */}
      <HoldingsTableSkeleton compactMode={compactMode} />

      {/* Analytics section */}
      {showAnalytics && (
        <PortfolioAnalyticsSkeleton compactMode={compactMode} />
      )}

      {/* News and alerts */}
      {showNews && (
        <NewsAndAlertsSkeleton compactMode={compactMode} />
      )}
    </div>
  );
};

// Export all skeleton components
export default {
  PortfolioSummarySkeleton,
  HoldingsTableSkeleton,
  PortfolioAnalyticsSkeleton,
  NewsAndAlertsSkeleton,
  PortfolioPageSkeleton,
}; 