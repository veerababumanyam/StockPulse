import React from 'react';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const PortfolioPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-secondary-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Portfolio</h1>
        
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</h3>
              <div className="text-2xl font-bold">$124,568.92</div>
              <div className="flex items-center text-green-500 text-sm mt-1">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>$1,245.32 (1.01%)</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Day Change</h3>
              <div className="text-2xl font-bold text-green-500">+$2,345.67</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">+1.92% today</div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Positions</h3>
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">8 profitable</div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cash Balance</h3>
              <div className="text-2xl font-bold">$15,432.87</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">12.39% of portfolio</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-secondary-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shares</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Cost</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market Value</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gain/Loss</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">50</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$165.32</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$182.63</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$9,131.50</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-green-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>$865.50 (10.47%)</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium">MSFT</div>
                      <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">Microsoft Corp.</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">25</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$380.45</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$415.32</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$10,383.00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-green-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>$871.75 (9.17%)</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium">GOOGL</div>
                      <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">Alphabet Inc.</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">30</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$180.23</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$175.98</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$5,279.40</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-red-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                      </svg>
                      <span>-$127.50 (-2.36%)</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium">AMZN</div>
                      <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">Amazon.com Inc.</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$165.78</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$178.15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$2,672.25</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-green-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>$185.55 (7.46%)</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium">NVDA</div>
                      <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">NVIDIA Corp.</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$850.32</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$924.73</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">$9,247.30</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-green-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>$744.10 (8.75%)</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PortfolioPage;
