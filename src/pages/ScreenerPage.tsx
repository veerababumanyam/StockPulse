import React from 'react';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const ScreenerPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-secondary-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Stock Screener</h1>
        
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Screening Criteria</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>
            
            {/* Market Cap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Market Cap
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
              >
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sector
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
              >
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                P/E Ratio
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>
            
            {/* Dividend Yield */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dividend Yield (%)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>
            
            {/* Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Average Volume (M)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technical Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* RSI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  RSI (14)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Moving Average */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price vs. MA (200)
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="above">Price above MA</option>
                  <option value="below">Price below MA</option>
                  <option value="crossover_above">Crossed above MA</option>
                  <option value="crossover_below">Crossed below MA</option>
                </select>
              </div>
              
              {/* MACD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  MACD
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                >
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
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
        
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Results (125)</h2>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Sort by:</span>
              <select
                className="block w-40 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white text-sm"
              >
                <option value="market_cap">Market Cap</option>
                <option value="price">Price</option>
                <option value="volume">Volume</option>
                <option value="pe">P/E Ratio</option>
                <option value="dividend">Dividend Yield</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-secondary-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market Cap</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P/E</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Div Yield</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Volume</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium">AAPL</div>
                      <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">Apple Inc.</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$182.63</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-green-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
                      <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">Microsoft Corp.</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$415.32</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-green-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
                      <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">Alphabet Inc.</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$175.98</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-red-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
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
                      <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">Amazon.com Inc.</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$178.15</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-green-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
                      <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">NVIDIA Corp.</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$924.73</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-green-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">125</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  disabled
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScreenerPage;
