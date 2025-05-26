import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-secondary-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{symbol || 'AAPL'}</h1>
            <p className="text-gray-600 dark:text-gray-400">Apple Inc.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-3xl font-bold">$182.63</div>
            <div className="flex items-center text-green-500">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-medium">+$4.28 (2.34%)</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Price Chart</h2>
              <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Stock price chart visualization</p>
              </div>
              <div className="flex mt-4 space-x-2">
                <button className="px-3 py-1 text-sm bg-primary text-white rounded">1D</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">1W</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">1M</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">3M</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">1Y</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">5Y</button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Key Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</h3>
                  <div className="text-lg font-medium">$2.85T</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">P/E Ratio</h3>
                  <div className="text-lg font-medium">30.42</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dividend Yield</h3>
                  <div className="text-lg font-medium">0.54%</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">52-Week High</h3>
                  <div className="text-lg font-medium">$198.23</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">52-Week Low</h3>
                  <div className="text-lg font-medium">$142.18</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Volume</h3>
                  <div className="text-lg font-medium">58.32M</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. It also sells various related services. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">CEO</h3>
                  <div className="text-base">Tim Cook</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Headquarters</h3>
                  <div className="text-base">Cupertino, California</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Founded</h3>
                  <div className="text-base">April 1, 1976</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Employees</h3>
                  <div className="text-base">154,000</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Trading</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="orderType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order Type
                  </label>
                  <select
                    id="orderType"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                  >
                    <option>Market</option>
                    <option>Limit</option>
                    <option>Stop</option>
                    <option>Stop Limit</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    defaultValue={10}
                    min={1}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Buy
                  </button>
                  <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Sell
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Technical Outlook</h3>
                  <div className="flex items-center mt-1">
                    <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-green-600">Bullish</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sentiment Analysis</h3>
                  <div className="flex items-center mt-1">
                    <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-green-600">Positive</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Volatility</h3>
                  <div className="flex items-center mt-1">
                    <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-yellow-500">Moderate</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Recommendation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Based on technical patterns and market sentiment, our AI suggests a <span className="font-medium text-green-600">Buy</span> with a price target of $195.50 (7% upside potential).
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">News</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-base font-medium">Apple Announces New MacBook Pro with M3 Chip</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">2 hours ago</p>
                </div>
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-base font-medium">Q2 Earnings Beat Expectations, Services Revenue Hits Record High</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">1 day ago</p>
                </div>
                <div>
                  <h3 className="text-base font-medium">Apple's AI Strategy: What to Expect at WWDC</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">2 days ago</p>
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

export default StockDetailPage;
