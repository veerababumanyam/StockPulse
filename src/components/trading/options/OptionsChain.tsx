import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { DollarSign, Calendar, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Mock data for options chain
const generateMockOptionsData = (strike: number, expiryDays: number) => {
  const strikes = [];
  const currentDate = new Date();
  const expiryDate = new Date(currentDate);
  expiryDate.setDate(currentDate.getDate() + expiryDays);
  
  // Generate strikes around the given strike price
  for (let i = -5; i <= 5; i++) {
    const strikePrice = strike + (i * 5);
    
    // Calculate call and put prices based on distance from strike
    const distanceFromStrike = Math.abs(strikePrice - strike);
    const timeValue = (expiryDays / 30) * 2; // Time value increases with days to expiry
    
    let callPrice, putPrice;
    
    if (strikePrice < strike) {
      // In-the-money call, out-of-the-money put
      callPrice = (strike - strikePrice) + (timeValue * (1 - i * 0.1));
      putPrice = timeValue * (1 + i * 0.15);
    } else if (strikePrice > strike) {
      // Out-of-the-money call, in-the-money put
      callPrice = timeValue * (1 - i * 0.15);
      putPrice = (strikePrice - strike) + (timeValue * (1 + i * 0.1));
    } else {
      // At-the-money
      callPrice = timeValue;
      putPrice = timeValue;
    }
    
    // Add some randomness
    callPrice = parseFloat((callPrice + (Math.random() * 0.5 - 0.25)).toFixed(2));
    putPrice = parseFloat((putPrice + (Math.random() * 0.5 - 0.25)).toFixed(2));
    
    // Calculate implied volatility (mock)
    const callIV = parseFloat((30 + Math.random() * 20 + (i * 2)).toFixed(2));
    const putIV = parseFloat((30 + Math.random() * 20 - (i * 2)).toFixed(2));
    
    // Calculate volume and open interest (mock)
    const callVolume = Math.floor(Math.random() * 1000) + 100;
    const putVolume = Math.floor(Math.random() * 1000) + 100;
    const callOI = Math.floor(Math.random() * 5000) + 500;
    const putOI = Math.floor(Math.random() * 5000) + 500;
    
    strikes.push({
      strike: strikePrice,
      call: {
        price: callPrice,
        change: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        iv: callIV,
        volume: callVolume,
        openInterest: callOI,
        bid: parseFloat((callPrice - 0.05 - Math.random() * 0.1).toFixed(2)),
        ask: parseFloat((callPrice + 0.05 + Math.random() * 0.1).toFixed(2)),
        itm: strikePrice < strike
      },
      put: {
        price: putPrice,
        change: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        iv: putIV,
        volume: putVolume,
        openInterest: putOI,
        bid: parseFloat((putPrice - 0.05 - Math.random() * 0.1).toFixed(2)),
        ask: parseFloat((putPrice + 0.05 + Math.random() * 0.1).toFixed(2)),
        itm: strikePrice > strike
      }
    });
  }
  
  return {
    strikes,
    expiryDate: expiryDate.toISOString().split('T')[0],
    daysToExpiry: expiryDays
  };
};

interface OptionsChainProps {
  symbol: string;
  price?: number;
  showGreeks?: boolean;
  showVolume?: boolean;
}

const OptionsChain: React.FC<OptionsChainProps> = ({ 
  symbol, 
  price = 150.25,
  showGreeks = true,
  showVolume = true
}) => {
  const { colorTheme } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('30');
  const [expiryDates, setExpiryDates] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [payoffData, setPayoffData] = useState<any[]>([]);

  // Load data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        // Generate expiry dates (7, 14, 30, 60, 90 days)
        const dates = ['7', '14', '30', '60', '90'];
        setExpiryDates(dates);
        
        // Generate options data for selected expiry
        const optionsData = generateMockOptionsData(price, parseInt(selectedExpiry));
        setData(optionsData);
        
        // Set default selected option (at the money)
        const atmIndex = optionsData.strikes.findIndex(
          (strike: any) => strike.strike === price || 
          (strike.strike > price && optionsData.strikes[optionsData.strikes.indexOf(strike) - 1]?.strike < price)
        );
        
        if (atmIndex !== -1) {
          setSelectedOption(optionsData.strikes[atmIndex]);
          
          // Generate payoff data for the selected option
          generatePayoffData(optionsData.strikes[atmIndex], 'call');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load options data');
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [price, selectedExpiry]);

  // Generate payoff data for selected option
  const generatePayoffData = (option: any, type: 'call' | 'put') => {
    if (!option) return;
    
    const strike = option.strike;
    const premium = option[type].price;
    const data = [];
    
    // Generate price points from -30% to +30% of current price
    const minPrice = price * 0.7;
    const maxPrice = price * 1.3;
    const step = (maxPrice - minPrice) / 20;
    
    for (let i = 0; i <= 20; i++) {
      const pricePoint = minPrice + (step * i);
      let payoff;
      
      if (type === 'call') {
        payoff = Math.max(0, pricePoint - strike) - premium;
      } else {
        payoff = Math.max(0, strike - pricePoint) - premium;
      }
      
      data.push({
        price: parseFloat(pricePoint.toFixed(2)),
        payoff: parseFloat(payoff.toFixed(2))
      });
    }
    
    setPayoffData(data);
  };

  // Handle option selection
  const handleOptionSelect = (option: any, type: 'call' | 'put') => {
    setSelectedOption(option);
    setOptionType(type);
    generatePayoffData(option, type);
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

  // Get secondary color based on current theme
  const getSecondaryColor = () => {
    switch (colorTheme) {
      case 'tropical-jungle':
        return '#32CD32';
      case 'ocean-sunset':
        return '#FF7F50';
      case 'desert-storm':
        return '#B7410E';
      case 'berry-fields':
        return '#FF1493';
      case 'arctic-moss':
        return '#9CAF88';
      default:
        return '#000000';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
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
          <h3 className="text-lg font-semibold flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-primary-500" />
            Options Chain
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {symbol} • ${price.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Expiry:</span>
          <div className="flex space-x-1">
            {expiryDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedExpiry(date)}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  selectedExpiry === date
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {date}d
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th colSpan={showGreeks ? 7 : 5} className="bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center border-b border-r border-gray-200 dark:border-gray-700">
                  Calls
                </th>
                <th className="bg-gray-100 dark:bg-gray-900/80 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center border-b border-gray-200 dark:border-gray-700">
                  Strike
                </th>
                <th colSpan={showGreeks ? 7 : 5} className="bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center border-b border-l border-gray-200 dark:border-gray-700">
                  Puts
                </th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/30">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Bid
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ask
                </th>
                {showVolume && (
                  <>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vol
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      OI
                    </th>
                  </>
                )}
                {showGreeks && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IV
                  </th>
                )}
                
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-900/80">
                  ${price.toFixed(2)}
                </th>
                
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Bid
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ask
                </th>
                {showVolume && (
                  <>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vol
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      OI
                    </th>
                  </>
                )}
                {showGreeks && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IV
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.strikes.map((option: any, index: number) => (
                <tr 
                  key={index}
                  className={`${
                    option.strike === price 
                      ? 'bg-primary-50 dark:bg-primary-900/10' 
                      : index % 2 === 0 
                      ? 'bg-white dark:bg-gray-800' 
                      : 'bg-gray-50 dark:bg-gray-900/20'
                  } hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors duration-150`}
                >
                  {/* Call side */}
                  <td 
                    className={`px-3 py-2 whitespace-nowrap text-sm ${
                      option.call.itm ? 'font-medium text-primary-700 dark:text-primary-400' : ''
                    } cursor-pointer`}
                    onClick={() => handleOptionSelect(option, 'call')}
                  >
                    {option.call.price.toFixed(2)}
                  </td>
                  <td 
                    className={`px-3 py-2 whitespace-nowrap text-sm ${
                      option.call.change > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : option.call.change < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : ''
                    } cursor-pointer`}
                    onClick={() => handleOptionSelect(option, 'call')}
                  >
                    {option.call.change > 0 ? '+' : ''}{option.call.change.toFixed(2)}
                  </td>
                  <td 
                    className="px-3 py-2 whitespace-nowrap text-sm cursor-pointer"
                    onClick={() => handleOptionSelect(option, 'call')}
                  >
                    {option.call.bid.toFixed(2)}
                  </td>
                  <td 
                    className="px-3 py-2 whitespace-nowrap text-sm cursor-pointer"
                    onClick={() => handleOptionSelect(option, 'call')}
                  >
                    {option.call.ask.toFixed(2)}
                  </td>
                  {showVolume && (
                    <>
                      <td 
                        className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                        onClick={() => handleOptionSelect(option, 'call')}
                      >
                        {option.call.volume.toLocaleString()}
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                        onClick={() => handleOptionSelect(option, 'call')}
                      >
                        {option.call.openInterest.toLocaleString()}
                      </td>
                    </>
                  )}
                  {showGreeks && (
                    <td 
                      className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                      onClick={() => handleOptionSelect(option, 'call')}
                    >
                      {option.call.iv.toFixed(1)}%
                    </td>
                  )}
                  
                  {/* Strike price */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-center bg-gray-100 dark:bg-gray-900/50">
                    {option.strike.toFixed(2)}
                  </td>
                  
                  {/* Put side */}
                  <td 
                    className={`px-3 py-2 whitespace-nowrap text-sm ${
                      option.put.itm ? 'font-medium text-primary-700 dark:text-primary-400' : ''
                    } cursor-pointer`}
                    onClick={() => handleOptionSelect(option, 'put')}
                  >
                    {option.put.price.toFixed(2)}
                  </td>
                  <td 
                    className={`px-3 py-2 whitespace-nowrap text-sm ${
                      option.put.change > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : option.put.change < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : ''
                    } cursor-pointer`}
                    onClick={() => handleOptionSelect(option, 'put')}
                  >
                    {option.put.change > 0 ? '+' : ''}{option.put.change.toFixed(2)}
                  </td>
                  <td 
                    className="px-3 py-2 whitespace-nowrap text-sm cursor-pointer"
                    onClick={() => handleOptionSelect(option, 'put')}
                  >
                    {option.put.bid.toFixed(2)}
                  </td>
                  <td 
                    className="px-3 py-2 whitespace-nowrap text-sm cursor-pointer"
                    onClick={() => handleOptionSelect(option, 'put')}
                  >
                    {option.put.ask.toFixed(2)}
                  </td>
                  {showVolume && (
                    <>
                      <td 
                        className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                        onClick={() => handleOptionSelect(option, 'put')}
                      >
                        {option.put.volume.toLocaleString()}
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                        onClick={() => handleOptionSelect(option, 'put')}
                      >
                        {option.put.openInterest.toLocaleString()}
                      </td>
                    </>
                  )}
                  {showGreeks && (
                    <td 
                      className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                      onClick={() => handleOptionSelect(option, 'put')}
                    >
                      {option.put.iv.toFixed(1)}%
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="lg:col-span-1">
          {selectedOption && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Selected Option</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      optionType === 'call' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {optionType.toUpperCase()}
                    </span>
                    <span className="ml-2 text-sm font-medium">
                      ${selectedOption.strike.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{data.expiryDate}</span>
                    <span className="ml-1">({data.daysToExpiry}d)</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                    <p className="font-medium">
                      ${selectedOption[optionType].price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Change</p>
                    <p className={`font-medium ${
                      selectedOption[optionType].change > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : selectedOption[optionType].change < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : ''
                    }`}>
                      {selectedOption[optionType].change > 0 ? '+' : ''}
                      {selectedOption[optionType].change.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bid/Ask</p>
                    <p className="font-medium">
                      ${selectedOption[optionType].bid.toFixed(2)} / ${selectedOption[optionType].ask.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">IV</p>
                    <p className="font-medium">
                      {selectedOption[optionType].iv.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
                    <p className="font-medium">
                      {selectedOption[optionType].volume.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Open Interest</p>
                    <p className="font-medium">
                      {selectedOption[optionType].openInterest.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Payoff at Expiration</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={payoffData}
                      margin={{
                        top: 5,
                        right: 5,
                        left: 5,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
                      <XAxis 
                        dataKey="price" 
                        tick={{ fontSize: 10 }} 
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }} 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Profit/Loss']}
                        labelFormatter={(label) => `Stock Price: $${label}`}
                      />
                      <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                      <ReferenceLine x={price} stroke="#666" strokeDasharray="3 3" />
                      <Line 
                        type="monotone" 
                        dataKey="payoff" 
                        stroke={optionType === 'call' ? getPrimaryColor() : getSecondaryColor()} 
                        dot={false} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                <div className="flex items-center">
                  <Info className="w-4 h-4 text-primary-500 mr-2" />
                  <h4 className="text-sm font-medium">Strategy Analysis</h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                  {optionType === 'call' ? (
                    <>
                      This {selectedOption.call.itm ? 'in-the-money' : 'out-of-the-money'} call option gives you the right to buy {symbol} at ${selectedOption.strike.toFixed(2)} before {data.expiryDate}. 
                      {selectedOption.strike < price ? (
                        ` It's currently in-the-money by $${(price - selectedOption.strike).toFixed(2)}.`
                      ) : selectedOption.strike > price ? (
                        ` The stock needs to rise $${(selectedOption.strike - price).toFixed(2)} (${(((selectedOption.strike - price) / price) * 100).toFixed(1)}%) to reach the strike price.`
                      ) : (
                        ` It's currently at-the-money.`
                      )}
                      {` Break-even at expiration: $${(selectedOption.strike + selectedOption.call.price).toFixed(2)}.`}
                    </>
                  ) : (
                    <>
                      This {selectedOption.put.itm ? 'in-the-money' : 'out-of-the-money'} put option gives you the right to sell {symbol} at ${selectedOption.strike.toFixed(2)} before {data.expiryDate}. 
                      {selectedOption.strike > price ? (
                        ` It's currently in-the-money by $${(selectedOption.strike - price).toFixed(2)}.`
                      ) : selectedOption.strike < price ? (
                        ` The stock needs to fall $${(price - selectedOption.strike).toFixed(2)} (${(((price - selectedOption.strike) / price) * 100).toFixed(1)}%) to reach the strike price.`
                      ) : (
                        ` It's currently at-the-money.`
                      )}
                      {` Break-even at expiration: $${(selectedOption.strike - selectedOption.put.price).toFixed(2)}.`}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionsChain;
