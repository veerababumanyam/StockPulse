import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar transparent={true} />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-40 bg-gradient-to-b from-secondary-900 to-secondary-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:30px_30px]"></div>
          <div className="absolute h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,26,108,0.15),transparent_65%)]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div 
              className="lg:w-1/2 text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                AI-Powered <span className="text-primary">Stock Analysis</span> Platform
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Harness the power of AI to analyze markets, optimize your trading strategies, and make data-driven investment decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/auth/register" className="px-8 py-3 bg-primary hover:bg-primary-600 text-white font-medium rounded-md transition-colors">
                  Get Started
                </Link>
                <Link to="/dashboard" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md transition-colors">
                  Live Demo
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative bg-secondary-800 p-4 rounded-xl border border-gray-700 shadow-glow">
                <div className="absolute -top-3 -left-3 bg-primary rounded-full w-6 h-6"></div>
                <div className="absolute -bottom-3 -right-3 bg-accent rounded-full w-6 h-6"></div>
                <img 
                  src="/dashboard-preview.png" 
                  alt="StockPulse Dashboard Preview" 
                  className="rounded-lg w-full shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Trading Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              StockPulse combines cutting-edge technology with intuitive design to deliver a comprehensive trading experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access real-time market data, price movements, and volume analysis to make informed trading decisions.
              </p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Trading Agents</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Leverage AI-powered trading agents that analyze patterns and suggest optimal entry and exit points.
              </p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Screeners</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find the best trading opportunities with customizable stock screeners based on technical and fundamental criteria.
              </p>
            </motion.div>
            
            {/* Feature 4 */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Portfolio Management</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track your investments, analyze performance, and optimize your portfolio allocation for better returns.
              </p>
            </motion.div>
            
            {/* Feature 5 */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Technical Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access over 50+ technical indicators and drawing tools to perform comprehensive chart analysis.
              </p>
            </motion.div>
            
            {/* Feature 6 */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Customizable Workspace</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Personalize your trading environment with drag-and-drop widgets and multiple layout options.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Trading Modules Preview */}
      <section className="py-20 bg-gray-50 dark:bg-secondary-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Specialized Trading Modules</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              StockPulse offers tailored trading interfaces for every type of trader and investment strategy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Intraday Trading */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 rounded-xl overflow-hidden shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Intraday Trading</div>
                  <div className="text-gray-500 dark:text-gray-400">Ultra-responsive interface for day traders</div>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Real-time Level 2 order book</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Time & sales feed</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Hotkey trading setup</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Momentum scanners</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/trading/intraday" className="inline-flex items-center text-primary hover:text-primary-600">
                    Explore Intraday Trading
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
            
            {/* Options Trading */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 rounded-xl overflow-hidden shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Options Trading</div>
                  <div className="text-gray-500 dark:text-gray-400">Multi-leg strategy builder</div>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Options chain visualization</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Greeks analysis</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Strategy payoff diagrams</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Volatility surface analysis</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/trading/options" className="inline-flex items-center text-primary hover:text-primary-600">
                    Explore Options Trading
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
            
            {/* Positional Trading */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 rounded-xl overflow-hidden shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Positional Trading</div>
                  <div className="text-gray-500 dark:text-gray-400">Multi-timeframe analysis</div>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Trend alignment indicators</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Support/resistance detection</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Pattern recognition</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Sector rotation analysis</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/trading/positional" className="inline-flex items-center text-primary hover:text-primary-600">
                    Explore Positional Trading
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
            
            {/* Long-term Investment */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 rounded-xl overflow-hidden shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Long-term Investment</div>
                  <div className="text-gray-500 dark:text-gray-400">Fundamental analysis focused</div>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Financial statement analysis</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Valuation models</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Dividend analysis</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Economic cycle indicators</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/trading/long-term" className="inline-flex items-center text-primary hover:text-primary-600">
                    Explore Long-term Investment
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your trading needs and scale as you grow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-2">Basic</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Perfect for beginners and casual traders.
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Real-time market data</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Basic technical indicators</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Portfolio tracking</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>1 AI trading agent</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Advanced screeners</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Options analysis tools</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/auth/register" className="block w-full py-2 px-4 bg-primary hover:bg-primary-600 text-white text-center font-medium rounded-md transition-colors">
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
            
            {/* Pro Plan */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 rounded-xl overflow-hidden shadow-lg border-2 border-primary relative transform scale-105"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">$79</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  For active traders seeking an edge.
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Advanced technical indicators</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Options analysis tools</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>3 AI trading agents</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Advanced screeners</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Automated trading strategies</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/auth/register" className="block w-full py-2 px-4 bg-primary hover:bg-primary-600 text-white text-center font-medium rounded-md transition-colors">
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
            
            {/* Enterprise Plan */}
            <motion.div 
              className="bg-white dark:bg-secondary-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">$199</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  For professional traders and institutions.
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unlimited AI trading agents</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Automated trading strategies</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>API access</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Custom integrations</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/auth/register" className="block w-full py-2 px-4 bg-primary hover:bg-primary-600 text-white text-center font-medium rounded-md transition-colors">
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Trading?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of traders who are already using StockPulse to make smarter, data-driven investment decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register" className="px-8 py-3 bg-white text-primary hover:bg-gray-100 font-medium rounded-md transition-colors">
              Start Free Trial
            </Link>
            <Link to="/dashboard" className="px-8 py-3 bg-transparent border border-white hover:bg-white/10 text-white font-medium rounded-md transition-colors">
              View Demo
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
