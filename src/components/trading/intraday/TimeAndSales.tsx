import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Trade {
  price: number;
  size: number;
  time: string;
  exchange: string;
  condition: string;
  side: "buy" | "sell";
}

interface TimeAndSalesProps {
  symbol: string;
  maxEntries?: number;
  showConditions?: boolean;
  autoScroll?: boolean;
  highlightLargeTrades?: boolean;
  largeTradeSizeThreshold?: number;
}

const TimeAndSales: React.FC<TimeAndSalesProps> = ({
  symbol,
  maxEntries = 100,
  showConditions = true,
  autoScroll = true,
  highlightLargeTrades = true,
  largeTradeSizeThreshold = 1000,
}) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);

  // Generate mock trade data
  const generateMockTrade = (prevPrice: number | null): Trade => {
    const basePrice = prevPrice || Math.random() * 100 + 100; // Random price between 100-200
    const priceChange = (Math.random() - 0.5) * 0.1; // Small random price change
    const price = basePrice + priceChange;

    const exchanges = ["NASDAQ", "NYSE", "ARCA", "BATS", "EDGX"];
    const conditions = ["@", "R", "T", "X", ""];
    const side: "buy" | "sell" = Math.random() > 0.5 ? "buy" : "sell";

    return {
      price,
      size: Math.floor(Math.random() * 2000) + 1,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      side,
    };
  };

  // Initial load and continuous update logic
  useEffect(() => {
    setLoading(true);

    // Generate initial batch of trades
    const initialTrades: Trade[] = [];
    let initialPrice = null;

    for (let i = 0; i < 20; i++) {
      const trade = generateMockTrade(initialPrice);
      initialPrice = trade.price;
      initialTrades.unshift(trade); // Add to beginning to show newest first
    }

    setTrades(initialTrades);
    setLastPrice(initialPrice);
    setLoading(false);

    // Set up interval to add new trades
    const intervalId = setInterval(() => {
      setTrades((prevTrades) => {
        const newTrade = generateMockTrade(lastPrice);
        setLastPrice(newTrade.price);

        // Add new trade and limit to maxEntries
        const updatedTrades = [newTrade, ...prevTrades];
        if (updatedTrades.length > maxEntries) {
          return updatedTrades.slice(0, maxEntries);
        }
        return updatedTrades;
      });
    }, 1000); // Add a new trade every second

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [symbol, maxEntries]);

  // Determine price direction for styling
  const getPriceDirection = (index: number): "up" | "down" | "neutral" => {
    if (index === trades.length - 1 || trades.length < 2) return "neutral";

    const currentPrice = trades[index].price;
    const previousPrice = trades[index + 1].price;

    if (currentPrice > previousPrice) return "up";
    if (currentPrice < previousPrice) return "down";
    return "neutral";
  };

  // Determine if a trade is large
  const isLargeTrade = (size: number): boolean => {
    return highlightLargeTrades && size >= largeTradeSizeThreshold;
  };

  if (loading && !trades.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-center h-40 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">{symbol} Time & Sales</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last: ${lastPrice?.toFixed(2)}
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm font-medium dark:bg-gray-700 dark:text-gray-300">
            Filter
          </button>
          <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm font-medium dark:bg-gray-700 dark:text-gray-300">
            Export
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-t-lg">
          <div className="grid grid-cols-12 text-xs font-medium text-gray-500 dark:text-gray-400">
            <div className="col-span-2">Time</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Exchange</div>
            {showConditions && <div className="col-span-2">Condition</div>}
            <div className={showConditions ? "col-span-2" : "col-span-4"}>
              Side
            </div>
          </div>
        </div>

        <div
          className="max-h-80 overflow-y-auto"
          style={{ scrollBehavior: "smooth" }}
        >
          {trades.map((trade, index) => {
            const direction = getPriceDirection(index);
            const isLarge = isLargeTrade(trade.size);

            return (
              <motion.div
                key={`${trade.time}-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`grid grid-cols-12 text-sm py-1.5 ${
                  isLarge
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-700/30"
                }`}
              >
                <div className="col-span-2 font-mono text-xs">{trade.time}</div>
                <div
                  className={`col-span-2 font-medium ${
                    direction === "up"
                      ? "text-green-600 dark:text-green-400"
                      : direction === "down"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  ${trade.price.toFixed(2)}
                </div>
                <div
                  className={`col-span-2 ${isLarge ? "font-bold" : "font-medium"}`}
                >
                  {trade.size}
                </div>
                <div className="col-span-2 text-xs">{trade.exchange}</div>
                {showConditions && (
                  <div className="col-span-2 text-xs">{trade.condition}</div>
                )}
                <div
                  className={`${showConditions ? "col-span-2" : "col-span-4"} ${
                    trade.side === "buy"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {trade.side.toUpperCase()}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showConditions"
              checked={showConditions}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="showConditions"
              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Show Conditions
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="highlightLargeTrades"
              checked={highlightLargeTrades}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="highlightLargeTrades"
              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Highlight Large Trades
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Trades: {trades.length}
          </span>
          <select className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option value="100">Max: 100</option>
            <option value="200">Max: 200</option>
            <option value="500">Max: 500</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TimeAndSales;
