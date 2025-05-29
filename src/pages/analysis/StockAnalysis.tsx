import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
} from "lucide-react";

const StockAnalysisPage = () => {
  const [symbol, setSymbol] = useState("AAPL");
  const [timeframe, setTimeframe] = useState("1D");

  // Mock data for the stock
  const stockData = {
    name: "Apple Inc.",
    symbol: "AAPL",
    price: 187.42,
    change: 2.35,
    changePercent: 1.27,
    marketCap: "2.94T",
    volume: "52.3M",
    pe: 31.2,
    dividend: 0.92,
    high52: 198.23,
    low52: 124.17,
    recommendation: "Buy",
    targetPrice: 210.5,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">{stockData.name}</h1>
              <span className="ml-3 text-gray-500 dark:text-gray-400">
                {stockData.symbol}
              </span>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-2xl font-semibold">${stockData.price}</span>
              <span
                className={`ml-3 flex items-center ${stockData.change >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {stockData.change >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {stockData.change >= 0 ? "+" : ""}
                {stockData.change} ({stockData.changePercent}%)
              </span>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Buy
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
              Sell
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg">
              Add to Watchlist
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Price Chart</h2>
            <div className="flex space-x-2">
              {["1D", "1W", "1M", "3M", "1Y", "5Y", "MAX"].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    timeframe === period
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setTimeframe(period)}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <div className="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                Price chart will be implemented with Recharts
              </p>
            </div>
          </div>
        </div>

        {/* Stock Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Key Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Key Statistics</h2>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Market Cap
                  </p>
                  <p className="font-semibold">${stockData.marketCap}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Volume
                  </p>
                  <p className="font-semibold">{stockData.volume}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    P/E Ratio
                  </p>
                  <p className="font-semibold">{stockData.pe}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dividend Yield
                  </p>
                  <p className="font-semibold">{stockData.dividend}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    52-Week High
                  </p>
                  <p className="font-semibold">${stockData.high52}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    52-Week Low
                  </p>
                  <p className="font-semibold">${stockData.low52}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analyst Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Analyst Recommendations</h2>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stockData.recommendation}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Consensus Rating
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Price Target</span>
                  <span className="text-sm font-medium">
                    ${stockData.targetPrice}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${(stockData.price / stockData.targetPrice) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Current: ${stockData.price}</span>
                  <span>
                    Upside:{" "}
                    {(
                      (stockData.targetPrice / stockData.price - 1) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    18
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Buy
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    7
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Hold
                  </p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    2
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Sell
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">AI Insights</h2>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <BarChart2 className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="font-semibold">Technical Analysis</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AAPL is showing bullish momentum with strong support at $180.
                  RSI indicates the stock is not yet overbought.
                </p>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                  <h3 className="font-semibold">Fundamental Analysis</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Strong revenue growth expected from services division. P/E
                  ratio is above sector average but justified by growth
                  prospects.
                </p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                  <h3 className="font-semibold">Risk Assessment</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Medium volatility with beta of 1.2. Supply chain concerns
                  remain but are diminishing. Regulatory risks are moderate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Data */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Financial Data</h2>
          </div>

          <div className="p-4">
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Revenue & EPS Growth</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  Financial charts will be implemented with Recharts
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Quarter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      YoY Growth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      EPS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      EPS Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">Q1 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap">$94.8B</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +8.2%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">$1.52</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +10.1%
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">Q4 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap">$119.6B</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +6.5%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">$2.18</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +7.9%
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">Q3 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap">$89.5B</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +5.2%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">$1.46</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +6.6%
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">Q2 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap">$81.8B</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-500">
                      -1.4%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">$1.26</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-500">
                      -0.8%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* News & Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">News & Events</h2>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between mb-1">
                  <h3 className="font-semibold">
                    Apple Announces New MacBook Pro with M3 Pro and M3 Max Chips
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    2 days ago
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Apple today announced new MacBook Pro models featuring the M3
                  Pro and M3 Max chips, delivering even greater performance and
                  power efficiency.
                </p>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Read more
                </a>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between mb-1">
                  <h3 className="font-semibold">
                    Apple Services Revenue Hits All-Time High in Q1 2025
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    1 week ago
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Apple's services division, which includes Apple Music, Apple
                  TV+, and the App Store, reported record revenue of $23.6
                  billion in Q1 2025.
                </p>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Read more
                </a>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <h3 className="font-semibold">
                    Apple Expands AI Capabilities with New Acquisition
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    2 weeks ago
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Apple has acquired AI startup Neuron Labs for $500 million,
                  signaling the company's continued investment in artificial
                  intelligence technologies.
                </p>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Read more
                </a>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                View All News
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StockAnalysisPage;
