import React from 'react';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const PositionalTrading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-secondary-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Positional Trading</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold">AAPL</h2>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Apple Inc.</span>
                </div>
                <div className="flex items-center">
                  <div className="text-2xl font-bold mr-2">$182.63</div>
                  <div className="flex items-center text-green-500">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="font-medium">+2.34%</span>
                  </div>
                </div>
              </div>
              
              <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Multi-day chart visualization</p>
              </div>
              
              <div className="flex space-x-2 mb-4">
                <button className="px-3 py-1 text-sm bg-primary text-white rounded">1D</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">5D</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">1M</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">3M</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">6M</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">YTD</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">1Y</button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Open</div>
                  <div className="font-medium">$178.35</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">High</div>
                  <div className="font-medium">$183.12</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Low</div>
                  <div className="font-medium">$177.90</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Volume</div>
                  <div className="font-medium">12.4M</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Technical Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Moving Averages</span>
                      <span className="text-sm font-medium text-green-500">Buy</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Sell (3)</span>
                      <span>Neutral (2)</span>
                      <span>Buy (7)</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Oscillators</span>
                      <span className="text-sm font-medium text-yellow-500">Neutral</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Sell (2)</span>
                      <span>Neutral (6)</span>
                      <span>Buy (3)</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pivot Points</span>
                      <span className="text-sm font-medium text-green-500">Above</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-xs">
                      <div className="text-center">
                        <div className="mb-1 text-gray-500 dark:text-gray-400">R2</div>
                        <div>$186.45</div>
                      </div>
                      <div className="text-center">
                        <div className="mb-1 text-gray-500 dark:text-gray-400">R1</div>
                        <div>$184.78</div>
                      </div>
                      <div className="text-center bg-gray-100 dark:bg-gray-700 rounded py-1">
                        <div className="mb-1 text-gray-500 dark:text-gray-400">Pivot</div>
                        <div className="font-medium">$181.25</div>
                      </div>
                      <div className="text-center">
                        <div className="mb-1 text-gray-500 dark:text-gray-400">S1</div>
                        <div>$179.58</div>
                      </div>
                      <div className="text-center">
                        <div className="mb-1 text-gray-500 dark:text-gray-400">S2</div>
                        <div>$176.35</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Key Indicators</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">RSI (14)</div>
                      <div className="font-medium">58.3</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Neutral</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">MACD</div>
                      <div className="font-medium text-green-500">Bullish</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Signal: 0.85</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Stochastic</div>
                      <div className="font-medium">65.7</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Neutral</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ADX</div>
                      <div className="font-medium">28.4</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Strong Trend</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Moving Averages</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">MA (20)</span>
                        <span className="text-sm text-green-500">$178.45 (Above)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">MA (50)</span>
                        <span className="text-sm text-green-500">$175.32 (Above)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">MA (100)</span>
                        <span className="text-sm text-green-500">$172.18 (Above)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">MA (200)</span>
                        <span className="text-sm text-green-500">$168.75 (Above)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Pattern Recognition</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Bullish Engulfing Pattern</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Detected on May 24, 2025. This pattern suggests a potential reversal from a downtrend to an uptrend.
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Golden Cross</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      50-day moving average crossed above the 200-day moving average on May 15, 2025, indicating a potential long-term bullish trend.
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
                    <div className="font-medium">Approaching Resistance</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Price is approaching a key resistance level at $185.50, which has been tested twice in the past month.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Trade Setup</h3>
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
                    defaultValue={100}
                    min={1}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    defaultValue={182.63}
                    step={0.01}
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
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Risk Management</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="stopLoss" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stop Loss
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="stopLoss"
                      defaultValue={178.50}
                      step={0.01}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                    />
                    <div className="ml-2 text-sm text-red-500">-2.26%</div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="takeProfit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Take Profit
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="takeProfit"
                      defaultValue={190.00}
                      step={0.01}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                    />
                    <div className="ml-2 text-sm text-green-500">+4.04%</div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="riskReward" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Risk/Reward Ratio
                  </label>
                  <div className="text-lg font-medium">1:1.79</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Risk: $413.00 | Reward: $738.00
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Trend Analysis</div>
                  <div className="flex items-center mt-1">
                    <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-green-600">Bullish</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Sentiment Analysis</div>
                  <div className="flex items-center mt-1">
                    <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-green-600">Positive</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Volatility</div>
                  <div className="flex items-center mt-1">
                    <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-yellow-500">Moderate</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Recommendation</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Based on technical patterns and market sentiment, our AI suggests a <span className="font-medium text-green-600">Buy</span> with a price target of $190.00 (4.04% upside potential) over the next 2-3 weeks.
                  </p>
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

export default PositionalTrading;
