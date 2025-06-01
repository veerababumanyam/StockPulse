import React from 'react';

const ScreenerPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-text">Stock Screener</h1>

      <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-text">
          Screening Criteria
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Price Range
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
              />
              <span className="text-text/60">to</span>
              <input
                type="number"
                placeholder="Max"
                className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
              />
            </div>
          </div>

          {/* Market Cap */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Market Cap
            </label>
            <select className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm">
              <option value="">Any</option>
              <option value="micro">Micro ($50M - $300M)</option>
              <option value="small">Small ($300M - $2B)</option>
              <option value="mid">Mid ($2B - $10B)</option>
              <option value="large">Large ($10B - $200B)</option>
              <option value="mega">Mega ($200B+)</option>
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Sector
            </label>
            <select className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm">
              <option value="">Any</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="financials">Financials</option>
              <option value="consumer">Consumer Discretionary</option>
              <option value="communications">Communication Services</option>
              <option value="industrials">Industrials</option>
              <option value="utilities">Utilities</option>
              <option value="materials">Materials</option>
              <option value="energy">Energy</option>
              <option value="real_estate">Real Estate</option>
            </select>
          </div>

          {/* P/E Ratio */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              P/E Ratio
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
              />
              <span className="text-text/60">to</span>
              <input
                type="number"
                placeholder="Max"
                className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
              />
            </div>
          </div>

          {/* Dividend Yield */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Dividend Yield (%)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
              />
              <span className="text-text/60">to</span>
              <input
                type="number"
                placeholder="Max"
                className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
              />
            </div>
          </div>

          {/* Volume */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Average Volume (M)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
              />
              <span className="text-text/60">to</span>
              <input
                type="number"
                placeholder="Max"
                className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-text mb-2">
            Technical Indicators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* RSI */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                RSI (14)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
                />
                <span className="text-text/60">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
                />
              </div>
            </div>

            {/* Moving Average */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Price vs. MA (200)
              </label>
              <select className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm">
                <option value="">Any</option>
                <option value="above">Price above MA</option>
                <option value="below">Price below MA</option>
                <option value="crossover_above">Crossed above MA</option>
                <option value="crossover_below">Crossed below MA</option>
              </select>
            </div>

            {/* MACD */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                MACD
              </label>
              <select className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm">
                <option value="">Any</option>
                <option value="bullish">Bullish Crossover</option>
                <option value="bearish">Bearish Crossover</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-text bg-background hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Reset
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-text">Results (125)</h2>
          <div className="flex items-center">
            <span className="text-sm text-text/60 mr-2">Sort by:</span>
            <select className="block w-40 px-3 py-1.5 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text text-sm">
              <option value="market_cap">Market Cap</option>
              <option value="price">Price</option>
              <option value="volume">Volume</option>
              <option value="pe">P/E Ratio</option>
              <option value="dividend">Dividend Yield</option>
            </select>
          </div>
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
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider"
                >
                  Change
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider"
                >
                  Market Cap
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider"
                >
                  P/E
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider"
                >
                  Div Yield
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider"
                >
                  Volume
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium">AAPL</div>
                    <div className="ml-2 text-xs text-text/60">Apple Inc.</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">$182.63</td>
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
                    <span>2.34%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">$2.85T</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">30.42</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">0.54%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">58.32M</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium">MSFT</div>
                    <div className="ml-2 text-xs text-text/60">
                      Microsoft Corp.
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">$415.32</td>
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
                    <span>1.12%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">$3.09T</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">37.85</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">0.72%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">25.67M</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium">GOOGL</div>
                    <div className="ml-2 text-xs text-text/60">
                      Alphabet Inc.
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">$175.98</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-red-500 text-sm">
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
                    <span>0.87%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">$2.21T</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">25.12</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">0.00%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">18.45M</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium">AMZN</div>
                    <div className="ml-2 text-xs text-text/60">
                      Amazon.com Inc.
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">$178.15</td>
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
                    <span>3.21%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">$1.84T</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">62.78</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">0.00%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">42.19M</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium">NVDA</div>
                    <div className="ml-2 text-xs text-text/60">
                      NVIDIA Corp.
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">$924.73</td>
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
                    <span>4.56%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">$2.28T</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">85.63</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">0.03%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">35.78M</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="text-sm text-text/60">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">5</span> of{' '}
              <span className="font-medium">125</span> results
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-border shadow-sm text-sm font-medium rounded-md text-text bg-background hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled
              >
                Previous
              </button>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-border shadow-sm text-sm font-medium rounded-md text-text bg-background hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenerPage;
