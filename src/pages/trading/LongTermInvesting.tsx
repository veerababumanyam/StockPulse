import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import DCFCalculator from "../../components/trading/longterm/DCFCalculator";
import DividendChart from "../../components/trading/longterm/DividendChart";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart2,
  PieChart,
  Info,
} from "lucide-react";

const LongTermInvesting: React.FC = () => {
  const { colorTheme } = useTheme();
  const navigate = useNavigate();
  const [activeSymbol, setActiveSymbol] = useState<string>("AAPL");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [watchlist, setWatchlist] = useState<string[]>([
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "BRK.B",
  ]);

  // Mock stock data
  const stockData = {
    AAPL: {
      name: "Apple Inc.",
      price: 182.63,
      change: 1.25,
      changePercent: 0.69,
      pe: 30.2,
      dividend: 0.96,
      yield: 0.53,
    },
    MSFT: {
      name: "Microsoft Corp.",
      price: 337.22,
      change: -2.15,
      changePercent: -0.63,
      pe: 33.8,
      dividend: 3.0,
      yield: 0.89,
    },
    GOOGL: {
      name: "Alphabet Inc.",
      price: 131.86,
      change: 0.54,
      changePercent: 0.41,
      pe: 25.1,
      dividend: 0,
      yield: 0,
    },
    AMZN: {
      name: "Amazon.com Inc.",
      price: 178.22,
      change: 3.45,
      changePercent: 1.97,
      pe: 78.3,
      dividend: 0,
      yield: 0,
    },
    "BRK.B": {
      name: "Berkshire Hathaway",
      price: 406.11,
      change: -1.02,
      changePercent: -0.25,
      pe: 8.5,
      dividend: 0,
      yield: 0,
    },
  };

  // Get primary color based on current theme
  const getPrimaryColor = () => {
    switch (colorTheme) {
      case "tropical-jungle":
        return "#29A329";
      case "ocean-sunset":
        return "#008B8B";
      case "desert-storm":
        return "#C19A6B";
      case "berry-fields":
        return "#8E4585";
      case "arctic-moss":
        return "#4682B4";
      default:
        return "#FF1493";
    }
  };

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Left Sidebar */}
          <div className="w-full md:w-64 bg-surface rounded-lg border border-border shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4 text-text">
              Long-Term Portfolio
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-text/70 mb-2">
                  Watchlist
                </h3>
                <div className="space-y-2">
                  {watchlist.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setActiveSymbol(symbol)}
                      className={`w-full flex justify-between items-center p-2 rounded-md text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        activeSymbol === symbol
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-surface/80 text-text"
                      }`}
                    >
                      <span className="font-medium">{symbol}</span>
                      <span
                        className={`${
                          stockData[symbol as keyof typeof stockData].change >=
                          0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stockData[symbol as keyof typeof stockData]
                          .changePercent >= 0
                          ? "+"
                          : ""}
                        {stockData[
                          symbol as keyof typeof stockData
                        ].changePercent.toFixed(2)}
                        %
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text/70 mb-2">
                  Investment Strategies
                </h3>
                <div className="space-y-1">
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-surface/80 text-text transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    Value Investing
                  </button>
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-surface/80 text-text transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    Dividend Growth
                  </button>
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-surface/80 text-text transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    Index Investing
                  </button>
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-surface/80 text-text transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    Growth Investing
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text/70 mb-2">Tools</h3>
                <div className="space-y-1">
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-surface/80 text-text transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Portfolio Analyzer
                  </button>
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-surface/80 text-text transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center">
                    <PieChart className="w-4 h-4 mr-2" />
                    Asset Allocation
                  </button>
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-surface/80 text-text transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Retirement Calculator
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-surface rounded-lg border border-border shadow-sm p-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-text">
                    {stockData[activeSymbol as keyof typeof stockData].name} (
                    {activeSymbol})
                  </h1>
                  <div className="flex items-center mt-1">
                    <span className="text-xl font-semibold text-text">
                      $
                      {stockData[
                        activeSymbol as keyof typeof stockData
                      ].price.toFixed(2)}
                    </span>
                    <span
                      className={`ml-2 ${
                        stockData[activeSymbol as keyof typeof stockData]
                          .change >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stockData[activeSymbol as keyof typeof stockData]
                        .change >= 0
                        ? "+"
                        : ""}
                      {stockData[
                        activeSymbol as keyof typeof stockData
                      ].change.toFixed(2)}{" "}
                      (
                      {stockData[activeSymbol as keyof typeof stockData]
                        .changePercent >= 0
                        ? "+"
                        : ""}
                      {stockData[
                        activeSymbol as keyof typeof stockData
                      ].changePercent.toFixed(2)}
                      %)
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="btn-primary">Add to Portfolio</button>
                  <button className="px-4 py-2 bg-surface border border-border hover:bg-surface/80 rounded-md text-sm font-medium text-text transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    Set Alert
                  </button>
                </div>
              </div>

              <div className="flex border-b border-border mt-6">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    activeTab === "overview"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text/70 hover:text-text"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("valuation")}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    activeTab === "valuation"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text/70 hover:text-text"
                  }`}
                >
                  Valuation
                </button>
                <button
                  onClick={() => setActiveTab("dividends")}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    activeTab === "dividends"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text/70 hover:text-text"
                  }`}
                >
                  Dividends
                </button>
                <button
                  onClick={() => setActiveTab("financials")}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    activeTab === "financials"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text/70 hover:text-text"
                  }`}
                >
                  Financials
                </button>
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-surface rounded-lg border border-border shadow-sm p-4">
                  <h2 className="text-lg font-semibold mb-4 text-text">
                    Company Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3 bg-surface/50 border border-border rounded-lg">
                      <h3 className="text-sm font-medium text-text/70">
                        Market Cap
                      </h3>
                      <p className="text-lg font-semibold text-text">$2.85T</p>
                    </div>
                    <div className="p-3 bg-surface/50 border border-border rounded-lg">
                      <h3 className="text-sm font-medium text-text/70">
                        P/E Ratio
                      </h3>
                      <p className="text-lg font-semibold text-text">
                        {stockData[activeSymbol as keyof typeof stockData].pe}
                      </p>
                    </div>
                    <div className="p-3 bg-surface/50 border border-border rounded-lg">
                      <h3 className="text-sm font-medium text-text/70">
                        Dividend Yield
                      </h3>
                      <p className="text-lg font-semibold text-text">
                        {stockData[
                          activeSymbol as keyof typeof stockData
                        ].yield.toFixed(2)}
                        %
                      </p>
                    </div>
                    <div className="p-3 bg-surface/50 border border-border rounded-lg">
                      <h3 className="text-sm font-medium text-text/70">
                        52W High
                      </h3>
                      <p className="text-lg font-semibold text-text">$199.62</p>
                    </div>
                    <div className="p-3 bg-surface/50 border border-border rounded-lg">
                      <h3 className="text-sm font-medium text-text/70">
                        52W Low
                      </h3>
                      <p className="text-lg font-semibold text-text">$164.08</p>
                    </div>
                    <div className="p-3 bg-surface/50 border border-border rounded-lg">
                      <h3 className="text-sm font-medium text-text/70">Beta</h3>
                      <p className="text-lg font-semibold text-text">1.24</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-surface rounded-lg border border-border shadow-sm p-4">
                    <h3 className="text-lg font-semibold mb-4 text-text">
                      Price Chart (1Y)
                    </h3>
                    <div className="h-64 bg-surface/50 border border-border rounded-lg flex items-center justify-center">
                      <p className="text-text/60">Price chart visualization</p>
                    </div>
                  </div>

                  <div className="bg-surface rounded-lg border border-border shadow-sm p-4">
                    <h3 className="text-lg font-semibold mb-4 text-text">
                      Key Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-text/70">Revenue (TTM)</span>
                        <span className="font-medium text-text">$394.33B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text/70">Net Income (TTM)</span>
                        <span className="font-medium text-text">$99.80B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text/70">Operating Margin</span>
                        <span className="font-medium text-text">30.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text/70">ROE</span>
                        <span className="font-medium text-text">56.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text/70">Debt-to-Equity</span>
                        <span className="font-medium text-text">1.95</span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="text-text/70">Forward P/E</span>
                        <span className="font-medium text-text">25.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "valuation" && (
              <div className="space-y-6">
                <DCFCalculator symbol={activeSymbol} />
              </div>
            )}

            {activeTab === "dividends" && (
              <div className="space-y-6">
                <DividendChart symbol={activeSymbol} />
              </div>
            )}

            {activeTab === "financials" && (
              <div className="space-y-6">
                <div className="bg-surface rounded-lg border border-border shadow-sm p-4">
                  <h2 className="text-lg font-semibold mb-4 text-text">
                    Financial Statements
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-surface/80">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-text/70 uppercase tracking-wider">
                            Metric
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-text/70 uppercase tracking-wider">
                            2023
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-text/70 uppercase tracking-wider">
                            2022
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-text/70 uppercase tracking-wider">
                            2021
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-text/70 uppercase tracking-wider">
                            2020
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text">
                            Revenue
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $394.33B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $365.82B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $274.52B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $260.17B
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text">
                            Gross Profit
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $169.15B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $152.84B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $104.96B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $98.39B
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text">
                            Operating Income
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $118.66B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $119.44B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $70.90B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $64.05B
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text">
                            Net Income
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $99.80B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $94.68B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $57.41B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $53.39B
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text">
                            EPS
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $6.16
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $6.05
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $3.65
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text text-right">
                            $3.31
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LongTermInvesting;
