/**
 * Widget Preview Components Index
 * Exports all preview components with fallback support
 */

import React from 'react';
import { WidgetType } from '../../../types/dashboard';

// Import existing previews
import PortfolioOverviewPreview from './PortfolioOverviewPreview';
import MarketSummaryPreview from './MarketSummaryPreview';

// Generic fallback preview component
const GenericPreview: React.FC<{ 
  title: string; 
  icon: React.ComponentType<any>; 
  isPreview?: boolean 
}> = ({ title, icon: Icon, isPreview = true }) => {
  return (
    <div className="h-full w-full p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center space-x-2 mb-3">
        <Icon className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="space-y-2">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">Preview coming soon</p>
      </div>
    </div>
  );
};

// Specific preview components (we'll create these as needed)
const PortfolioChartPreview = () => (
  <GenericPreview 
    title="Portfolio Chart" 
    icon={({ className }: any) => <div className={className}>📈</div>} 
  />
);

const WatchlistPreview = () => (
  <GenericPreview 
    title="Watchlist" 
    icon={({ className }: any) => <div className={className}>📋</div>} 
  />
);

const AIInsightsPreview = () => (
  <GenericPreview 
    title="AI Insights" 
    icon={({ className }: any) => <div className={className}>🧠</div>} 
  />
);

const RecentTransactionsPreview = () => (
  <GenericPreview 
    title="Recent Transactions" 
    icon={({ className }: any) => <div className={className}>🕐</div>} 
  />
);

const PerformanceMetricsPreview = () => (
  <GenericPreview 
    title="Performance Metrics" 
    icon={({ className }: any) => <div className={className}>📊</div>} 
  />
);

const AlertsPreview = () => (
  <GenericPreview 
    title="Alerts" 
    icon={({ className }: any) => <div className={className}>🚨</div>} 
  />
);

const NewsFeedPreview = () => (
  <GenericPreview 
    title="News Feed" 
    icon={({ className }: any) => <div className={className}>📰</div>} 
  />
);

const SectorPerformancePreview = () => (
  <GenericPreview 
    title="Sector Performance" 
    icon={({ className }: any) => <div className={className}>🏢</div>} 
  />
);

const TopMoversPreview = () => (
  <GenericPreview 
    title="Top Movers" 
    icon={({ className }: any) => <div className={className}>📈</div>} 
  />
);

const EconomicCalendarPreview = () => (
  <GenericPreview 
    title="Economic Calendar" 
    icon={({ className }: any) => <div className={className}>📅</div>} 
  />
);

// Export all preview components
export {
  PortfolioOverviewPreview,
  PortfolioChartPreview,
  WatchlistPreview,
  MarketSummaryPreview,
  AIInsightsPreview,
  RecentTransactionsPreview,
  PerformanceMetricsPreview,
  AlertsPreview,
  NewsFeedPreview,
  SectorPerformancePreview,
  TopMoversPreview,
  EconomicCalendarPreview,
};

// Preview component map for easy access
export const PREVIEW_COMPONENTS: Record<WidgetType, React.ComponentType<any>> = {
  'portfolio-overview': PortfolioOverviewPreview,
  'portfolio-chart': PortfolioChartPreview,
  'watchlist': WatchlistPreview,
  'market-summary': MarketSummaryPreview,
  'ai-insights': AIInsightsPreview,
  'recent-transactions': RecentTransactionsPreview,
  'performance-metrics': PerformanceMetricsPreview,
  'alerts': AlertsPreview,
  'news-feed': NewsFeedPreview,
  'sector-performance': SectorPerformancePreview,
  'top-movers': TopMoversPreview,
  'economic-calendar': EconomicCalendarPreview,
};

export default PREVIEW_COMPONENTS; 