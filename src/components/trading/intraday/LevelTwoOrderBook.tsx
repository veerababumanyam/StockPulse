import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Order {
  price: number;
  size: number;
  exchange: string;
  time: string;
}

interface LevelTwoOrderBookProps {
  symbol: string;
  depth?: number;
  showExchanges?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const LevelTwoOrderBook: React.FC<LevelTwoOrderBookProps> = ({
  symbol,
  depth = 10,
  showExchanges = true,
  autoRefresh = true,
  refreshInterval = 1000,
}) => {
  const [asks, setAsks] = useState<Order[]>([]);
  const [bids, setBids] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Generate mock order book data
  const generateMockOrderBook = () => {
    const basePrice = Math.random() * 100 + 100; // Random price between 100-200
    const mockAsks: Order[] = [];
    const mockBids: Order[] = [];

    const exchanges = ["NASDAQ", "NYSE", "ARCA", "BATS", "EDGX"];

    // Generate asks (sell orders)
    for (let i = 0; i < depth; i++) {
      const price = basePrice + i * 0.05; // Increment by $0.05
      mockAsks.push({
        price,
        size: Math.floor(Math.random() * 1000) + 100,
        exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
        time: new Date().toLocaleTimeString(),
      });
    }

    // Generate bids (buy orders)
    for (let i = 0; i < depth; i++) {
      const price = basePrice - i * 0.05; // Decrement by $0.05
      mockBids.push({
        price,
        size: Math.floor(Math.random() * 1000) + 100,
        exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
        time: new Date().toLocaleTimeString(),
      });
    }

    return { asks: mockAsks, bids: mockBids };
  };

  // Initial load and refresh logic
  useEffect(() => {
    const loadOrderBook = () => {
      setLoading(true);
      try {
        const { asks, bids } = generateMockOrderBook();
        setAsks(asks);
        setBids(bids);
        setLastUpdate(new Date());
        setLoading(false);
      } catch (err) {
        setError("Failed to load order book data");
        setLoading(false);
      }
    };

    // Initial load
    loadOrderBook();

    // Set up auto-refresh if enabled
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(loadOrderBook, refreshInterval);
    }

    // Clean up interval on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [symbol, depth, autoRefresh, refreshInterval]);

  // Calculate total volume and max volume for visualization
  const calculateVolumes = () => {
    const askVolumes = asks.map((ask) => ask.size);
    const bidVolumes = bids.map((bid) => bid.size);
    const totalAskVolume = askVolumes.reduce((sum, vol) => sum + vol, 0);
    const totalBidVolume = bidVolumes.reduce((sum, vol) => sum + vol, 0);
    const maxVolume = Math.max(...askVolumes, ...bidVolumes);

    return { totalAskVolume, totalBidVolume, maxVolume };
  };

  const { totalAskVolume, totalBidVolume, maxVolume } = calculateVolumes();

  // Calculate spread
  const spread = asks.length && bids.length ? asks[0].price - bids[0].price : 0;
  const spreadPercentage =
    asks.length && bids.length ? (spread / asks[0].price) * 100 : 0;

  if (loading && !asks.length && !bids.length) {
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
          <h3 className="text-lg font-semibold">{symbol} Level II</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Spread: ${spread.toFixed(2)} ({spreadPercentage.toFixed(2)}%)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white p-1 rounded"
            onClick={() => setLastUpdate(new Date())}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Bids (Buy Orders) */}
        <div>
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-t-lg">
            <div className="grid grid-cols-12 text-xs font-medium text-gray-500 dark:text-gray-400">
              {showExchanges && <div className="col-span-2">Exchange</div>}
              <div className={showExchanges ? "col-span-3" : "col-span-4"}>
                Size
              </div>
              <div className={showExchanges ? "col-span-3" : "col-span-4"}>
                Price
              </div>
              <div className={showExchanges ? "col-span-4" : "col-span-4"}>
                Volume
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {bids.map((bid, index) => (
              <motion.div
                key={`${bid.price}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={`grid grid-cols-12 text-sm py-1 ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/30"}`}
              >
                {showExchanges && (
                  <div className="col-span-2 text-xs">{bid.exchange}</div>
                )}
                <div
                  className={`${showExchanges ? "col-span-3" : "col-span-4"} font-medium`}
                >
                  {bid.size}
                </div>
                <div
                  className={`${showExchanges ? "col-span-3" : "col-span-4"} text-green-600 dark:text-green-400 font-medium`}
                >
                  ${bid.price.toFixed(2)}
                </div>
                <div
                  className={`${showExchanges ? "col-span-4" : "col-span-4"} pr-2`}
                >
                  <div
                    className="h-4 bg-green-100 dark:bg-green-900/40 rounded-sm"
                    style={{ width: `${(bid.size / maxVolume) * 100}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-b-lg mt-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Total Volume:
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {totalBidVolume.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div>
          <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-t-lg">
            <div className="grid grid-cols-12 text-xs font-medium text-gray-500 dark:text-gray-400">
              <div className={showExchanges ? "col-span-4" : "col-span-4"}>
                Volume
              </div>
              <div className={showExchanges ? "col-span-3" : "col-span-4"}>
                Price
              </div>
              <div className={showExchanges ? "col-span-3" : "col-span-4"}>
                Size
              </div>
              {showExchanges && <div className="col-span-2">Exchange</div>}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {asks.map((ask, index) => (
              <motion.div
                key={`${ask.price}-${index}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={`grid grid-cols-12 text-sm py-1 ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/30"}`}
              >
                <div
                  className={`${showExchanges ? "col-span-4" : "col-span-4"} pl-2`}
                >
                  <div
                    className="h-4 bg-red-100 dark:bg-red-900/40 rounded-sm"
                    style={{ width: `${(ask.size / maxVolume) * 100}%` }}
                  ></div>
                </div>
                <div
                  className={`${showExchanges ? "col-span-3" : "col-span-4"} text-red-600 dark:text-red-400 font-medium`}
                >
                  ${ask.price.toFixed(2)}
                </div>
                <div
                  className={`${showExchanges ? "col-span-3" : "col-span-4"} font-medium`}
                >
                  {ask.size}
                </div>
                {showExchanges && (
                  <div className="col-span-2 text-xs">{ask.exchange}</div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-b-lg mt-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Total Volume:
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {totalAskVolume.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showExchanges"
              checked={showExchanges}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="showExchanges"
              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Show Exchanges
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="autoRefresh"
              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Auto Refresh
            </label>
          </div>
        </div>

        <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          <option value="10">Depth: 10</option>
          <option value="20">Depth: 20</option>
          <option value="30">Depth: 30</option>
        </select>
      </div>
    </div>
  );
};

export default LevelTwoOrderBook;
