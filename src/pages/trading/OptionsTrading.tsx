import React from 'react';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const OptionsTrading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-secondary-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Options Trading</h1>
        
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
              
              <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Options chain visualization</p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <button className="px-3 py-1 text-sm bg-primary text-white rounded">Jun 21, 2025</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">Jul 19, 2025</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">Aug 16, 2025</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">Sep 20, 2025</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">Dec 19, 2025</button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">Jan 16, 2026</button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">Options Chain - June 21, 2025</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-secondary-700">
                    <tr>
                      <th colSpan={5} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                        Calls
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Strike
                      </th>
                      <th colSpan={5} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-200 dark:border-gray-700">
                        Puts
                      </th>
                    </tr>
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bid</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ask</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">Volume</th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-200 dark:border-gray-700">Last</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bid</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ask</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">12.45</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">+0.85</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">12.35</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">12.55</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-200 dark:border-gray-700">345</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">$170.00</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm border-l border-gray-200 dark:border-gray-700">1.25</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">-0.15</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">1.20</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">1.30</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">128</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">9.80</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">+0.65</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">9.70</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">9.90</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-200 dark:border-gray-700">512</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">$175.00</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm border-l border-gray-200 dark:border-gray-700">2.10</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">-0.20</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">2.05</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">2.15</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">245</td>
                    </tr>
                    <tr className="bg-blue-50 dark:bg-blue-900/20">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">7.25</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">+0.45</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">7.15</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">7.35</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-200 dark:border-gray-700">876</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">$180.00</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm border-l border-gray-200 dark:border-gray-700">3.45</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">-0.30</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">3.40</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">3.50</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">567</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">4.85</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">+0.35</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">4.75</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">4.95</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-200 dark:border-gray-700">1245</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">$185.00</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm border-l border-gray-200 dark:border-gray-700">5.20</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">-0.40</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">5.15</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">5.25</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">890</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">2.95</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">+0.25</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">2.90</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">3.00</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-200 dark:border-gray-700">1567</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">$190.00</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm border-l border-gray-200 dark:border-gray-700">7.65</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">-0.55</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">7.60</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">7.70</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">765</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Options Strategy Builder</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Strategy Type
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                  >
                    <option>Long Call</option>
                    <option>Long Put</option>
                    <option>Covered Call</option>
                    <option>Cash-Secured Put</option>
                    <option>Bull Call Spread</option>
                    <option>Bear Put Spread</option>
                    <option>Iron Condor</option>
                    <option>Butterfly</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expiration Date
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                    >
                      <option>Jun 21, 2025</option>
                      <option>Jul 19, 2025</option>
                      <option>Aug 16, 2025</option>
                      <option>Sep 20, 2025</option>
                      <option>Dec 19, 2025</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Strike Price
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                    >
                      <option>$170.00</option>
                      <option>$175.00</option>
                      <option>$180.00</option>
                      <option>$185.00</option>
                      <option>$190.00</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    defaultValue={1}
                    min={1}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="button"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Calculate Strategy
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Strategy Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Strategy</div>
                  <div className="font-medium">Long Call</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Max Profit</div>
                  <div className="font-medium text-green-500">Unlimited</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Max Loss</div>
                  <div className="font-medium text-red-500">$725.00</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Break-even</div>
                  <div className="font-medium">$187.25</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Probability of Profit</div>
                  <div className="font-medium">42%</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Return on Investment</div>
                  <div className="font-medium">138%</div>
                </div>
                
                <div className="pt-2">
                  <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Profit/Loss graph</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Greeks</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Delta</div>
                  <div className="font-medium">0.52</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Gamma</div>
                  <div className="font-medium">0.04</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Theta</div>
                  <div className="font-medium">-0.08</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Vega</div>
                  <div className="font-medium">0.15</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Rho</div>
                  <div className="font-medium">0.05</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Implied Volatility</div>
                  <div className="font-medium">32.5%</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Order Entry</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order Type
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                  >
                    <option>Limit</option>
                    <option>Market</option>
                    <option>Stop</option>
                    <option>Stop Limit</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    defaultValue={7.25}
                    step={0.05}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Place Order
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

export default OptionsTrading;
