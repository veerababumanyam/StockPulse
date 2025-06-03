/**
 * PortfolioChart Widget
 * Displays a chart of portfolio value over time.
 * Part of Story 2.2: Customizable Widget System
 */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { WidgetComponentProps } from "../../types/dashboard";
import {
  PortfolioChartData,
  PortfolioChartDatapoint,
} from "../../types/widget-data";
import { useTheme } from "../../contexts/ThemeContext";
import { apiClient } from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Activity, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button"; // Assuming Button component exists
import { cn } from "../../utils/cn";

const TIMEFRAME_OPTIONS: PortfolioChartData["timeframe"][] = [
  "1D",
  "1W",
  "1M",
  "3M",
  "1Y",
  "ALL",
];

const PortfolioChart: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  onConfigChange,
}) => {
  const { isDarkMode } = useTheme();
  const [chartData, setChartData] = useState<PortfolioChartData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    PortfolioChartData["timeframe"]
  >(config.config?.defaultTimeframe || "1M");

  const fetchData = useCallback(
    async (timeframe: PortfolioChartData["timeframe"]) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getPortfolioChartData(timeframe);
        setChartData(response);
      } catch (err: any) {
        console.error(`[${widgetId}] Error fetching chart data:`, err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    },
    [widgetId],
  );

  useEffect(() => {
    fetchData(selectedTimeframe);
  }, [fetchData, selectedTimeframe]);

  // Memoize processed data for Recharts to prevent unnecessary re-renders
  const processedData = useMemo(() => {
    return (
      chartData?.datapoints.map((p) => ({
        ...p,
        timestamp: new Date(p.timestamp).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      })) || []
    );
  }, [chartData]);

  const themeColors = {
    stroke: isDarkMode ? "var(--color-primary-fg)" : "var(--color-primary-fg)", // Example, adjust as per actual theme vars
    grid: isDarkMode
      ? "var(--color-border-subtle)"
      : "var(--color-border-subtle)",
    tooltipBg: isDarkMode
      ? "var(--color-surface-overlay)"
      : "var(--color-surface-overlay)",
    tooltipText: isDarkMode
      ? "var(--color-text-primary)"
      : "var(--color-text-primary)",
    referenceLine: isDarkMode
      ? "var(--color-warning-fg)"
      : "var(--color-warning-fg)",
  };

  const handleTimeframeChange = (
    timeframe: PortfolioChartData["timeframe"],
  ) => {
    setSelectedTimeframe(timeframe);
    // Persist this choice in widget config if onConfigChange is implemented
    if (onConfigChange) {
      onConfigChange(widgetId, {
        ...config,
        config: { ...config.config, defaultTimeframe: timeframe },
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <Activity className="h-4 w-4 mr-2 text-primary" />
              {config.title || "Portfolio Chart"}
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading chart data...
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
              {config.title || "Portfolio Chart"}
            </CardTitle>
            <button
              onClick={() => fetchData(selectedTimeframe)}
              title="Retry loading chart"
            >
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

  if (!chartData || chartData.datapoints.length === 0) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <Activity className="h-4 w-4 mr-2 text-primary" />
              {config.title || "Portfolio Chart"}
            </CardTitle>
            <button
              onClick={() => fetchData(selectedTimeframe)}
              title="Reload chart"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          No chart data available for {selectedTimeframe}.
        </CardContent>
      </Card>
    );
  }

  const formatYAxisTick = (value: number) => `$${(value / 1000).toFixed(0)}k`;

  return (
    <Card className={cn("h-full flex flex-col", config.className)}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center">
            <Activity className="h-4 w-4 mr-2 text-primary" />
            {config.title || "Portfolio Chart"}
          </CardTitle>
          <div className="flex items-center space-x-1">
            {TIMEFRAME_OPTIONS.map((tf) => (
              <Button
                key={tf}
                variant={selectedTimeframe === tf ? "default" : "outline"}
                size="sm"
                className="px-2 py-1 h-auto text-xs"
                onClick={() => handleTimeframeChange(tf)}
              >
                {tf}
              </Button>
            ))}
            <button
              onClick={() => fetchData(selectedTimeframe)}
              title="Refresh chart"
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 pt-2 pr-2">
        {" "}
        {/* Adjusted padding for chart */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 10, fill: themeColors.tooltipText }}
              stroke={themeColors.grid}
            />
            <YAxis
              tickFormatter={formatYAxisTick}
              tick={{ fontSize: 10, fill: themeColors.tooltipText }}
              stroke={themeColors.grid}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: themeColors.tooltipBg,
                border: `1px solid ${themeColors.grid}`,
                borderRadius: "var(--border-radius-sm)",
              }}
              labelStyle={{
                color: themeColors.tooltipText,
                fontWeight: "bold",
              }}
              itemStyle={{ color: themeColors.tooltipText }}
              formatter={(value: number) => [
                `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                "Value",
              ]}
            />
            {chartData.previousClose && selectedTimeframe === "1D" && (
              <ReferenceLine
                y={chartData.previousClose}
                label={{
                  value: "Prev Close",
                  position: "insideRight",
                  fill: themeColors.referenceLine,
                  fontSize: 10,
                }}
                stroke={themeColors.referenceLine}
                strokeDasharray="3 3"
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={themeColors.stroke}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;
