/**
 * Portfolio Chart Widget
 * Displays portfolio performance chart over time using Recharts
 */

import React, { useMemo, useState } from 'react';
import { TrendingUp, Calendar, BarChart3, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { usePortfolio } from '../../hooks/usePortfolio';
import { cn } from '../../utils/cn';

interface PortfolioChartWidgetProps {
  widgetId: string;
  className?: string;
  showHeader?: boolean;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

interface ChartDataPoint {
  date: string;
  value: number;
  change: number;
  changePercent: number;
}

const PortfolioChartWidget: React.FC<PortfolioChartWidgetProps> = ({
  widgetId,
  className,
  showHeader = true,
}) => {
  const { portfolio, isLoading, error } = usePortfolio();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: '1Y', value: '1Y' },
    { label: 'ALL', value: 'ALL' },
  ];

  // Generate mock chart data based on selected range
  const chartData = useMemo((): ChartDataPoint[] => {
    const baseValue = 100000;
    const dataPoints: ChartDataPoint[] = [];

    let days: number;
    switch (selectedRange) {
      case '1D':
        days = 1;
        break;
      case '1W':
        days = 7;
        break;
      case '1M':
        days = 30;
        break;
      case '3M':
        days = 90;
        break;
      case '6M':
        days = 180;
        break;
      case '1Y':
        days = 365;
        break;
      case 'ALL':
        days = 730;
        break;
      default:
        days = 30;
    }

    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));

      // Generate realistic portfolio growth with some volatility
      const trend = 0.08 / 365; // 8% annual growth
      const volatility = 0.15 / Math.sqrt(365); // 15% annual volatility
      const randomFactor = (Math.random() - 0.5) * volatility;

      const value = baseValue * Math.exp((trend + randomFactor) * i);
      const previousValue = i > 0 ? dataPoints[i - 1].value : baseValue;
      const change = value - previousValue;
      const changePercent = (change / previousValue) * 100;

      dataPoints.push({
        date:
          selectedRange === '1D'
            ? date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
        value: Math.round(value),
        change: Math.round(change),
        changePercent: Number(changePercent.toFixed(2)),
      });
    }

    return dataPoints;
  }, [selectedRange]);

  // Calculate overall performance for the selected period
  const performance = useMemo(() => {
    if (chartData.length < 2)
      return { change: 0, changePercent: 0, isPositive: true };

    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;
    const change = lastValue - firstValue;
    const changePercent = (change / firstValue) * 100;

    return {
      change: Math.round(change),
      changePercent: Number(changePercent.toFixed(2)),
      isPositive: change >= 0,
    };
  }, [chartData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Value:{' '}
            <span className="font-semibold">
              ${data.value.toLocaleString()}
            </span>
          </p>
          <p
            className={cn(
              'text-sm',
              data.changePercent >= 0 ? 'text-green-600' : 'text-red-600',
            )}
          >
            {data.changePercent >= 0 ? '+' : ''}
            {data.changePercent}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className={cn('h-full', className)}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Portfolio Chart
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="h-48">
          <div className="animate-pulse h-full bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('h-full', className)}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Portfolio Chart
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Unable to load chart data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Portfolio Chart
              </CardTitle>
              <CardDescription className="text-xs">
                Performance over {selectedRange}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('area')}
                className="h-6 px-2 text-xs"
              >
                Area
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-6 px-2 text-xs"
              >
                Line
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="flex-1 space-y-4">
        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-lg font-bold">
              ${chartData[chartData.length - 1]?.value.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-muted-foreground">Current Value</p>
          </div>
          <Badge
            variant={performance.isPositive ? 'default' : 'destructive'}
            className="text-xs"
          >
            {performance.isPositive ? '+' : ''}$
            {Math.abs(performance.change).toLocaleString()}(
            {performance.isPositive ? '+' : ''}
            {performance.changePercent}%)
          </Badge>
        </motion.div>

        {/* Time Range Selector */}
        <div className="flex space-x-1 overflow-x-auto">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRange(range.value)}
              className="h-6 px-2 text-xs whitespace-nowrap"
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 min-h-0"
        >
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="portfolioGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={performance.isPositive ? '#10b981' : '#ef4444'}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={performance.isPositive ? '#10b981' : '#ef4444'}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={performance.isPositive ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={performance.isPositive ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default PortfolioChartWidget;
