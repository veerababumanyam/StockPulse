import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GreeksData {
  strike: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

interface GreeksDisplayProps {
  symbol: string;
  stockPrice?: number;
  optionType?: 'call' | 'put';
  expiration?: string;
  strike?: number;
  impliedVolatility?: number;
  showAllStrikes?: boolean;
}

const GreeksDisplay: React.FC<GreeksDisplayProps> = ({
  symbol,
  stockPrice = 187.42, // Default mock price
  optionType = 'call',
  expiration = '2025-06-20',
  strike = 190,
  impliedVolatility = 25,
  showAllStrikes = false
}) => {
  const [greeksData, setGreeksData] = useState<GreeksData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrike, setSelectedStrike] = useState<number>(strike);
  
  // Calculate mock Greeks data
  const calculateGreeks = (
    s: number, // stock price
    k: number, // strike price
    t: number, // time to expiration in years
    r: number, // risk-free interest rate
    v: number, // implied volatility
    type: 'call' | 'put'
  ): GreeksData => {
    // This is a simplified model for demonstration
    // In a real app, use the Black-Scholes model or a proper options pricing library
    
    // Calculate distance from ATM
    const moneyness = s / k;
    
    // Delta: sensitivity to underlying price changes
    let delta = type === 'call' 
      ? 0.5 + 0.5 * (moneyness - 1) / (v * Math.sqrt(t))
      : 0.5 - 0.5 * (moneyness - 1) / (v * Math.sqrt(t));
    
    // Ensure delta is within bounds
    delta = Math.max(0, Math.min(1, delta));
    if (type === 'put') delta = delta - 1; // Put delta is negative
    
    // Gamma: sensitivity of delta to underlying price changes
    const gamma = Math.exp(-Math.pow((k - s) / (s * v * Math.sqrt(t)), 2) / 2) / (s * v * Math.sqrt(t) * Math.sqrt(2 * Math.PI));
    
    // Theta: sensitivity to time decay
    const theta = -s * v * Math.exp(-Math.pow((k - s) / (s * v * Math.sqrt(t)), 2) / 2) / (2 * Math.sqrt(t) * Math.sqrt(2 * Math.PI)) / 365;
    
    // Vega: sensitivity to volatility changes
    const vega = s * Math.sqrt(t) * Math.exp(-Math.pow((k - s) / (s * v * Math.sqrt(t)), 2) / 2) / Math.sqrt(2 * Math.PI) / 100;
    
    // Rho: sensitivity to interest rate changes
    const rho = type === 'call'
      ? k * t * Math.exp(-r * t) * (delta > 0.5 ? delta : 0.5) / 100
      : -k * t * Math.exp(-r * t) * (delta < -0.5 ? -delta : 0.5) / 100;
    
    return {
      strike: k,
      delta: parseFloat(delta.toFixed(4)),
      gamma: parseFloat(gamma.toFixed(4)),
      theta: parseFloat(theta.toFixed(4)),
      vega: parseFloat(vega.toFixed(4)),
      rho: parseFloat(rho.toFixed(4))
    };
  };
  
  // Generate mock Greeks data for multiple strikes
  const generateGreeksData = () => {
    const today = new Date();
    const expiryDate = new Date(expiration);
    const timeToExpiry = (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365); // in years
    const riskFreeRate = 0.05; // 5% risk-free rate
    
    if (showAllStrikes) {
      // Generate data for a range of strikes
      const data: GreeksData[] = [];
      const baseStrike = Math.round(stockPrice / 5) * 5; // Round to nearest $5
      
      for (let i = -6; i <= 6; i++) {
        const strikePrice = baseStrike + (i * 5); // $5 strike increments
        data.push(calculateGreeks(
          stockPrice,
          strikePrice,
          timeToExpiry,
          riskFreeRate,
          impliedVolatility / 100,
          optionType
        ));
      }
      
      return data;
    } else {
      // Generate data for just the selected strike
      return [calculateGreeks(
        stockPrice,
        selectedStrike,
        timeToExpiry,
        riskFreeRate,
        impliedVolatility / 100,
        optionType
      )];
    }
  };
  
  // Update Greeks data when inputs change
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const data = generateGreeksData();
        setGreeksData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to calculate Greeks');
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [stockPrice, selectedStrike, optionType, expiration, impliedVolatility, showAllStrikes]);

  if (loading && !greeksData.length) {
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
          <h3 className="text-lg font-semibold">{symbol} Option Greeks</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {optionType.toUpperCase()} {expiration} ${selectedStrike} (IV: {impliedVolatility}%)
          </p>
        </div>
        <div className="flex space-x-2">
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={optionType}
          >
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
          <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm font-medium dark:bg-gray-700 dark:text-gray-300">
            Settings
          </button>
        </div>
      </div>
      
      {!showAllStrikes && greeksData.length === 1 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Delta (Δ)</h4>
            <p className="text-2xl font-semibold">{greeksData[0].delta}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Price change per $1 move</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Gamma (Γ)</h4>
            <p className="text-2xl font-semibold">{greeksData[0].gamma}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Delta change per $1 move</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Theta (Θ)</h4>
            <p className="text-2xl font-semibold">{greeksData[0].theta}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Price change per day</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vega (V)</h4>
            <p className="text-2xl font-semibold">{greeksData[0].vega}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Price change per 1% IV</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Rho (ρ)</h4>
            <p className="text-2xl font-semibold">{greeksData[0].rho}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Price change per 1% rate</p>
          </div>
        </div>
      )}
      
      {showAllStrikes && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Strike
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Delta (Δ)
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gamma (Γ)
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Theta (Θ)
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vega (V)
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rho (ρ)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {greeksData.map((data, index) => (
                <tr 
                  key={data.strike}
                  className={`${
                    data.strike === selectedStrike ? 'bg-blue-50 dark:bg-blue-900/20' : 
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/30'
                  } cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700`}
                  onClick={() => setSelectedStrike(data.strike)}
                >
                  <td className="px-3 py-2 whitespace-nowrap font-medium">
                    ${data.strike.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {data.delta}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {data.gamma}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {data.theta}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {data.vega}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {data.rho}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sensitivity Analysis</h4>
        <div className="h-48 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Greeks visualization will be implemented with Recharts</p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="showAllStrikes" 
              checked={showAllStrikes}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="showAllStrikes" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Show All Strikes
            </label>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Stock Price: ${stockPrice.toFixed(2)}
          </span>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium">
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default GreeksDisplay;
