import React from 'react';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const LongTermInvesting: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-secondary-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Long-Term Investing</h1>
        
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
                <p className="text-gray-500 dark:text-gray-400">Long-term chart visualization</p>
              </div>
              
              <div className="flex space-x-2 mb-4">
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">1M</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">3M</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">6M</button>
                <button className="px-3 py-1 text-sm bg-primary text-white rounded">1Y</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">3Y</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">5Y</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">10Y</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">All</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Fundamental Analysis</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap</div>
                      <div className="font-medium">$2.85T</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">P/E Ratio</div>
                      <div className="font-medium">30.42</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">EPS (TTM)</div>
                      <div className="font-medium">$6.00</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Dividend Yield</div>
                      <div className="font-medium">0.54%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Beta</div>
                      <div className="font-medium">1.28</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">52-Week Range</div>
                      <div className="font-medium">$142.18 - $198.23</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Valuation</div>
                    <div className="flex items-center">
                      <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-yellow-500">Fairly Valued</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Trading at 5% premium to sector average
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Financial Health</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Revenue (TTM)</div>
                      <div className="font-medium">$394.33B</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Revenue Growth</div>
                      <div className="font-medium text-green-500">+8.13%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Profit Margin</div>
                      <div className="font-medium">25.31%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Debt to Equity</div>
                      <div className="font-medium">1.53</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ROE</div>
                      <div className="font-medium">160.09%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Free Cash Flow</div>
                      <div className="font-medium">$90.22B</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Financial Strength</div>
                    <div className="flex items-center">
                      <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-green-600">Strong</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Excellent cash position and consistent profitability
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Growth Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Revenue Growth (YoY)</div>
                    <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">Revenue growth chart</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">EPS Growth (5Y)</div>
                      <div className="font-medium text-green-500">+15.43%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Revenue Growth (5Y)</div>
                      <div className="font-medium text-green-500">+11.78%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Dividend Growth (5Y)</div>
                      <div className="font-medium text-green-500">+7.32%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">EBITDA Growth (5Y)</div>
                      <div className="font-medium text-green-500">+13.25%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Analyst Ratings</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Strong Sell</span>
                    <span>Sell</span>
                    <span>Hold</span>
                    <span>Buy</span>
                    <span>Strong Buy</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-md py-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Sell</div>
                      <div className="font-medium">2</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-md py-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Hold</div>
                      <div className="font-medium">8</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-md py-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Buy</div>
                      <div className="font-medium">22</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Average Price Target</div>
                    <div className="font-medium">$210.45</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      15.23% upside potential
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Company Overview</h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. It also sells various related services. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">CEO</div>
                    <div className="font-medium">Tim Cook</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Headquarters</div>
                    <div className="font-medium">Cupertino, California</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Founded</div>
                    <div className="font-medium">April 1, 1976</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Employees</div>
                    <div className="font-medium">154,000</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Business Segments</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">iPhone</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '52%' }}></div>
                        </div>
                        <span className="text-xs">52%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Services</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '21%' }}></div>
                        </div>
                        <span className="text-xs">21%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mac</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                        <span className="text-xs">10%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">iPad</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '9%' }}></div>
                        </div>
                        <span className="text-xs">9%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Wearables, Home & Accessories</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: '8%' }}></div>
                        </div>
                        <span className="text-xs">8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Investment Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Overall Rating</div>
                  <div className="flex items-center mt-1">
                    <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-green-600">Buy</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Long-term Outlook</div>
                  <div className="flex items-center mt-1">
                    <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-green-600">Strong</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Risk Level</div>
                  <div className="flex items-center mt-1">
                    <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-yellow-500">Moderate</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Thesis</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Apple continues to demonstrate strong fundamentals with consistent revenue growth, high profit margins, and a robust services ecosystem. The company's loyal customer base, strong brand, and innovation pipeline support long-term growth prospects. Services revenue is expected to be a key growth driver, potentially reaching 30% of total revenue within 5 years.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Dividend Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Dividend Yield</div>
                    <div className="font-medium">0.54%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Annual Dividend</div>
                    <div className="font-medium">$0.96</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Payout Ratio</div>
                    <div className="font-medium">16.00%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Ex-Dividend Date</div>
                    <div className="font-medium">May 10, 2025</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dividend Growth</div>
                  <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Dividend growth chart</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Long-Term Order</h3>
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
                
                <div>
                  <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Investment Amount
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">$</span>
                    <input
                      type="number"
                      id="investmentAmount"
                      defaultValue={1826.30}
                      step={0.01}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Place Long-Term Order
                  </button>
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

export default LongTermInvesting;
