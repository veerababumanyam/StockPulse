import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import DCFCalculator from '../../components/trading/longterm/DCFCalculator';
import DividendChart from '../../components/trading/longterm/DividendChart';
import { TrendingUp, Calendar, DollarSign, BarChart2, PieChart, Info } from 'lucide-react';

const LongTermInvesting: React.FC = () => {
  const { colorTheme } = useTheme();
  const navigate = useNavigate();
  const [activeSymbol, setActiveSymbol] = useState<string>('AAPL');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'BRK.B']);
  
  // Mock stock data
  const stockData = {
    AAPL: { name: 'Apple Inc.', price: 182.63, change: 1.25, changePercent: 0.69, pe: 30.2, dividend: 0.96, yield: 0.53 },
    MSFT: { name: 'Microsoft Corp.', price: 337.22, change: -2.15, changePercent: -0.63, pe: 33.8, dividend: 3.00, yield: 0.89 },
    GOOGL: { name: 'Alphabet Inc.', price: 131.86, change: 0.54, changePercent: 0.41, pe: 25.1, dividend: 0, yield: 0 },
    AMZN: { name: 'Amazon.com Inc.', price: 178.22, change: 3.45, changePercent: 1.97, pe: 78.3, dividend: 0, yield: 0 },
    'BRK.B': { name: 'Berkshire Hathaway', price: 406.11, change: -1.02, changePercent: -0.25, pe: 8.5, dividend: 0, yield: 0 },
  };

  // Get primary color based on current theme
  const getPrimaryColor = () => {
    switch (colorTheme) {
      case 'tropical-jungle':
        return '#29A329';
      case 'ocean-sunset':
        return '#008B8B';
      case 'desert-storm':
        return '#C19A6B';
      case 'berry-fields':
        return '#8E4585';
      case 'arctic-moss':
        return '#4682B4';
      default:
        return '#FF1493';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Left Sidebar */}
          <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Long-Term Portfolio</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Watchlist</h3>
                <div className="space-y-2">
                  {watchlist.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setActiveSymbol(symbol)}
                      className={`w-full flex justify-between items-center p-2 rounded-md text-sm ${
                        activeSymbol === symbol 
                          ? `bg-${getPrimaryColor().replace('#', '')}/10 text-${getPrimaryColor().replace('#', '')}` 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="font-medium">{symbol}</span>
                      <span className={`${
                        stockData[symbol as keyof typeof stockData].change >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {stockData[symbol as keyof typeof stockData].changePercent >= 0 ? '+' : ''}
                        {stockData[symbol as keyof typeof stockData].changePercent.toFixed(2)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Investment Strategies</h3>
                <div className="space-y-1">
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    Value Investing
                  </button>
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    Dividend Growth
                  </button>
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    Index Investing
                  </button>
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    Growth Investing
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tools</h3>
                <div className="space-y-1">
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Portfolio Analyzer
                  </button>
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <PieChart className="w-4 h-4 mr-2" />
                    Asset Allocation
                  </button>
                  <button className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Retirement Calculator
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{stockData[activeSymbol as keyof typeof stockData].name} ({activeSymbol})</h1>
                  <div className="flex items-center mt-1">
                    <span className="text-xl font-semibold">${stockData[activeSymbol as keyof typeof stockData].price.toFixed(2)}</span>
                    <span className={`ml-2 ${
                      stockData[activeSymbol as keyof typeof stockData].change >= 0 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {stockData[activeSymbol as keyof typeof stockData].change >= 0 ? '+' : ''}
                      {stockData[activeSymbol as keyof typeof stockData].change.toFixed(2)} ({stockData[activeSymbol as keyof typeof stockData].changePercent >= 0 ? '+' : ''}
                      {stockData[activeSymbol as keyof typeof stockData].changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium">
                    Add to Portfolio
                  </button>
                  <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm font-medium">
                    Set Alert
                  </button>
                </div>
              </div>
              
              <div className="flex border-b border-gray-200 dark:border-gray-700 mt-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('valuation')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'valuation'
                      ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Valuation
                </button>
                <button
                  onClick={() => setActiveTab('dividends')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'dividends'
                      ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Dividends
                </button>
                <button
                  onClick={() => setActiveTab('financials')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'financials'
                      ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Financials
                </button>
              </div>
            </div>
            
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-semibold mb-4">Company Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</h3>
                      <p className="text-lg font-semibold">$2.85T</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">P/E Ratio</h3>
                      <p className="text-lg font-semibold">{stockData[activeSymbol as keyof typeof stockData].pe}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dividend Yield</h3>
                      <p className="text-lg font-semibold">{stockData[activeSymbol as keyof typeof stockData].yield}%</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">52-Week Range</h3>
                      <p className="text-lg font-semibold">$124.17 - $198.23</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Beta</h3>
                      <p className="text-lg font-semibold">1.28</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Volume</h3>
                      <p className="text-lg font-semibold">59.8M</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">About {stockData[activeSymbol as keyof typeof stockData].name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod. It also provides AppleCare support and cloud services; and operates various platforms, including the App Store that allow customers to discover and download applications and digital content, such as books, music, video, games, and podcasts.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-semibold mb-4">Long-Term Investment Thesis</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Growth Potential</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Strong ecosystem and services growth provide long-term revenue expansion opportunities beyond hardware cycles.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                        <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Financial Strength</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Exceptional balance sheet with over $200B in cash and investments provides stability and flexibility for capital returns.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                        <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Competitive Advantage</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Brand loyalty, ecosystem lock-in, and vertical integration create sustainable competitive moats against competitors.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium mb-2">Long-Term Outlook</h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">85/100</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      Strong long-term outlook based on ecosystem strength, services growth, and potential new product categories.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'valuation' && (
              <div className="space-y-6">
                <DCFCalculator symbol={activeSymbol} currentPrice={stockData[activeSymbol as keyof typeof stockData].price} />
              </div>
            )}
            
            {activeTab === 'dividends' && (
              <div className="space-y-6">
                <DividendChart symbol={activeSymbol} currentPrice={stockData[activeSymbol as keyof typeof stockData].price} />
              </div>
            )}
            
            {activeTab === 'financials' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-semibold mb-4">Financial Statements</h2>
                  
                  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary-500 text-primary-600 dark:text-primary-400">
                      Income Statement
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      Balance Sheet
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      Cash Flow
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Fiscal Year
                          </th>
                          <th className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            2023
                          </th>
                          <th className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            2022
                          </th>
                          <th className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            2021
                          </th>
                          <th className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            2020
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Revenue
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $394.33B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $365.82B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $365.82B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $274.52B
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Gross Profit
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $170.78B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $162.13B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $152.84B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $104.96B
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Operating Income
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $114.30B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $109.20B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $108.95B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $66.29B
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Net Income
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $96.99B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $99.80B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $94.68B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $57.41B
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            EPS (Diluted)
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $6.14
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $6.11
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $5.61
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $3.28
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Dividends Per Share
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $0.96
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $0.92
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $0.85
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            $0.82
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    All figures in USD. Fiscal year ends in September.
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-semibold mb-4">Financial Ratios</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Return on Equity (ROE)</h3>
                      <p className="text-lg font-semibold">147.9%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5-Year Average: 120.3%</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Return on Assets (ROA)</h3>
                      <p className="text-lg font-semibold">28.3%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5-Year Average: 24.1%</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit Margin</h3>
                      <p className="text-lg font-semibold">24.6%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5-Year Average: 22.8%</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Debt to Equity</h3>
                      <p className="text-lg font-semibold">1.52</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5-Year Average: 1.38</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Ratio</h3>
                      <p className="text-lg font-semibold">1.07</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5-Year Average: 1.12</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payout Ratio</h3>
                      <p className="text-lg font-semibold">15.6%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5-Year Average: 16.2%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LongTermInvesting;
