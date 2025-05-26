import React from 'react';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const IntradayTrading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-secondary-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Intraday Trading</h1>
        
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
                <p className="text-gray-500 dark:text-gray-400">Intraday chart visualization</p>
              </div>
              
              <div className="flex space-x-2 mb-4">
                <button className="px-3 py-1 text-sm bg-primary text-white rounded">1m</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">5m</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">15m</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">30m</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">1h</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">4h</button>
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
                <h3 className="text-lg font-semibold mb-4">Level 2 Order Book</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <span>Price</span>
                      <span>Size</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-red-500">
                        <span>$182.65</span>
                        <span>1,245</span>
                      </div>
                      <div className="flex justify-between text-sm text-red-500">
                        <span>$182.67</span>
                        <span>3,782</span>
                      </div>
                      <div className="flex justify-between text-sm text-red-500">
                        <span>$182.70</span>
                        <span>5,120</span>
                      </div>
                      <div className="flex justify-between text-sm text-red-500">
                        <span>$182.72</span>
                        <span>2,340</span>
                      </div>
                      <div className="flex justify-between text-sm text-red-500">
                        <span>$182.75</span>
                        <span>8,765</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <span>Price</span>
                      <span>Size</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-green-500">
                        <span>$182.62</span>
                        <span>2,345</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-500">
                        <span>$182.60</span>
                        <span>4,567</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-500">
                        <span>$182.58</span>
                        <span>3,210</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-500">
                        <span>$182.55</span>
                        <span>6,789</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-500">
                        <span>$182.52</span>
                        <span>1,234</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Time & Sales</h3>
                <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  <span>Time</span>
                  <span>Price</span>
                  <span>Size</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  <div className="flex justify-between text-sm">
                    <span>10:24:35</span>
                    <span className="text-green-500">$182.63</span>
                    <span>100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>10:24:28</span>
                    <span className="text-red-500">$182.61</span>
                    <span>250</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>10:24:15</span>
                    <span className="text-green-500">$182.62</span>
                    <span>500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>10:24:08</span>
                    <span className="text-green-500">$182.64</span>
                    <span>150</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>10:23:57</span>
                    <span className="text-red-500">$182.60</span>
                    <span>300</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>10:23:45</span>
                    <span className="text-green-500">$182.62</span>
                    <span>200</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>10:23:32</span>
                    <span className="text-red-500">$182.59</span>
                    <span>175</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">RSI (14)</div>
                  <div className="font-medium">62.5</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Neutral</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">MACD</div>
                  <div className="font-medium text-green-500">Bullish</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Crossover</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Stochastic</div>
                  <div className="font-medium">78.3</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Overbought</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Bollinger Bands</div>
                  <div className="font-medium">Upper Band</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Resistance</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Order Entry</h3>
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
              <h3 className="text-lg font-semibold mb-4">Hotkeys</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Buy Market</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Shift+B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Sell Market</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Shift+S</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Cancel All</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Esc</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Increase Qty</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Ctrl+Up</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Decrease Qty</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Ctrl+Down</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Open Orders</h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Buy AAPL</div>
                    <button className="text-xs text-red-500 hover:text-red-700">Cancel</button>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Limit: $182.50 × 100
                  </div>
                </div>
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Sell AAPL</div>
                    <button className="text-xs text-red-500 hover:text-red-700">Cancel</button>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Limit: $183.00 × 50
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

export default IntradayTrading;
