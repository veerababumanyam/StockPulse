/**
 * Stock Detail Page - Story 2.4 Implementation
 *
 * Displays detailed information about a selected stock symbol.
 * Users navigate here by clicking on watchlist items.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Star,
  StarOff,
  RefreshCw,
  Calendar,
  DollarSign,
  BarChart3,
  Activity,
  Building,
  Globe,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useTheme } from "../hooks/useTheme";

// Services
import {
  addSymbolToWatchlist,
  removeSymbolFromWatchlist,
  getUserWatchlist,
  validateSymbol,
} from "../services/watchlistService";
import {
  webSocketService,
  connectToMarketData,
  subscribeToSymbol,
  MarketDataUpdate,
} from "../services/websocketService";

interface StockInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
  avgVolume?: number;
  peRatio?: number;
  eps?: number;
  dividend?: number;
  logoUrl?: string;
  description?: string;
  sector?: string;
  industry?: string;
  website?: string;
  employees?: number;
  lastUpdated?: string;
}

const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // State management
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  // Navigation handler
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Load stock information
  const loadStockInfo = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate symbol first
      const validation = await validateSymbol(symbol);
      if (!validation.valid) {
        setError(validation.message || "Invalid stock symbol");
        return;
      }

      // Mock stock data for demonstration
      // In production, this would call a real market data API
      const mockStockInfo: StockInfo = {
        symbol: symbol.toUpperCase(),
        name: `${symbol.toUpperCase()} Corporation`,
        price: 150.0 + Math.random() * 100,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
        dayHigh: 155.0 + Math.random() * 10,
        dayLow: 145.0 + Math.random() * 10,
        previousClose: 148.5 + Math.random() * 5,
        avgVolume: Math.floor(Math.random() * 5000000) + 2000000,
        peRatio: 15 + Math.random() * 20,
        eps: 5 + Math.random() * 10,
        dividend: Math.random() * 3,
        logoUrl: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
        description: `${symbol.toUpperCase()} Corporation is a leading technology company that develops innovative solutions for global markets.`,
        sector: "Technology",
        industry: "Software",
        website: `https://${symbol.toLowerCase()}.com`,
        employees: Math.floor(Math.random() * 100000) + 10000,
        lastUpdated: new Date().toISOString(),
      };

      setStockInfo(mockStockInfo);

      // Setup real-time updates
      await setupRealTimeUpdates(symbol);
    } catch (error: any) {
      console.error("Error loading stock info:", error);
      setError(error.message || "Failed to load stock information");
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  // Check if symbol is in watchlist
  const checkWatchlistStatus = useCallback(async () => {
    if (!symbol) return;

    try {
      const watchlistData = await getUserWatchlist();
      const isInList = watchlistData.items.some(
        (item) => item.symbol.toUpperCase() === symbol.toUpperCase(),
      );
      setIsInWatchlist(isInList);
    } catch (error) {
      console.warn("Failed to check watchlist status:", error);
    }
  }, [symbol]);

  // Setup real-time data updates
  const setupRealTimeUpdates = useCallback(async (stockSymbol: string) => {
    try {
      if (webSocketService.getConnectionStatus() === "disconnected") {
        await connectToMarketData();
      }

      subscribeToSymbol(stockSymbol, (update: MarketDataUpdate) => {
        setStockInfo((prev) => {
          if (!prev || prev.symbol !== update.symbol) return prev;

          return {
            ...prev,
            price: update.price,
            change: update.change,
            changePercent: update.changePercent,
            volume: update.volume,
            lastUpdated: update.timestamp,
          };
        });
      });

      // Subscribe to connection status
      webSocketService.onConnectionStatusChange(setConnectionStatus);
    } catch (error) {
      console.warn("Failed to setup real-time updates:", error);
    }
  }, []);

  // Handle watchlist toggle
  const handleWatchlistToggle = useCallback(async () => {
    if (!symbol) return;

    setIsWatchlistLoading(true);

    try {
      if (isInWatchlist) {
        const result = await removeSymbolFromWatchlist(symbol);
        if (result.success) {
          setIsInWatchlist(false);
        } else {
          setError(result.message);
        }
      } else {
        const result = await addSymbolToWatchlist(symbol);
        if (result.success) {
          setIsInWatchlist(true);
        } else {
          setError(result.message);
        }
      }
    } catch (error: any) {
      setError(error.message || "Failed to update watchlist");
    } finally {
      setIsWatchlistLoading(false);
    }
  }, [symbol, isInWatchlist]);

  // Initialize page
  useEffect(() => {
    if (symbol) {
      loadStockInfo();
      checkWatchlistStatus();
    }
  }, [symbol, loadStockInfo, checkWatchlistStatus]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Format percentage
  const formatPercentage = (percent: number): string => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
  };

  if (!symbol) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Invalid Stock Symbol
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No stock symbol provided in the URL
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading {symbol} details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !stockInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Stock Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Failed to load stock information"}
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={loadStockInfo}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleGoBack}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                {stockInfo.logoUrl && (
                  <img
                    src={stockInfo.logoUrl}
                    alt={stockInfo.name}
                    className="h-8 w-8 rounded mr-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {stockInfo.symbol}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stockInfo.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Real-time indicator */}
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    connectionStatus === "connected"
                      ? "bg-green-500"
                      : "bg-gray-400",
                  )}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {connectionStatus === "connected" ? "Live" : "Delayed"}
                </span>
              </div>

              {/* Watchlist toggle */}
              <button
                onClick={handleWatchlistToggle}
                disabled={isWatchlistLoading}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isInWatchlist
                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300",
                )}
              >
                {isWatchlistLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : isInWatchlist ? (
                  <Star className="h-4 w-4 mr-2 fill-current" />
                ) : (
                  <StarOff className="h-4 w-4 mr-2" />
                )}
                {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Price section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {formatCurrency(stockInfo.price)}
              </div>
              <div
                className={cn(
                  "inline-flex items-center text-lg font-medium",
                  stockInfo.change >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {stockInfo.change >= 0 ? (
                  <TrendingUp className="h-5 w-5 mr-2" />
                ) : (
                  <TrendingDown className="h-5 w-5 mr-2" />
                )}
                {formatCurrency(Math.abs(stockInfo.change))} (
                {formatPercentage(stockInfo.changePercent)})
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Last updated
              </div>
              <div className="text-sm text-gray-900 dark:text-white">
                {stockInfo.lastUpdated
                  ? new Date(stockInfo.lastUpdated).toLocaleTimeString()
                  : "Just now"}
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Volume
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(stockInfo.volume)}
                </div>
              </div>
            </div>
          </div>

          {stockInfo.marketCap && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Market Cap
                  </div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(stockInfo.marketCap)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {stockInfo.dayHigh && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-emerald-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Day High
                  </div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(stockInfo.dayHigh)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {stockInfo.dayLow && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Day Low
                  </div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(stockInfo.dayLow)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Company info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Company Information
            </h2>

            <div className="space-y-4">
              {stockInfo.description && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Description
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {stockInfo.description}
                  </div>
                </div>
              )}

              {stockInfo.sector && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Sector
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {stockInfo.sector}
                  </div>
                </div>
              )}

              {stockInfo.industry && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Industry
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {stockInfo.industry}
                  </div>
                </div>
              )}

              {stockInfo.employees && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Employees
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {stockInfo.employees.toLocaleString()}
                  </div>
                </div>
              )}

              {stockInfo.website && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Website
                  </div>
                  <a
                    href={stockInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {stockInfo.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Financial Metrics
            </h2>

            <div className="space-y-4">
              {stockInfo.previousClose && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Previous Close
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(stockInfo.previousClose)}
                  </span>
                </div>
              )}

              {stockInfo.peRatio && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    P/E Ratio
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {stockInfo.peRatio.toFixed(2)}
                  </span>
                </div>
              )}

              {stockInfo.eps && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    EPS
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(stockInfo.eps)}
                  </span>
                </div>
              )}

              {stockInfo.dividend && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Dividend
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(stockInfo.dividend)}
                  </span>
                </div>
              )}

              {stockInfo.avgVolume && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Avg Volume
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatNumber(stockInfo.avgVolume)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;
