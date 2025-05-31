/**
 * PortfolioOverview Widget
 * Displays portfolio summary and key metrics
 * Part of Story 2.2: Customizable Widget System
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WidgetComponentProps } from '../../types/dashboard';
import { PortfolioOverviewData } from '../../types/widget-data'; // Import data type
import { useTheme } from '../../contexts/ThemeContext';
import { apiClient } from '../../services/api'; // Import apiClient
import { Briefcase, TrendingUp, DollarSign, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'; // Assuming these exist from previous UI work
import { Badge } from '../ui/badge';
import { cn } from '../../utils/tailwind'; // Assuming this utility exists

const PortfolioOverview: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  onConfigChange, // Prop for future widget-specific settings
}) => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState<PortfolioOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get portfolio overview data directly (no parameters needed for default)
      const data = await apiClient.getPortfolioOverview();
      setData(data);
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching data:`, err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [widgetId]);

  useEffect(() => {
    fetchData();
    // Optional: setup refresh interval if needed
    // const intervalId = setInterval(fetchData, config.refreshInterval || 60000);
    // return () => clearInterval(intervalId);
  }, [fetchData, config.refreshInterval]);

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface-subtle)',
    padding: 'var(--spacing-md)',
    borderRadius: 'var(--border-radius-md)',
    border: `1px solid var(--color-border-subtle)`,
    flex: 1,
    minWidth: '180px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--spacing-xxs)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
  };

  const changePositiveStyle: React.CSSProperties = {
    color: 'var(--color-success-fg)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
  };

  const changeNegativeStyle: React.CSSProperties = {
    color: 'var(--color-danger-fg)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
  };
  
  const containerStyle: React.CSSProperties = {
    padding: 'var(--spacing-sm)', 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    gap: 'var(--spacing-md)'
  };

  if (isLoading) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
           <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-primary" />
                {config.title || 'Portfolio Overview'}
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading data...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
         <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center text-danger-fg">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {config.title || 'Portfolio Overview'}
                </CardTitle>
                <button onClick={fetchData} title="Retry loading data">
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

  if (!data) {
    return (
        <Card className={cn("h-full flex flex-col", config.className)}>
            <CardHeader className="pb-2 pt-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-primary" />
                        {config.title || 'Portfolio Overview'}
                    </CardTitle>
                     <button onClick={fetchData} title="Reload data">
                        <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
            No data available.
            </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", config.className)}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-primary" />
            {config.title || 'Portfolio Overview'}
          </CardTitle>
          {isEditMode && (
            <Badge variant="outline" className="text-xs font-normal">Edit</Badge>
          )}
           <button onClick={fetchData} title="Refresh data">
                <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div style={containerStyle} className="grid grid-cols-2 gap-x-var(--spacing-md) gap-y-var(--spacing-sm)">
          <div style={cardStyle} className="col-span-2 sm:col-span-1">
            <div style={valueStyle}>${data.portfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div style={labelStyle}><Briefcase size={16} /> Total Value</div>
          </div>

          <div style={cardStyle} className="col-span-2 sm:col-span-1">
            <div style={data.dayChange >= 0 ? changePositiveStyle : changeNegativeStyle}>
              {data.dayChange >= 0 ? '+' : ''}${Math.abs(data.dayChange).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({data.dayChangePercent.toFixed(2)}%)
            </div>
            <div style={labelStyle}><TrendingUp size={16} /> Day's Change</div>
          </div>

          <div style={cardStyle} className="col-span-2 sm:col-span-1">
            <div style={data.overallGain >= 0 ? changePositiveStyle : changeNegativeStyle}>
              {data.overallGain >= 0 ? '+' : ''}${Math.abs(data.overallGain).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({data.overallGainPercent.toFixed(2)}%)
            </div>
            <div style={labelStyle}><DollarSign size={16} /> Overall Gain/Loss</div>
          </div>
          
          <div style={cardStyle} className="col-span-2 sm:col-span-1">
            <div style={valueStyle}>{data.assetCount}</div>
            <div style={labelStyle}>Active Assets</div>
          </div>

          {data.alertsCount > 0 && (
            <div style={{...cardStyle, backgroundColor: 'var(--color-warning-muted)'}} className="col-span-2">
              <div style={{...valueStyle, color: 'var(--color-warning-fg)'}}>{data.alertsCount}</div>
              <div style={{...labelStyle, color: 'var(--color-warning-fg)'}}><AlertTriangle size={16} /> Active Alerts</div>
            </div>
          )}
        </div>
         <p className="text-xs text-muted-foreground mt-auto pt-2 text-right">Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}</p>
      </CardContent>
    </Card>
  );
};

export default PortfolioOverview; 