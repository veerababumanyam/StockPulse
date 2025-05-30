/**
 * Portfolio Summary Card Component
 * Reusable card component for displaying portfolio metrics with animations and accessibility
 */
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Activity,
  Wallet,
  Target,
  TrendingUp as Profit,
} from "lucide-react";
import { PortfolioSummary } from "../../types/portfolio";
import {
  formatCurrency,
  formatPercentage,
} from "../../utils/portfolioCalculations";
import ValueChangeDisplay from "../ui/ValueChangeDisplay";
import { cn } from "../../utils/tailwind";

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary;
  isLoading?: boolean;
  className?: string;
  compactMode?: boolean;
  showAnimations?: boolean;
}

// Individual metric card component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  changePercentage?: number;
  icon: React.ReactNode;
  subtitle?: string;
  color?: "default" | "green" | "red" | "blue";
  isLoading?: boolean;
  currency?: boolean;
  compactMode?: boolean;
}> = React.memo(
  ({
    title,
    value,
    change,
    changePercentage,
    icon,
    subtitle,
    color = "default",
    isLoading,
    currency = false,
    compactMode = false,
  }) => {
    if (isLoading) {
      return (
        <Card className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-4 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-8 w-32 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      );
    }

    const colorClasses = {
      default: "text-muted-foreground",
      green: "text-green-600 dark:text-green-400",
      red: "text-red-600 dark:text-red-400",
      blue: "text-blue-600 dark:text-blue-400",
    };

    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={cn("h-4 w-4", colorClasses[color])}>{icon}</div>
        </CardHeader>
        <CardContent>
          {change !== undefined || changePercentage !== undefined ? (
            <ValueChangeDisplay
              value={
                typeof value === "string"
                  ? parseFloat(value.replace(/[^0-9.-]/g, ""))
                  : value
              }
              change={change}
              changePercentage={changePercentage}
              currency={currency}
              size={compactMode ? "sm" : "lg"}
              aria-label={`${title}: ${value}${change !== undefined ? `, change: ${change}` : ""}`}
            />
          ) : (
            <div className="space-y-1">
              <div
                className={cn(
                  "font-bold",
                  compactMode ? "text-lg" : "text-2xl",
                )}
              >
                {typeof value === "number" && currency
                  ? formatCurrency(value)
                  : value}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

MetricCard.displayName = "MetricCard";

export const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> =
  React.memo(
    ({
      summary,
      isLoading = false,
      className,
      compactMode = false,
      showAnimations = true,
    }) => {
      // Calculate derived metrics
      const profitabilityRate =
        summary.openPositions > 0
          ? (summary.profitablePositions / summary.openPositions) * 100
          : 0;

      const metrics = [
        {
          title: "Total Value",
          value: summary.totalValue,
          change: summary.dayChange,
          changePercentage: summary.dayChangePercentage,
          icon: <DollarSign className="h-4 w-4" />,
          currency: true,
          color: "default" as const,
        },
        {
          title: "Total Gain/Loss",
          value: summary.totalGainLoss,
          changePercentage: summary.totalGainLossPercentage,
          icon:
            summary.totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            ),
          currency: true,
          color: summary.totalGainLoss >= 0 ? "green" : ("red" as const),
        },
        {
          title: "Cash Balance",
          value: summary.cashBalance,
          icon: <Wallet className="h-4 w-4" />,
          subtitle: `${summary.cashPercentage.toFixed(1)}% of portfolio`,
          currency: true,
          color: "blue" as const,
        },
        {
          title: "Positions",
          value: `${summary.profitablePositions}/${summary.openPositions}`,
          icon: <PieChart className="h-4 w-4" />,
          subtitle: `${profitabilityRate.toFixed(1)}% profitable`,
          color:
            profitabilityRate >= 60
              ? "green"
              : profitabilityRate >= 40
                ? "default"
                : ("red" as const),
        },
      ];

      if (isLoading) {
        return (
          <div
            className={cn(
              "grid gap-4",
              compactMode
                ? "grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
              className,
            )}
          >
            {metrics.map((_, index) => (
              <MetricCard
                key={index}
                title=""
                value=""
                icon={<div />}
                isLoading={true}
                compactMode={compactMode}
              />
            ))}
          </div>
        );
      }

      return (
        <div className={cn("space-y-4", className)}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Portfolio Overview
              </h2>
              <p className="text-muted-foreground">
                Track your investment performance and key metrics
              </p>
            </div>

            {/* Portfolio Performance Badge */}
            <Badge
              variant={
                summary.totalGainLossPercentage >= 0 ? "default" : "destructive"
              }
              className="text-sm px-3 py-1"
            >
              <Activity className="w-4 h-4 mr-1" />
              {summary.totalGainLossPercentage >= 0 ? "+" : ""}
              {summary.totalGainLossPercentage.toFixed(2)}% Total Return
            </Badge>
          </div>

          {/* Metrics Grid */}
          <div
            className={cn(
              "grid gap-4 transition-all duration-300",
              compactMode
                ? "grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
              showAnimations && "animate-in slide-in-from-bottom-4",
            )}
            role="grid"
            aria-label="Portfolio summary metrics"
          >
            {metrics.map((metric, index) => (
              <div
                key={metric.title}
                role="gridcell"
                style={{
                  animationDelay: showAnimations ? `${index * 100}ms` : "0ms",
                }}
              >
                <MetricCard
                  title={metric.title}
                  value={metric.value}
                  change={metric.change}
                  changePercentage={metric.changePercentage}
                  icon={metric.icon}
                  subtitle={metric.subtitle}
                  color={metric.color}
                  currency={metric.currency}
                  compactMode={compactMode}
                />
              </div>
            ))}
          </div>

          {/* Additional Summary Stats */}
          {!compactMode && (
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-muted-foreground">
                      Total Invested
                    </div>
                    <div className="text-lg font-bold">
                      {formatCurrency(summary.totalInvested)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-muted-foreground">
                      Portfolio Return
                    </div>
                    <div
                      className={cn(
                        "text-lg font-bold",
                        summary.portfolioReturn >= 0
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {summary.portfolioReturn >= 0 ? "+" : ""}
                      {summary.portfolioReturn.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-muted-foreground">
                      Day Performance
                    </div>
                    <div
                      className={cn(
                        "text-lg font-bold",
                        summary.dayChangePercentage >= 0
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {summary.dayChangePercentage >= 0 ? "+" : ""}
                      {summary.dayChangePercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    },
  );

PortfolioSummaryCard.displayName = "PortfolioSummaryCard";

export default PortfolioSummaryCard;
