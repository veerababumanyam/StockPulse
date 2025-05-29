import React from "react";

const PortfolioPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-text">Portfolio</h1>

      <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-text">
          Portfolio Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-text/60">Total Value</h3>
            <div className="text-2xl font-bold text-text">$124,568.92</div>
            <div className="flex items-center text-green-600 dark:text-green-400 text-sm mt-1">
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
              <span>$1,245.32 (1.01%)</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-text/60">Day Change</h3>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              +$2,345.67
            </div>
            <div className="text-sm text-text/60 mt-1">+1.92% today</div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-text/60">Open Positions</h3>
            <div className="text-2xl font-bold text-text">12</div>
            <div className="text-sm text-text/60 mt-1">8 profitable</div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-text/60">Cash Balance</h3>
            <div className="text-2xl font-bold text-text">$15,432.87</div>
            <div className="text-sm text-text/60 mt-1">12.39% of portfolio</div>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text">Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider"
                >
                  Symbol
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider"
                >
                  Shares
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider"
                >
                  Avg. Cost
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider"
                >
                  Current Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider"
                >
                  Market Value
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider"
                >
                  Gain/Loss
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-text">AAPL</div>
                    <div className="ml-2 text-xs text-text/60">Apple Inc.</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  50
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $165.32
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $182.63
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $9,131.50
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
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
                    <span>$865.50 (10.47%)</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-text">MSFT</div>
                    <div className="ml-2 text-xs text-text/60">
                      Microsoft Corp.
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  25
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $380.45
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $415.32
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $10,383.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
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
                    <span>$871.75 (9.17%)</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-text">GOOGL</div>
                    <div className="ml-2 text-xs text-text/60">
                      Alphabet Inc.
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  30
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $180.23
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $175.98
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $5,279.40
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
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
                        d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
                      />
                    </svg>
                    <span>-$127.50 (-2.36%)</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-text">AMZN</div>
                    <div className="ml-2 text-xs text-text/60">
                      Amazon.com Inc.
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  15
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $165.78
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $178.15
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $2,672.25
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
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
                    <span>$185.55 (7.46%)</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-text">NVDA</div>
                    <div className="ml-2 text-xs text-text/60">
                      NVIDIA Corp.
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  10
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $850.32
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $924.73
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  $9,247.30
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
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
                    <span>$744.10 (8.75%)</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
