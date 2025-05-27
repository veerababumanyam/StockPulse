import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ScalpingChartProps {
  symbol: string;
  timeframe?: '1m' | '2m' | '5m';
  height?: number;
  showVolume?: boolean;
  showGrid?: boolean;
}

const ScalpingChart: React.FC<ScalpingChartProps> = ({
  symbol,
  timeframe = '1m',
  height = 400,
  showVolume = true,
  showGrid = true
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock data generation for demonstration
  useEffect(() => {
    setLoading(true);
    
    // Generate mock price data
    const generateMockData = () => {
      const now = new Date();
      const data = [];
      let price = Math.random() * 100 + 100; // Random starting price between 100-200
      
      // Generate data points for the last 60 intervals (e.g., minutes)
      for (let i = 60; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000); // Subtract i minutes
        
        // Random price movement
        const change = (Math.random() - 0.5) * 2; // Random value between -1 and 1
        price += change;
        
        // Random volume
        const volume = Math.floor(Math.random() * 10000) + 1000;
        
        data.push({
          time,
          open: price - change * 0.5,
          high: price + Math.random() * 1,
          low: price - Math.random() * 1,
          close: price,
          volume
        });
      }
      
      return data;
    };
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const data = generateMockData();
        setChartData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load chart data');
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [symbol, timeframe]);

  // Calculate price levels and support/resistance
  const calculatePriceLevels = () => {
    if (!chartData.length) return [];
    
    // Get min and max prices
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    
    // Generate price levels
    const levels = [];
    const step = range / 8;
    
    for (let i = 0; i <= 8; i++) {
      const price = minPrice + step * i;
      levels.push({
        price: price.toFixed(2),
        strength: Math.random() // Mock strength value
      });
    }
    
    return levels;
  };

  const priceLevels = calculatePriceLevels();

  if (loading) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">{symbol} Scalping Chart</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{timeframe} timeframe</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium dark:bg-blue-900 dark:text-blue-200">
            {timeframe}
          </button>
          <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm font-medium dark:bg-gray-700 dark:text-gray-300">
            Indicators
          </button>
          <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm font-medium dark:bg-gray-700 dark:text-gray-300">
            Tools
          </button>
        </div>
      </div>
      
      <div className="relative" style={{ height: `${height}px` }}>
        {/* This is a placeholder for the actual chart implementation */}
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">Scalping chart will be implemented with Recharts</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Features: High-frequency updates, tick-by-tick data, price action patterns
            </p>
          </div>
        </div>
        
        {/* Price levels sidebar */}
        <div className="absolute top-0 right-0 bottom-0 w-16 bg-white/80 dark:bg-gray-800/80 border-l border-gray-200 dark:border-gray-700 flex flex-col justify-between py-2">
          {priceLevels.map((level, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center px-2"
            >
              <div 
                className={`w-2 h-1 rounded-sm ${
                  level.strength > 0.7 ? 'bg-red-500' : level.strength > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
              ></div>
              <span className="text-xs font-mono">{level.price}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chart controls */}
      <div className="mt-4 flex justify-between">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="showVolume" 
              checked={showVolume}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="showVolume" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Volume
            </label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="showGrid" 
              checked={showGrid}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="showGrid" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Grid
            </label>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last update: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ScalpingChart;
