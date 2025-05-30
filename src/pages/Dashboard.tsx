import React from "react";
import { Link } from "react-router-dom";
import { PageLayout, Card } from "../components/layout/PageLayout";

const Dashboard: React.FC = () => {
  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Dashboard</h1>
          <p className="text-text/60">
            Welcome back! Here's your market overview.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="px-4 py-2 bg-surface border border-border rounded-md shadow-sm text-sm font-medium text-text hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <svg
              className="w-4 h-4 mr-1 inline-block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter
          </button>
          <button className="px-4 py-2 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <svg
              className="w-4 h-4 mr-1 inline-block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Watchlist
          </button>
        </div>
      </div>

      {/* Dashboard content grid - all the cards, tables, etc. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-semibold mb-2 text-text">
            Market Status
          </h2>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-accent rounded-full mr-2"></div>
            <span className="text-accent font-medium">Market Open</span>
          </div>
          <div className="text-sm text-text/60 mt-1">Closes in 3h 45m</div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-2 text-text">S&P 500</h2>
          <div className="text-2xl font-bold text-text">4,782.36</div>
          <div className="flex items-center text-accent text-sm">
            <svg
              className="w-4 h-4 mr-1"
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
            <span>+1.23% (+58.12)</span>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-2 text-text">
            Portfolio Value
          </h2>
          <div className="text-2xl font-bold text-text">$124,568.92</div>
          <div className="flex items-center text-accent text-sm">
            <svg
              className="w-4 h-4 mr-1"
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
            <span>+2.34% (+$2,845.67)</span>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-2 text-text">AI Signals</h2>
          <div className="text-2xl font-bold text-text">8</div>
          <div className="text-sm text-text/60">5 buy, 2 sell, 1 hold</div>
        </Card>
      </div>

      {/* Rest of dashboard content continues... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Market Overview Chart placeholder */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Market Overview</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-primary text-white rounded">
                  1D
                </button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  1W
                </button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  1M
                </button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  3M
                </button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  1Y
                </button>
              </div>
            </div>
            <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Market chart visualization
              </p>
            </div>
          </div>

          {/* Top Movers Table */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Top Movers</h2>
              <button className="text-sm text-primary hover:text-primary-600">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-secondary-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Symbol
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Change
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Volume
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      AI Signal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium">NVDA</div>
                        <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          NVIDIA Corp.
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      $924.73
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-green-500 text-sm">
                        <svg
                          className="w-4 h-4 mr-1"
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
                        <span>+4.56%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      35.78M
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Strong Buy
                      </span>
                    </td>
                  </tr>
                  {/* Additional rows omitted for brevity */}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar widgets */}
        <div>
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Watchlists</h2>
              <button className="text-sm text-primary hover:text-primary-600">
                View All
              </button>
            </div>
            {/* Watchlist content placeholder */}
            <div className="space-y-4">
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Watchlist widgets will be here
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">AI Trading Signals</h2>
              <button className="text-sm text-primary hover:text-primary-600">
                View All
              </button>
            </div>
            {/* AI signals content placeholder */}
            <div className="space-y-4">
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                AI signals will be here
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Market News</h2>
              <button className="text-sm text-primary hover:text-primary-600">
                View All
              </button>
            </div>
            {/* News content placeholder */}
            <div className="space-y-4">
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Market news will be here
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
