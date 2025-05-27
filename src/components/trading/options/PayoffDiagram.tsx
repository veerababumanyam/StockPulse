import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PayoffDiagramProps {
  symbol: string;
  stockPrice?: number;
  strategy?: 'long_call' | 'long_put' | 'covered_call' | 'protective_put' | 'bull_call_spread' | 'bear_put_spread' | 'iron_condor' | 'butterfly' | 'custom';
  legs?: OptionLeg[];
  showBreakeven?: boolean;
  showMaxProfit?: boolean;
  showMaxLoss?: boolean;
}

interface OptionLeg {
  type: 'call' | 'put' | 'stock';
  action: 'buy' | 'sell';
  strike?: number;
  premium?: number;
  quantity: number;
  expiration?: string;
}

const PayoffDiagram: React.FC<PayoffDiagramProps> = ({
  symbol,
  stockPrice = 187.42, // Default mock price
  strategy = 'long_call',
  legs = [],
  showBreakeven = true,
  showMaxProfit = true,
  showMaxLoss = true
}) => {
  const [payoffData, setPayoffData] = useState<{x: number, y: number}[]>([]);
  const [strategyMetrics, setStrategyMetrics] = useState<{
    breakeven: number[];
    maxProfit: number | 'unlimited';
    maxLoss: number | 'unlimited';
    profitProbability: number;
  }>({
    breakeven: [],
    maxProfit: 0,
    maxLoss: 0,
    profitProbability: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>(strategy);
  
  // Generate default legs based on strategy if none provided
  useEffect(() => {
    if (legs.length === 0) {
      let defaultLegs: OptionLeg[] = [];
      
      switch (strategy) {
        case 'long_call':
          defaultLegs = [{
            type: 'call',
            action: 'buy',
            strike: Math.round(stockPrice / 5) * 5, // Round to nearest $5
            premium: 5.75,
            quantity: 1,
            expiration: '2025-06-20'
          }];
          break;
        case 'long_put':
          defaultLegs = [{
            type: 'put',
            action: 'buy',
            strike: Math.round(stockPrice / 5) * 5, // Round to nearest $5
            premium: 4.85,
            quantity: 1,
            expiration: '2025-06-20'
          }];
          break;
        case 'covered_call':
          defaultLegs = [
            {
              type: 'stock',
              action: 'buy',
              quantity: 100,
            },
            {
              type: 'call',
              action: 'sell',
              strike: Math.round((stockPrice + 10) / 5) * 5, // OTM call
              premium: 2.45,
              quantity: 1,
              expiration: '2025-06-20'
            }
          ];
          break;
        case 'bull_call_spread':
          const lowerStrike = Math.round(stockPrice / 5) * 5; // ATM
          const upperStrike = lowerStrike + 10; // $10 higher
          defaultLegs = [
            {
              type: 'call',
              action: 'buy',
              strike: lowerStrike,
              premium: 5.75,
              quantity: 1,
              expiration: '2025-06-20'
            },
            {
              type: 'call',
              action: 'sell',
              strike: upperStrike,
              premium: 1.85,
              quantity: 1,
              expiration: '2025-06-20'
            }
          ];
          break;
        // Add more strategies as needed
        default:
          defaultLegs = [{
            type: 'call',
            action: 'buy',
            strike: Math.round(stockPrice / 5) * 5,
            premium: 5.75,
            quantity: 1,
            expiration: '2025-06-20'
          }];
      }
      
      // Set the legs
      legs = defaultLegs;
    }
  }, [strategy, stockPrice]);
  
  // Calculate payoff data for the diagram
  const calculatePayoff = () => {
    // Define price range for x-axis (typically ±30% of current stock price)
    const minPrice = stockPrice * 0.7;
    const maxPrice = stockPrice * 1.3;
    const step = (maxPrice - minPrice) / 50; // 50 data points
    
    const data: {x: number, y: number}[] = [];
    const breakevens: number[] = [];
    
    // Calculate payoff at expiration for each price point
    for (let price = minPrice; price <= maxPrice; price += step) {
      let payoff = 0;
      
      // Calculate payoff for each leg
      legs.forEach(leg => {
        if (leg.type === 'stock') {
          // Stock payoff is simply the difference in price
          payoff += leg.action === 'buy' 
            ? (price - stockPrice) * leg.quantity 
            : (stockPrice - price) * leg.quantity;
        } else if (leg.type === 'call' && leg.strike !== undefined && leg.premium !== undefined) {
          if (leg.action === 'buy') {
            // Long call payoff: max(0, price - strike) - premium
            payoff += Math.max(0, price - leg.strike) * 100 * leg.quantity - (leg.premium * 100 * leg.quantity);
          } else {
            // Short call payoff: premium - max(0, price - strike)
            payoff += (leg.premium * 100 * leg.quantity) - Math.max(0, price - leg.strike) * 100 * leg.quantity;
          }
        } else if (leg.type === 'put' && leg.strike !== undefined && leg.premium !== undefined) {
          if (leg.action === 'buy') {
            // Long put payoff: max(0, strike - price) - premium
            payoff += Math.max(0, leg.strike - price) * 100 * leg.quantity - (leg.premium * 100 * leg.quantity);
          } else {
            // Short put payoff: premium - max(0, strike - price)
            payoff += (leg.premium * 100 * leg.quantity) - Math.max(0, leg.strike - price) * 100 * leg.quantity;
          }
        }
      });
      
      data.push({ x: price, y: payoff });
      
      // Check for breakeven points (where payoff crosses zero)
      if (data.length > 1) {
        const prev = data[data.length - 2];
        const curr = data[data.length - 1];
        if ((prev.y < 0 && curr.y >= 0) || (prev.y >= 0 && curr.y < 0)) {
          // Linear interpolation to find more precise breakeven
          const breakeven = prev.x + (curr.x - prev.x) * (0 - prev.y) / (curr.y - prev.y);
          breakevens.push(parseFloat(breakeven.toFixed(2)));
        }
      }
    }
    
    // Calculate max profit and max loss
    let maxProfit: number | 'unlimited' = data[0].y;
    let maxLoss: number | 'unlimited' = data[0].y;
    
    data.forEach(point => {
      if (point.y > maxProfit) maxProfit = point.y;
      if (point.y < maxLoss) maxLoss = point.y;
    });
    
    // Check for unlimited profit/loss scenarios
    if (strategy === 'long_call' || strategy === 'short_put') {
      maxProfit = 'unlimited';
    }
    if (strategy === 'short_call') {
      maxLoss = 'unlimited';
    }
    
    // Calculate rough probability of profit based on breakevens
    // This is a simplified model for demonstration
    let profitProbability = 0.5; // Default to 50%
    
    if (breakevens.length > 0) {
      // Adjust based on current price relative to breakevens
      const closestBreakeven = breakevens.reduce((prev, curr) => 
        Math.abs(curr - stockPrice) < Math.abs(prev - stockPrice) ? curr : prev
      );
      
      // Simple model: further from breakeven = higher probability
      const distance = Math.abs(closestBreakeven - stockPrice) / stockPrice;
      profitProbability = 0.5 + (distance * (data[data.length - 1].y > 0 ? 1 : -1));
      
      // Clamp between 0.1 and 0.9
      profitProbability = Math.max(0.1, Math.min(0.9, profitProbability));
    }
    
    return {
      data,
      metrics: {
        breakeven: breakevens,
        maxProfit,
        maxLoss,
        profitProbability
      }
    };
  };
  
  // Update payoff data when inputs change
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const { data, metrics } = calculatePayoff();
        setPayoffData(data);
        setStrategyMetrics(metrics);
        setLoading(false);
      } catch (err) {
        setError('Failed to calculate payoff data');
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [strategy, stockPrice, legs, selectedStrategy]);

  // Strategy options for dropdown
  const strategyOptions = [
    { value: 'long_call', label: 'Long Call' },
    { value: 'long_put', label: 'Long Put' },
    { value: 'covered_call', label: 'Covered Call' },
    { value: 'protective_put', label: 'Protective Put' },
    { value: 'bull_call_spread', label: 'Bull Call Spread' },
    { value: 'bear_put_spread', label: 'Bear Put Spread' },
    { value: 'iron_condor', label: 'Iron Condor' },
    { value: 'butterfly', label: 'Butterfly' },
    { value: 'custom', label: 'Custom Strategy' }
  ];

  if (loading && !payoffData.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-center h-40 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">{symbol} Payoff Diagram</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Strategy: {strategyOptions.find(s => s.value === selectedStrategy)?.label}
          </p>
        </div>
        <div className="flex space-x-2">
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
          >
            {strategyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm font-medium dark:bg-gray-700 dark:text-gray-300">
            Edit Legs
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Breakeven</h4>
          <p className="text-xl font-semibold">
            {strategyMetrics.breakeven.length > 0 
              ? strategyMetrics.breakeven.map(b => `$${b.toFixed(2)}`).join(', ')
              : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">At expiration</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Max Profit</h4>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400">
            {strategyMetrics.maxProfit === 'unlimited' 
              ? 'Unlimited'
              : `$${strategyMetrics.maxProfit.toFixed(2)}`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">At expiration</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Max Loss</h4>
          <p className="text-xl font-semibold text-red-600 dark:text-red-400">
            {strategyMetrics.maxLoss === 'unlimited' 
              ? 'Unlimited'
              : `$${Math.abs(strategyMetrics.maxLoss).toFixed(2)}`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">At expiration</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center relative">
          <p className="text-gray-500 dark:text-gray-400">Payoff diagram will be implemented with Recharts</p>
          
          {/* Placeholder visualization */}
          <div className="absolute inset-0 p-4">
            <div className="h-full w-full flex items-end">
              {payoffData.map((point, index) => {
                // Normalize y values for display
                const maxY = Math.max(...payoffData.map(p => Math.abs(p.y)));
                const normalizedY = (point.y / maxY) * 0.8; // 80% of height max
                const height = `${Math.abs(normalizedY) * 100}%`;
                const bottom = point.y >= 0 ? '50%' : `calc(50% - ${height})`;
                
                return (
                  <div 
                    key={index}
                    className={`w-1 mx-px ${point.y >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ 
                      height,
                      bottom: point.y >= 0 ? '50%' : 'auto',
                      top: point.y < 0 ? '50%' : 'auto'
                    }}
                  ></div>
                );
              })}
            </div>
            
            {/* X-axis */}
            <div className="absolute left-0 right-0 h-px bg-gray-300 dark:bg-gray-600" style={{ top: '50%' }}></div>
            
            {/* Current price marker */}
            <div 
              className="absolute bottom-0 top-0 w-px bg-blue-500"
              style={{ 
                left: `${((stockPrice - payoffData[0].x) / (payoffData[payoffData.length - 1].x - payoffData[0].x)) * 100}%`
              }}
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs px-1 rounded">
                ${stockPrice.toFixed(2)}
              </div>
            </div>
            
            {/* Breakeven markers */}
            {showBreakeven && strategyMetrics.breakeven.map((breakeven, index) => (
              <div 
                key={index}
                className="absolute bottom-0 top-0 w-px bg-purple-500 dashed"
                style={{ 
                  left: `${((breakeven - payoffData[0].x) / (payoffData[payoffData.length - 1].x - payoffData[0].x)) * 100}%`
                }}
              >
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-purple-500 text-white text-xs px-1 rounded">
                  BE: ${breakeven.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Strategy Legs</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Strike
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Premium
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expiration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {legs.map((leg, index) => (
                <tr 
                  key={index}
                  className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/30'}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    {leg.type.charAt(0).toUpperCase() + leg.type.slice(1)}
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap font-medium ${
                    leg.action === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {leg.action.toUpperCase()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {leg.type === 'stock' ? 'N/A' : `$${leg.strike?.toFixed(2)}`}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {leg.type === 'stock' ? 'N/A' : `$${leg.premium?.toFixed(2)}`}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {leg.quantity}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {leg.type === 'stock' ? 'N/A' : leg.expiration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="showBreakeven" 
              checked={showBreakeven}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="showBreakeven" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Show Breakeven
            </label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="showProbability" 
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="showProbability" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Show Probability
            </label>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Profit Probability: {(strategyMetrics.profitProbability * 100).toFixed(1)}%
          </span>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium">
            Trade Strategy
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayoffDiagram;
