/**
 * MarketSummary Widget
 * Displays key market indices and their performance.
 * Part of Story 2.2: Customizable Widget System
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WidgetComponentProps } from '../../types/dashboard';
import { MarketSummaryData, MarketIndexData } from '../../types/widget-data';
import { useTheme } from '../../contexts/ThemeContext';
import { apiClient } from '../../services/api';
import {
  Landmark,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../utils/cn';

const MarketSummary: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  // onConfigChange, // For future settings
}) => {
  const { isDarkMode } = useTheme();
  const [summaryData, setSummaryData] = useState<MarketSummaryData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getMarketSummaryData();
      setSummaryData(data);
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching market summary:`, err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [widgetId]);

  useEffect(() => {
    fetchData();
    // Optional: Refresh interval based on config.refreshInterval
    // const intervalId = setInterval(fetchData, config.refreshInterval || 300000); // e.g., every 5 mins
    // return () => clearInterval(intervalId);
  }, [fetchData, config.refreshInterval]);

  const renderIndexCard = (index: MarketIndexData) => (
    <div
      key={index.id}
      className="p-3 rounded-lg bg-card-foreground/5 dark:bg-card-foreground/10 flex-1 min-w-[150px]"
    >
      <p
        className="text-sm font-medium text-primary truncate"
        title={index.name}
      >
        {index.shortName || index.name}
      </p>
      <p className="text-lg font-bold text-foreground">
        {index.value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
      <div
        className={cn(
          'text-xs flex items-center',
          index.change >= 0 ? 'text-success-fg' : 'text-danger-fg',
        )}
      >
        {index.change >= 0 ? (
          <ArrowUpRight className="inline h-3.5 w-3.5 mr-0.5" />
        ) : (
          <ArrowDownRight className="inline h-3.5 w-3.5 mr-0.5" />
        )}
        <span>
          {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
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
              <Landmark className="h-4 w-4 mr-2 text-primary" />
              {config.title || 'Market Summary'}
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading market data...
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
              {config.title || 'Market Summary'}
            </CardTitle>
            <button onClick={fetchData} title="Retry loading market data">
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

  if (!summaryData || summaryData.majorIndices.length === 0) {
    return (
      <Card className={cn('h-full flex flex-col', config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <Landmark className="h-4 w-4 mr-2 text-primary" />
              {config.title || 'Market Summary'}
            </CardTitle>
            <button onClick={fetchData} title="Reload market data">
              <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          No market data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full flex flex-col', config.className)}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center">
            <Landmark className="h-4 w-4 mr-2 text-primary" />
            {config.title || 'Market Summary'}
          </CardTitle>
          <button onClick={fetchData} title="Refresh market data">
            <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryData.majorIndices.map(renderIndexCard)}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-right">
          Last updated: {new Date(summaryData.lastUpdated).toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default MarketSummary;
