/**
 * Market Summary Preview Component
 * Simplified preview version for the widget library
 */

import React from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const MarketSummaryPreview: React.FC<{ isPreview?: boolean }> = ({ isPreview = true }) => {
  const indices = [
    { name: 'S&P 500', value: '4,567.89', change: '+0.52%', positive: true },
    { name: 'NASDAQ', value: '14,234.56', change: '-0.32%', positive: false },
    { name: 'DOW', value: '34,567.12', change: '+0.46%', positive: true },
  ];

  return (
    <div className="h-full w-full p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center space-x-2 mb-3">
        <BarChart3 className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Market Summary</h3>
      </div>
      
      <div className="space-y-2">
        {indices.map((index) => (
          <div key={index.name} className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">{index.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{index.value}</p>
            </div>
            <div className="flex items-center space-x-1">
              {index.positive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${index.positive ? 'text-green-500' : 'text-red-500'}`}>
                {index.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketSummaryPreview; 