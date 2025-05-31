/**
 * Widget Placeholder Component
 * Renders the appropriate widget component based on widget type
 */

import React, { Suspense, lazy } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  Eye, 
  BarChart3, 
  Brain, 
  ArrowLeftRight, 
  Activity, 
  Bell, 
  Newspaper, 
  Building2, 
  Calendar,
  X,
  Settings,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { WidgetType, WidgetInstance } from '../../types/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../utils/tailwind';

// Lazy load individual widget components
const PortfolioOverviewWidget = lazy(() => import('./PortfolioOverview'));
const PortfolioChartWidget = lazy(() => import('./PortfolioChartWidget'));
const WatchlistWidget = lazy(() => import('./WatchlistWidget'));
const AIInsightsWidget = lazy(() => import('./AIInsightsWidget'));

interface WidgetPlaceholderProps {
  widget: WidgetInstance;
  isEditMode: boolean;
  onRemove?: (widgetId: string) => void;
  onSettings?: (widgetId: string) => void;
  className?: string;
  data?: any;
}

const WIDGET_ICONS: Record<WidgetType, React.ComponentType<any>> = {
  'portfolio-overview': PieChart,
  'portfolio-chart': TrendingUp,
  'watchlist': Eye,
  'market-summary': BarChart3,
  'ai-insights': Brain,
  'recent-transactions': ArrowLeftRight,
  'performance-metrics': Activity,
  'alerts': Bell,
  'news-feed': Newspaper,
  'sector-performance': Building2,
  'top-movers': TrendingUp,
  'economic-calendar': Calendar,
};

const WIDGET_COLORS: Record<WidgetType, string> = {
  'portfolio-overview': 'from-blue-500 to-blue-600',
  'portfolio-chart': 'from-green-500 to-green-600',
  'watchlist': 'from-purple-500 to-purple-600',
  'market-summary': 'from-orange-500 to-orange-600',
  'ai-insights': 'from-pink-500 to-pink-600',
  'recent-transactions': 'from-indigo-500 to-indigo-600',
  'performance-metrics': 'from-teal-500 to-teal-600',
  'alerts': 'from-red-500 to-red-600',
  'news-feed': 'from-yellow-500 to-yellow-600',
  'sector-performance': 'from-cyan-500 to-cyan-600',
  'top-movers': 'from-emerald-500 to-emerald-600',
  'economic-calendar': 'from-violet-500 to-violet-600',
};

const WIDGET_TITLES: Record<WidgetType, string> = {
  'portfolio-overview': 'Portfolio Overview',
  'portfolio-chart': 'Portfolio Chart',
  'watchlist': 'Watchlist',
  'market-summary': 'Market Summary',
  'ai-insights': 'AI Insights',
  'recent-transactions': 'Recent Transactions',
  'performance-metrics': 'Performance Metrics',
  'alerts': 'Alerts',
  'news-feed': 'News Feed',
  'sector-performance': 'Sector Performance',
  'top-movers': 'Top Movers',
  'economic-calendar': 'Economic Calendar',
};

// Loading component for Suspense fallback
const WidgetLoadingFallback: React.FC<{ widget: WidgetInstance; showHeader?: boolean }> = ({ 
  widget, 
  showHeader = true 
}) => {
  const IconComponent = WIDGET_ICONS[widget.type];
  const colorClass = WIDGET_COLORS[widget.type];

  return (
    <Card className="h-full">
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <IconComponent className="h-4 w-4 mr-2" />
            {WIDGET_TITLES[widget.type]}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex items-center justify-center h-32">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Loading widget...</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Fallback component for unsupported widget types
const UnsupportedWidgetFallback: React.FC<{ widget: WidgetInstance; showHeader?: boolean }> = ({ 
  widget, 
  showHeader = true 
}) => {
  const IconComponent = WIDGET_ICONS[widget.type];
  const colorClass = WIDGET_COLORS[widget.type];

  return (
    <Card className="h-full">
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <div className={cn("p-1.5 rounded-md bg-gradient-to-r", colorClass)}>
              <IconComponent className="h-4 w-4 text-white" />
            </div>
            <span className="ml-2">{WIDGET_TITLES[widget.type]}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {widget.type} widget
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="flex flex-col items-center justify-center h-full text-center space-y-2">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {WIDGET_TITLES[widget.type]} Widget
        </p>
        <p className="text-xs text-muted-foreground">
          Widget ID: {widget.id}
        </p>
        <Badge variant="outline" className="text-xs">
          {widget.type}
        </Badge>
      </CardContent>
    </Card>
  );
};

const WidgetPlaceholderInternal: React.FC<WidgetPlaceholderProps> = ({
  widget,
  isEditMode,
  onRemove,
  onSettings,
  className,
  data,
}) => {
  // TEMPORARY: Render all widgets as fallback components to test rendering
  // This will help us identify if the issue is with lazy loading or grid layout
  console.log(`🎯 Rendering widget: ${widget.type} (ID: ${widget.id})`);
  
  const commonProps = {
    widgetId: widget.id,
    className: "h-full",
    showHeader: !isEditMode, // Hide headers in edit mode to save space
  };

  // For debugging: render all widgets as simple fallback components
  return (
    <motion.div
      layout
      className={cn("h-full", className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <UnsupportedWidgetFallback widget={widget} showHeader={commonProps.showHeader} />
    </motion.div>
  );

  // ORIGINAL CODE (commented out for debugging):
  /*
  // Render the appropriate widget component based on type
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'portfolio-overview':
        return (
          <Suspense fallback={<WidgetLoadingFallback widget={widget} showHeader={commonProps.showHeader} />}>
            <PortfolioOverviewWidget {...commonProps} />
          </Suspense>
        );

      case 'portfolio-chart':
        return (
          <Suspense fallback={<WidgetLoadingFallback widget={widget} showHeader={commonProps.showHeader} />}>
            <PortfolioChartWidget {...commonProps} />
          </Suspense>
        );

      case 'watchlist':
        return (
          <Suspense fallback={<WidgetLoadingFallback widget={widget} showHeader={commonProps.showHeader} />}>
            <WatchlistWidget {...commonProps} />
          </Suspense>
        );

      case 'ai-insights':
        return (
          <Suspense fallback={<WidgetLoadingFallback widget={widget} showHeader={commonProps.showHeader} />}>
            <AIInsightsWidget {...commonProps} />
          </Suspense>
        );

      // For widgets that don't have individual components yet, show fallback
      case 'market-summary':
      case 'recent-transactions':
      case 'performance-metrics':
      case 'alerts':
      case 'news-feed':
      case 'sector-performance':
      case 'top-movers':
      case 'economic-calendar':
      default:
        return <UnsupportedWidgetFallback widget={widget} showHeader={commonProps.showHeader} />;
    }
  };

  return (
    <motion.div
      layout
      className={cn("h-full", className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      {renderWidgetContent()}
    </motion.div>
  );
  */
};

export default React.memo(WidgetPlaceholderInternal); 