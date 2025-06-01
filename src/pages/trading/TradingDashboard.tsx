import React from 'react';
// import Navbar from '@components/layout/Navbar'; // REMOVE: MainLayout provides the Navbar
// import Footer from '@components/layout/Footer'; // REMOVE: MainLayout provides the Footer (if configured)
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Clock, Activity, Zap } from 'lucide-react';

const TradingDashboard: React.FC = () => {
  return (
    // The outer div with min-h-screen, flex, flex-col might also be redundant if MainLayout handles this structure.
    // For now, let's just remove Navbar and Footer.
    <div className="bg-background">
      {/* <Navbar /> */}
      {/* REMOVED */}

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-text">Trading Dashboard</h1>

        <div className="mb-8">
          {/* Market Status */}
          <div className="flex items-center mt-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-500 font-medium">Market Open</span>
            <div className="text-sm text-text/60 mt-1">
              NYSE & NASDAQ: 9:30 AM - 4:00 PM EST
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface rounded-xl p-6">
            <div className="flex items-center text-green-500 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Portfolio Growth</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-500">
                +$1,245.67
              </div>
              <div className="text-sm text-text/60">
                <span className="text-green-500">+2.4%</span> from yesterday
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-6">
            <div className="text-sm text-text/60">Current Balance</div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-text">$52,847.32</div>
              <div className="text-sm text-text/60">Available for trading</div>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text/60">Active Positions</div>
                <div className="text-2xl font-bold text-text">12</div>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-surface rounded-xl p-6">
            <h2 className="text-xl font-semibold text-text mb-4">
              Trading Modules
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/trading/intraday"
                className="block bg-surface/80 rounded-lg p-4 hover:bg-surface/60 transition-colors"
              >
                <div className="flex items-center mb-2">
                  <Zap className="w-5 h-5 text-primary mr-2" />
                  <span className="font-medium text-text">
                    Intraday Trading
                  </span>
                </div>
                <p className="text-sm text-text/60">
                  Day trading with real-time data
                </p>
              </Link>

              <Link
                to="/trading/options"
                className="block bg-surface/80 rounded-lg p-4 hover:bg-surface/60 transition-colors"
              >
                <div className="flex items-center mb-2">
                  <BarChart3 className="w-5 h-5 text-primary mr-2" />
                  <span className="font-medium text-text">Options Trading</span>
                </div>
                <p className="text-sm text-text/60">
                  Advanced options strategies
                </p>
              </Link>

              <Link
                to="/trading/positional"
                className="block bg-surface/80 rounded-lg p-4 hover:bg-surface/60 transition-colors"
              >
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-primary mr-2" />
                  <span className="font-medium text-text">
                    Positional Trading
                  </span>
                </div>
                <p className="text-sm text-text/60">
                  Multi-day holding strategies
                </p>
              </Link>

              <Link
                to="/trading/long-term"
                className="block bg-surface/80 rounded-lg p-4 hover:bg-surface/60 transition-colors"
              >
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-primary mr-2" />
                  <span className="font-medium text-text">
                    Long-term Investing
                  </span>
                </div>
                <p className="text-sm text-text/60">
                  Fundamental analysis focused
                </p>
              </Link>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-6">
            <h2 className="text-xl font-semibold text-text mb-4">
              Active Watchlists
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface/80 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-text">Growth Stocks</div>
                    <p className="text-xs text-text/60">5 symbols</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-green-500">+2.4%</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface/80 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-text">
                      Dividend Champions
                    </div>
                    <p className="text-xs text-text/60">8 symbols</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-green-500">+0.8%</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface/80 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-text">Tech Innovators</div>
                    <p className="text-xs text-text/60">6 symbols</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-red-500">-1.2%</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface/80 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-text">Energy Sector</div>
                    <p className="text-xs text-text/60">4 symbols</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-green-500">+3.5%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-text mb-4">
            Recent Transactions
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-surface/80">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider"
                  >
                    Symbol
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider"
                  >
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text">
                    AAPL
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">
                    Buy
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                    10 shares
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                    $175.25
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text/60">
                    10:24 AM
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text">
                    MSFT
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">
                    Sell
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                    5 shares
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                    $420.80
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text/60">
                    9:45 AM
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text">
                    GOOGL
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">
                    Buy
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                    3 shares
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                    $140.50
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text/60">
                    Yesterday
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text">
                    TSLA
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">
                    Sell
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                    8 shares
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                    $245.30
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text/60">
                    Yesterday
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
      {/* REMOVED */}
    </div>
  );
};

export default TradingDashboard;
