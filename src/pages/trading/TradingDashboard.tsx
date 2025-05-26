import React from 'react';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import { Link } from 'react-router-dom';

const TradingDashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-secondary-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Trading Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Market Status</h2>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-500 font-medium">Market Open</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Closes in 3h 45m
            </div>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">S&P 500</h2>
            <div className="text-2xl font-bold">4,782.36</div>
            <div className="flex items-center text-green-500 text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>+1.23% (+58.12)</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Today's P/L</h2>
            <div className="text-2xl font-bold text-green-500">+$1,245.67</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              +2.34% today
            </div>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Open Positions</h2>
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              6 profitable
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Trading Modules</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/trading/intraday" className="block bg-gray-50 dark:bg-secondary-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-secondary-600 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Intraday Trading</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Day trading with real-time data</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/trading/options" className="block bg-gray-50 dark:bg-secondary-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-secondary-600 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Options Trading</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Advanced options strategies</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/trading/positional" className="block bg-gray-50 dark:bg-secondary-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-secondary-600 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Positional Trading</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Multi-day holding strategies</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/trading/long-term" className="block bg-gray-50 dark:bg-secondary-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-secondary-600 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Long-term Investing</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fundamental analysis focused</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Watchlists</h2>
                <button className="text-sm text-primary hover:text-primary-600">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Tech Stocks</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5 symbols</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-500">+2.4%</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Dividend Stocks</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">8 symbols</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-500">+0.8%</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Growth Stocks</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">6 symbols</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-red-500">-1.2%</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Earnings Watch</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">4 symbols</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-500">+3.5%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Trades</h2>
              <button className="text-sm text-primary hover:text-primary-600">
                View All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-secondary-700">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">AAPL</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">Buy</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">10</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">$182.63</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">10:24 AM</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">TSLA</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">Sell</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">15</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">$245.17</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">9:45 AM</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">NVDA</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">Buy</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">5</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">$924.73</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Yesterday</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">AMD</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">Sell</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">20</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">$156.78</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Yesterday</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">AI Trading Signals</h2>
              <button className="text-sm text-primary hover:text-primary-600">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center">
                    <div className="text-sm font-medium">NVDA: Buy Signal</div>
                    <div className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                      Strong
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Bullish momentum detected with increasing volume
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    15 minutes ago
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full mr-3">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center">
                    <div className="text-sm font-medium">META: Sell Signal</div>
                    <div className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full">
                      Moderate
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Bearish divergence on RSI indicator
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    45 minutes ago
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full mr-3">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center">
                    <div className="text-sm font-medium">AAPL: Watch</div>
                    <div className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full">
                      Alert
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Approaching key resistance level at $185
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    1 hour ago
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center">
                    <div className="text-sm font-medium">MSFT: Earnings Alert</div>
                    <div className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                      Info
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Earnings report scheduled for tomorrow after market close
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    2 hours ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TradingDashboard;
