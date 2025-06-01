/**
 * Portfolio Overview Preview Component
 * Simplified preview version for the widget library
 */

import React from 'react';
import { PieChart, TrendingUp } from 'lucide-react';

const PortfolioOverviewPreview: React.FC<{ isPreview?: boolean }> = ({
  isPreview = true,
}) => {
  return (
    <div className="h-full w-full p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center space-x-2 mb-3">
        <PieChart className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Portfolio Overview
        </h3>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            $125,750.50
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span className="text-sm text-green-500">+$2,847.25 (2.31%)</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-500">Positions</p>
            <p className="font-medium">12</p>
          </div>
          <div>
            <p className="text-gray-500">Cash</p>
            <p className="font-medium">$5,250.75</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverviewPreview;
