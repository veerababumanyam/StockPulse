/**
 * Watchlist Widget
 * Displays a list of stocks the user is watching.
 * Part of Story 2.2: Customizable Widget System
 */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { WidgetComponentProps } from "../../types/dashboard";
import { WatchlistData, WatchlistItem } from "../../types/widget-data";
import { useTheme } from "../../contexts/ThemeContext";
import { apiClient } from "../../services/api";
import {
  Eye,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Search,
  Loader2,
  Wifi,
  WifiOff,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area"; // Assuming this exists
import { cn } from "../../utils/cn";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import {
  watchlistService,
  addSymbolToWatchlist,
  removeSymbolFromWatchlist,
  validateSymbol,
  getUserWatchlist,
} from "../../services/watchlistService";
import {
  webSocketService,
  connectToMarketData,
  subscribeToWatchlist,
  MarketDataUpdate,
} from "../../services/websocketService";
import { WidgetErrorBoundary } from "../common/ErrorBoundary";

const Watchlist: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  onConfigChange,
  // onRemoveWidget, // We'd get this from EnterpriseWidgetGrid if we allow direct removal
}) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [watchlistData, setWatchlistData] = useState<WatchlistData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("disconnected");
  const [addSymbolState, setAddSymbolState] = useState({
    isOpen: false,
    symbol: "",
    isLoading: false,
    isValidating: false,
  });

  // Refs for cleanup
  const wsUnsubscribeRef = useRef<(() => void) | null>(null);
  const statusUnsubscribeRef = useRef<(() => void) | null>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // In a real app, watchlistId might come from widget config or user preferences
  const currentWatchlistId = config.config?.watchlistId || "default-watchlist";

  const fetchData = useCallback(
    async (forceRefresh: boolean = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getUserWatchlist(forceRefresh);
        setWatchlistData(data);

        // Subscribe to real-time updates for current watchlist
        if (data.items.length > 0) {
          await setupRealTimeUpdates(data.items);
        }
      } catch (err: any) {
        console.error(`[${widgetId}] Error fetching watchlist:`, err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    },
    [widgetId],
  );

  // Setup real-time updates via WebSocket
  const setupRealTimeUpdates = useCallback(async (items: WatchlistItem[]) => {
    try {
      // Connect to WebSocket if not already connected
      if (webSocketService.getConnectionStatus() === "disconnected") {
        await connectToMarketData();
      }

      // Clean up existing subscription
      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current();
      }

      // Subscribe to real-time updates for watchlist symbols
      wsUnsubscribeRef.current = subscribeToWatchlist(
        items,
        handleMarketDataUpdate,
      );
    } catch (error) {
      console.warn("[Watchlist] Failed to setup real-time updates:", error);
    }
  }, []);

  // Handle real-time market data updates
  const handleMarketDataUpdate = useCallback((update: MarketDataUpdate) => {
    setWatchlistData((prevData) => {
      if (!prevData) return prevData;

      const updatedItems = prevData.items.map((item) => {
        if (item.symbol === update.symbol) {
          return {
            ...item,
            price: update.price,
            change: update.change,
            changePercent: update.changePercent,
            volume: update.volume,
          };
        }
        return item;
      });

      return {
        ...prevData,
        items: updatedItems,
      };
    });
  }, []);

  // Handle symbol validation with debouncing
  const validateSymbolInput = useCallback(async (symbol: string) => {
    if (!symbol || symbol.trim().length === 0) {
      setAddSymbolState((prev) => ({
        ...prev,
        isValidating: false,
        validationMessage: undefined,
        isValid: undefined,
      }));
      return;
    }

    setAddSymbolState((prev) => ({ ...prev, isValidating: true }));

    try {
      const result = await validateSymbol(symbol);
      setAddSymbolState((prev) => ({
        ...prev,
        isValidating: false,
        validationMessage: result.message,
        isValid: result.valid,
      }));
    } catch (error) {
      setAddSymbolState((prev) => ({
        ...prev,
        isValidating: false,
        validationMessage: "Validation failed",
        isValid: false,
      }));
    }
  }, []);

  // Debounced symbol validation
  const debouncedValidation = useCallback(
    (symbol: string) => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      validationTimeoutRef.current = setTimeout(() => {
        validateSymbolInput(symbol);
      }, 500);
    },
    [validateSymbolInput],
  );

  // Handle adding a symbol
  const handleAddSymbol = useCallback(async () => {
    if (!addSymbolState.symbol || addSymbolState.isLoading) return;

    setAddSymbolState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await addSymbolToWatchlist(addSymbolState.symbol.trim());

      if (result.success) {
        // Close the add dialog
        setAddSymbolState({
          isOpen: false,
          symbol: "",
          isLoading: false,
          isValidating: false,
        });

        // Refresh watchlist data
        await fetchData(true);

        // Show success message (you can implement toast notifications)
        console.log(result.message);
      } else {
        setAddSymbolState((prev) => ({
          ...prev,
          isLoading: false,
          validationMessage: result.message,
          isValid: false,
        }));
      }
    } catch (error: any) {
      setAddSymbolState((prev) => ({
        ...prev,
        isLoading: false,
        validationMessage: error.message || "Failed to add symbol",
        isValid: false,
      }));
    }
  }, [addSymbolState.symbol, addSymbolState.isLoading, fetchData]);

  // Handle removing a symbol
  const handleRemoveSymbol = useCallback(
    async (symbol: string) => {
      if (!symbol) return;

      try {
        const result = await removeSymbolFromWatchlist(symbol);

        if (result.success) {
          // Refresh watchlist data
          await fetchData(true);

          // Show success message
          console.log(result.message);
        } else {
          setError(result.message);
        }
      } catch (error: any) {
        setError(error.message || "Failed to remove symbol");
      }
    },
    [fetchData],
  );

  // Handle navigation to stock detail page
  const handleStockClick = useCallback(
    (symbol: string) => {
      navigate(`/stock/${symbol}`);
    },
    [navigate],
  );

  // Handle symbol input change
  const handleSymbolInputChange = useCallback(
    (value: string) => {
      const normalizedValue = value.toUpperCase();
      setAddSymbolState((prev) => ({ ...prev, symbol: normalizedValue }));
      debouncedValidation(normalizedValue);
    },
    [debouncedValidation],
  );

  // Initialize component
  useEffect(() => {
    fetchData();

    // Subscribe to connection status changes
    statusUnsubscribeRef.current =
      webSocketService.onConnectionStatusChange(setConnectionStatus);

    // Cleanup function
    return () => {
      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current();
      }
      if (statusUnsubscribeRef.current) {
        statusUnsubscribeRef.current();
      }
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [fetchData]);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (percent: number): string => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <WidgetErrorBoundary>
        <Card className={cn("h-full flex flex-col", config.className)}>
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center">
                <Eye className="h-4 w-4 mr-2 text-primary" />
                {watchlistData?.name || config.title || "Watchlist"}
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
            Loading watchlist...
          </CardContent>
        </Card>
      </WidgetErrorBoundary>
    );
  }

  if (error) {
    return (
      <WidgetErrorBoundary>
        <Card className={cn("h-full flex flex-col", config.className)}>
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center text-danger-fg">
                <AlertCircle className="h-4 w-4 mr-2" />
                {config.title || "Watchlist"}
              </CardTitle>
              <button onClick={fetchData} title="Retry loading watchlist">
                <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center text-danger-fg">
            Error: {error}
          </CardContent>
        </Card>
      </WidgetErrorBoundary>
    );
  }

  if (!watchlistData || watchlistData.items.length === 0) {
    return (
      <WidgetErrorBoundary>
        <Card className={cn("h-full flex flex-col", config.className)}>
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center">
                <Eye className="h-4 w-4 mr-2 text-primary" />
                {watchlistData?.name || config.title || "Watchlist"}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {connectionStatus === "connected" ? (
                  <Wifi
                    className="h-4 w-4 text-green-500"
                    title="Real-time data connected"
                  />
                ) : (
                  <WifiOff
                    className="h-4 w-4 text-gray-400"
                    title="Real-time data disconnected"
                  />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center text-muted-foreground">
            <p>Watchlist is empty.</p>
            <button
              onClick={() =>
                setAddSymbolState((prev) => ({ ...prev, isOpen: true }))
              }
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Symbol
            </button>
          </CardContent>
        </Card>
      </WidgetErrorBoundary>
    );
  }

  const displayItems = config.maxItems
    ? watchlistData.items.slice(0, config.maxItems)
    : watchlistData.items;

  return (
    <WidgetErrorBoundary>
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <Eye className="h-4 w-4 mr-2 text-primary" />
              {watchlistData.name || config.title || "Watchlist"}
              <Badge variant="outline" className="ml-2 text-xs font-normal">
                {watchlistData.items.length} items
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {connectionStatus === "connected" ? (
                <Wifi
                  className="h-4 w-4 text-green-500"
                  title="Real-time data connected"
                />
              ) : (
                <WifiOff
                  className="h-4 w-4 text-gray-400"
                  title="Real-time data disconnected"
                />
              )}
              <button
                onClick={() =>
                  setAddSymbolState((prev) => ({ ...prev, isOpen: true }))
                }
                className="inline-flex items-center p-1 border border-transparent rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                title="Add symbol"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          {" "}
          {/* Remove padding for ScrollArea */}
          <ScrollArea className="h-full p-2">
            {" "}
            {/* Add padding inside ScrollArea */}
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 px-1 hover:bg-muted/50 rounded-md"
              >
                <div className="flex items-center flex-grow min-w-0">
                  {item.logoUrl && (
                    <img
                      src={item.logoUrl}
                      alt={`${item.name} logo`}
                      className="h-6 w-6 mr-2 rounded-full object-contain"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  <div className="flex-grow min-w-0">
                    <p
                      className="text-sm font-medium text-foreground truncate"
                      title={item.name}
                    >
                      {item.symbol}
                    </p>
                    <p
                      className="text-xs text-muted-foreground truncate"
                      title={item.name}
                    >
                      {item.name}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(item.price)}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      item.change >= 0 ? "text-success-fg" : "text-danger-fg",
                    )}
                  >
                    {item.change >= 0 ? (
                      <TrendingUp className="inline h-3 w-3" />
                    ) : (
                      <TrendingDown className="inline h-3 w-3" />
                    )}
                    {formatCurrency(Math.abs(item.change))} (
                    {formatPercentage(item.changePercent)})
                  </p>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSymbol(item.symbol);
                    }}
                    title={`Remove ${item.symbol}`}
                  >
                    <Trash2 className="h-4 w-4 text-danger-fg" />
                  </Button>
                )}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Symbol Modal */}
      {addSymbolState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Symbol
              </h4>
              <button
                onClick={() =>
                  setAddSymbolState({
                    isOpen: false,
                    symbol: "",
                    isLoading: false,
                    isValidating: false,
                  })
                }
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Symbol
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={addSymbolState.symbol}
                  onChange={(e) => handleSymbolInputChange(e.target.value)}
                  placeholder="e.g., AAPL, GOOGL, MSFT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={addSymbolState.isLoading}
                />
                {addSymbolState.isValidating && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>

              {addSymbolState.validationMessage && (
                <div
                  className={cn(
                    "mt-2 text-sm",
                    addSymbolState.isValid
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {addSymbolState.validationMessage}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setAddSymbolState({
                    isOpen: false,
                    symbol: "",
                    isLoading: false,
                    isValidating: false,
                  })
                }
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                disabled={addSymbolState.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSymbol}
                disabled={
                  addSymbolState.isLoading ||
                  !addSymbolState.symbol ||
                  addSymbolState.isValid === false
                }
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {addSymbolState.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add to Watchlist"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </WidgetErrorBoundary>
  );
};

export default Watchlist;
