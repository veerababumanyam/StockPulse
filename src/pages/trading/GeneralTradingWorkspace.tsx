import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, TrendingDown, Clock, Sliders } from 'lucide-react';

const GeneralTradingWorkspace = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Trading Workspace</h1>
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
              <span className="mr-2">New Order</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg">
              Save Layout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart and Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold">AAPL</h2>
                  <span className="ml-3 text-gray-500 dark:text-gray-400">Apple Inc.</span>
                  <span className="ml-3 flex items-center text-green-500">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +2.35 (1.27%)
                  </span>
                </div>
                <div className="flex space-x-2">
                  <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option>1 Minute</option>
                    <option>5 Minutes</option>
                    <option selected>15 Minutes</option>
                    <option>1 Hour</option>
                    <option>1 Day</option>
                  </select>
                  <button className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 p-2 rounded-lg">
                    <Sliders className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Price chart will be implemented with Recharts</p>
                </div>
              </div>
            </div>
            
            {/* Technical Indicators */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold">Technical Indicators</h2>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">RSI (14)</h3>
                    <p className="text-xl font-semibold">58.42</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Neutral</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">MACD</h3>
                    <p className="text-xl font-semibold text-green-500">Bullish</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Crossover</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Bollinger Bands</h3>
                    <p className="text-xl font-semibold">Middle</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Low Volatility</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Moving Avg (50/200)</h3>
                    <p className="text-xl font-semibold text-green-500">Golden Cross</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bullish Signal</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold">AI Analysis</h2>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <BarChart2 className="w-5 h-5 text-blue-500 mr-2" />
                    <h3 className="font-semibold">Technical Outlook</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    AAPL is showing bullish momentum with strong support at $180. RSI indicates the stock is not yet overbought, suggesting potential for further upside.
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-amber-500 mr-2" />
                    <h3 className="font-semibold">Entry/Exit Timing</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Optimal entry point detected at current price with a stop loss at $182.50. Target price of $195 gives a favorable risk-reward ratio of 1:3.
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="font-medium">Buy Signal Strength: 78%</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                    View Detailed Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Order Entry and Positions */}
          <div className="space-y-6">
            {/* Order Entry */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold">Order Entry</h2>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Symbol</label>
                  <input type="text" value="AAPL" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action</label>
                    <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <option selected>Buy</option>
                      <option>Sell</option>
                      <option>Buy to Cover</option>
                      <option>Sell Short</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Type</label>
                    <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <option selected>Market</option>
                      <option>Limit</option>
                      <option>Stop</option>
                      <option>Stop Limit</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                    <input type="number" value="10" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                    <input type="number" value="187.42" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time in Force</label>
                    <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <option selected>Day</option>
                      <option>GTC</option>
                      <option>Fill or Kill</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total</label>
                    <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      $1,874.20
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg">
                    Place Order
                  </button>
                </div>
              </div>
            </div>
            
            {/* Open Positions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold">Open Positions</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium">MSFT</td>
                      <td className="px-4 py-3 whitespace-nowrap">15</td>
                      <td className="px-4 py-3 whitespace-nowrap">$412.65</td>
                      <td className="px-4 py-3 whitespace-nowrap">$418.32</td>
                      <td className="px-4 py-3 whitespace-nowrap text-green-500">+$85.05 (1.37%)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium">NVDA</td>
                      <td className="px-4 py-3 whitespace-nowrap">8</td>
                      <td className="px-4 py-3 whitespace-nowrap">$924.18</td>
                      <td className="px-4 py-3 whitespace-nowrap">$950.02</td>
                      <td className="px-4 py-3 whitespace-nowrap text-green-500">+$206.72 (2.80%)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium">AMZN</td>
                      <td className="px-4 py-3 whitespace-nowrap">12</td>
                      <td className="px-4 py-3 whitespace-nowrap">$178.25</td>
                      <td className="px-4 py-3 whitespace-nowrap">$175.80</td>
                      <td className="px-4 py-3 whitespace-nowrap text-red-500">-$29.40 (-1.37%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">10:32 AM</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">AAPL</td>
                      <td className="px-4 py-3 whitespace-nowrap">Buy</td>
                      <td className="px-4 py-3 whitespace-nowrap">$187.42</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Filled
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">9:45 AM</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">TSLA</td>
                      <td className="px-4 py-3 whitespace-nowrap">Sell</td>
                      <td className="px-4 py-3 whitespace-nowrap">$245.18</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Filled
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">9:30 AM</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">META</td>
                      <td className="px-4 py-3 whitespace-nowrap">Buy</td>
                      <td className="px-4 py-3 whitespace-nowrap">$478.50</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Pending
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GeneralTradingWorkspace;
