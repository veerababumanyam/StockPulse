/**
 * PerformanceMetrics Widget
 * Displays key performance indicators for the portfolio.
 * Part of Story 2.2: Customizable Widget System
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WidgetComponentProps } from '../../types/dashboard';
import {
  PerformanceMetricsData,
  PerformanceMetricItem,
} from '../../types/widget-data';
import { useTheme } from '../../contexts/ThemeContext';
import { apiClient } from '../../services/api';
import {
  TrendingUp,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'; // Assuming tooltip component
import { cn } from '../../utils/cn';

const PerformanceMetrics: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  // onConfigChange, // For future settings like selecting metrics to display
}) => {
  const { isDarkMode } = useTheme();
  const [metricsData, setMetricsData] = useState<PerformanceMetricsData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const portfolioId = config.config?.portfolioId || 'default-portfolio';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getPerformanceMetricsData(portfolioId);
      if (response.success && response.data) {
        setMetricsData(response.data);
      } else {
        setError(response.message || 'Failed to fetch performance metrics.');
      }
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching metrics:`, err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, portfolioId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-3.5 w-3.5 text-success-fg" />;
      case 'down':
        return <ArrowDown className="h-3.5 w-3.5 text-danger-fg" />;
      case 'neutral':
        return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const renderMetricItem = (item: PerformanceMetricItem) => (
    <div
      key={item.id}
      className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-b-0"
    >
      <div className="flex items-center">
        <span className="text-sm text-foreground">{item.label}</span>
        {item.tooltip && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 ml-1.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{item.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {item.period && (
          <span className="text-xs text-muted-foreground ml-1.5">
            ({item.period})
          </span>
        )}
      </div>
      <div className="flex items-center">
        {renderTrendIcon(item.trend)}
        <span className="text-sm font-semibold text-foreground ml-1.5">
          {item.value}
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className={cn('h-full flex flex-col', config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-primary" />
              {config.title || 'Performance Metrics'}
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading performance metrics...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('h-full flex flex-col', config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center text-danger-fg">
              <AlertCircle className="h-4 w-4 mr-2" />
              {config.title || 'Performance Metrics'}
            </CardTitle>
            <button onClick={fetchData} title="Retry loading metrics">
              <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-danger-fg">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  if (!metricsData || metricsData.metrics.length === 0) {
    return (
      <Card className={cn('h-full flex flex-col', config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-primary" />
              {config.title || 'Performance Metrics'}
            </CardTitle>
            <button onClick={fetchData} title="Reload metrics">
              <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          No performance metrics available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full flex flex-col', config.className)}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            {config.title || 'Performance Metrics'}
          </CardTitle>
          <button onClick={fetchData} title="Refresh metrics">
            <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </button>
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-0.5">
          Metrics for portfolio {metricsData.portfolioId}, as of{' '}
          {new Date(metricsData.asOfDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-3">
        {metricsData.metrics.map(renderMetricItem)}
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
