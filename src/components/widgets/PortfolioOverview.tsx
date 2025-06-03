/**
 * PortfolioOverview Widget
 * Displays portfolio summary and key metrics with improved architecture and performance
 * Part of Story 2.2: Customizable Widget System
 */
"use client";

import React, { useCallback } from "react";
import { WidgetComponentProps } from "../../types/dashboard";
import { PortfolioOverviewData } from "../../types/widget-data";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../utils/cn";
import { WidgetErrorBoundary } from "../common/ErrorBoundary";
import { MetricCard, MetricItem } from "./MetricCard";
import { usePortfolioOverview } from "../../hooks/usePortfolioOverview";
import { formatDate } from "../../utils/common/format";

const PortfolioOverviewContent: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  onConfigChange,
}) => {
  const { isDarkMode } = useTheme();

  const { data, formattedData, isLoading, error, refetch } =
    usePortfolioOverview({
      widgetId,
      refreshInterval: config.refreshInterval || 60000,
      autoRefresh: true,
    });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-primary" />
              {config.title || "Portfolio Overview"}
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
              {config.title || "Portfolio Overview"}
            </CardTitle>
            <button onClick={refetch} title="Retry loading data">
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

  if (!data || !formattedData) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-primary" />
              {config.title || "Portfolio Overview"}
            </CardTitle>
            <button onClick={refetch} title="Reload data">
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
            {config.title || "Portfolio Overview"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <Badge variant="outline" className="text-xs font-normal">
                Edit
              </Badge>
            )}
            <button
              onClick={handleRefresh}
              title="Refresh data"
              className="p-1 rounded-full hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricItem
            value={formattedData.portfolioValue}
            label="Total Value"
            icon={Briefcase}
            className="col-span-2"
          />

          <MetricItem
            value={formattedData.dayChange}
            label="Day's Change"
            icon={TrendingUp}
            isPositive={formattedData.dayChangeIsPositive}
          />

          <MetricItem
            value={formattedData.overallGain}
            label="Overall Gain/Loss"
            icon={DollarSign}
            isPositive={formattedData.overallGainIsPositive}
          />

          <MetricItem
            value={data.assetCount}
            label="Active Assets"
            icon={Briefcase}
          />

          {data.alertsCount > 0 && (
            <MetricItem
              value={data.alertsCount}
              label="Active Alerts"
              icon={AlertTriangle}
              variant="warning"
              className="col-span-2"
            />
          )}
        </div>

        <div className="mt-4 pt-2 border-t border-border-subtle flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            Last updated:{" "}
            {formatDate(data.lastUpdated, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// Wrap with ErrorBoundary
export const PortfolioOverview: React.FC<WidgetComponentProps> = (props) => (
  <WidgetErrorBoundary widgetId={props.widgetId}>
    <PortfolioOverviewContent {...props} />
  </WidgetErrorBoundary>
);

export default PortfolioOverview;
