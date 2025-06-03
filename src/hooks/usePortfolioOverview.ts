import { useState, useEffect, useCallback, useMemo } from "react";
import { PortfolioOverviewData } from "../types/widget-data";
import { apiClient } from "../services/api";
import { formatCurrency, formatChange } from "../utils/common/format";

interface UsePortfolioOverviewOptions {
  widgetId: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
}

interface FormattedPortfolioData {
  portfolioValue: string;
  dayChange: string;
  dayChangeIsPositive: boolean;
  overallGain: string;
  overallGainIsPositive: boolean;
  assetCount: number;
  alertsCount: number;
  lastUpdated: string | Date;
}

export const usePortfolioOverview = ({
  widgetId,
  refreshInterval = 60000,
  autoRefresh = true,
}: UsePortfolioOverviewOptions) => {
  const [data, setData] = useState<PortfolioOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<PortfolioOverviewData>(
        "/api/portfolio/overview",
      );
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching portfolio overview:`, err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch portfolio data",
      );
    } finally {
      setIsLoading(false);
    }
  }, [widgetId]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    fetchData();

    const intervalId = setInterval(fetchData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchData, refreshInterval, autoRefresh]);

  // Memoize formatted values
  const formattedData = useMemo<FormattedPortfolioData | null>(() => {
    if (!data) return null;

    const dayChange = formatChange(data.dayChange, data.dayChangePercent, {
      showSign: true,
      showPercentage: true,
    });

    const overallGain = formatChange(
      data.overallGain,
      data.overallGainPercent,
      { showSign: true, showPercentage: true },
    );

    return {
      portfolioValue: formatCurrency(data.portfolioValue, { currency: "USD" }),
      dayChange: dayChange.formattedValue,
      dayChangeIsPositive: dayChange.isPositive,
      overallGain: overallGain.formattedValue,
      overallGainIsPositive: overallGain.isPositive,
      assetCount: data.assetCount,
      alertsCount: data.alertsCount,
      lastUpdated: data.lastUpdated,
    };
  }, [data]);

  return {
    data,
    formattedData,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
};

export default usePortfolioOverview;
