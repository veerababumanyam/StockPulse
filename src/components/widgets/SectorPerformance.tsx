/**
 * SectorPerformance Widget
 * Displays performance of different market sectors.
 * Part of Story 2.2: Customizable Widget System
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WidgetComponentProps } from '../../types/dashboard';
import {
  SectorPerformanceData,
  SectorPerformanceItem,
} from '../../types/widget-data';
import { useTheme } from '../../contexts/ThemeContext';
import { apiClient } from '../../services/api';
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'; // Assuming Select component
import { cn } from '../../utils/cn';

const TIMEFRAME_OPTIONS: SectorPerformanceData['timeframe'][] = [
  '1D',
  '1W',
  '1M',
  'YTD',
];

const SectorPerformance: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  onConfigChange,
}) => {
  const { isDarkMode } = useTheme();
  const [performanceData, setPerformanceData] =
    useState<SectorPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initialTimeframe =
    (config.config?.timeframe as SectorPerformanceData['timeframe']) || '1D';
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<SectorPerformanceData['timeframe']>(initialTimeframe);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response =
        await apiClient.getSectorPerformanceData(selectedTimeframe);
      if (response.success && response.data) {
        setPerformanceData(response.data);
      } else {
        setError(response.message || 'Failed to fetch sector performance.');
      }
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching sector performance:`, err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, selectedTimeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTimeframeChange = (
    newTimeframe: SectorPerformanceData['timeframe'],
  ) => {
    setSelectedTimeframe(newTimeframe);
    if (onConfigChange && config) {
      onConfigChange(widgetId, {
        ...config,
        config: { ...config.config, timeframe: newTimeframe },
      });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as SectorPerformanceItem;
      return (
        <div className="bg-popover text-popover-foreground p-2 rounded shadow-lg border border-border">
          <p className="font-semibold text-sm">{data.name}</p>
          <p
            className={cn(
              'text-xs',
              data.changePercent >= 0 ? 'text-success-fg' : 'text-danger-fg',
            )}
          >
            Change: {data.changePercent.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading && !performanceData) {
    return (
      <Card className={cn('h-full flex flex-col', config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-primary" />
              {config.title || 'Sector Performance'}
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading sector performance...
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
              {config.title || 'Sector Performance'}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchData}
              title="Retry loading data"
              className="h-7 w-7"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-danger-fg">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full flex flex-col', config.className)}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base font-semibold flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-primary" />
            {config.title || 'Sector Performance'}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            title="Refresh data"
            className="h-7 w-7"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
        {isEditMode && (
          <Select
            value={selectedTimeframe}
            onValueChange={(value) =>
              handleTimeframeChange(value as SectorPerformanceData['timeframe'])
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAME_OPTIONS.map((tf) => (
                <SelectItem key={tf} value={tf} className="text-xs">
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <CardDescription className="text-xs text-muted-foreground pt-1">
          Performance for {selectedTimeframe}. Last updated:{' '}
          {performanceData
            ? new Date(performanceData.lastUpdated).toLocaleTimeString()
            : 'N/A'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pr-0 pl-1 pb-2 pt-1">
        {(!performanceData || performanceData.sectors.length === 0) &&
          !isLoading && (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No sector performance data available.
            </div>
          )}
        {performanceData && performanceData.sectors.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData.sectors}
              layout="vertical"
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={
                  isDarkMode
                    ? 'var(--color-border-muted)'
                    : 'var(--color-border)'
                }
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke={
                  isDarkMode
                    ? 'var(--color-text-muted)'
                    : 'var(--color-text-secondary)'
                }
                fontSize={10}
                tickFormatter={(value) => `${value}%`}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke={
                  isDarkMode
                    ? 'var(--color-text-muted)'
                    : 'var(--color-text-secondary)'
                }
                fontSize={10}
                width={80}
                interval={0}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'var(--color-surface-hover)' }}
              />
              <Bar dataKey="changePercent" radius={[0, 4, 4, 0]}>
                {performanceData.sectors.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.changePercent >= 0
                        ? 'var(--color-success-fg)'
                        : 'var(--color-danger-fg)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SectorPerformance;
