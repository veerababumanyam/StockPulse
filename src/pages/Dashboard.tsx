import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-secondary-900" id="dashboard-content">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your market overview.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="px-4 py-2 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <svg className="w-4 h-4 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            <button className="px-4 py-2 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <svg className="w-4 h-4 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Watchlist
            </button>
          </div>
        </div>
        
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
            <h2 className="text-lg font-semibold mb-2">Portfolio Value</h2>
            <div className="text-2xl font-bold">$124,568.92</div>
            <div className="flex items-center text-green-500 text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>+2.34% (+$2,845.67)</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">AI Signals</h2>
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              5 buy, 2 sell, 1 hold
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Market Overview</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-primary text-white rounded">1D</button>
                  <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">1W</button>
                  <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">1M</button>
                  <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">3M</button>
                  <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">1Y</button>
                </div>
              </div>
              <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Market chart visualization</p>
              </div>
            </div>
            
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Volume</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">AI Signal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-gray-700">
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
                          <span>+4.56%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">35.78M</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Strong Buy
                        </span>
                      </td>
                    </tr>
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
                          <span>+2.34%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">58.32M</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Buy
                        </span>
                      </td>
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
                          <span>+1.12%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">25.67M</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Hold
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium">META</div>
                          <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">Meta Platforms Inc.</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">$478.22</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-red-500 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                          </svg>
                          <span>-1.87%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">22.45M</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Sell
                        </span>
                      </td>
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
                          <span>+3.21%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">42.19M</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Buy
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
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
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
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
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Market News</h2>
                <button className="text-sm text-primary hover:text-primary-600">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-base font-medium">Fed Signals Potential Rate Cut in September Meeting</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">2 hours ago</p>
                </div>
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-base font-medium">NVIDIA Announces New AI Chip, Stock Surges</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">4 hours ago</p>
                </div>
                <div>
                  <h3 className="text-base font-medium">Apple's Services Revenue Hits Record High in Q2</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">6 hours ago</p>
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

export default Dashboard;
