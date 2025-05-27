import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Mock data for the charts
const generateMockData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const value = 100 + Math.random() * 50 - 25 + i;
    const volume = Math.floor(Math.random() * 1000000) + 500000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(2)),
      volume: volume,
      ma5: parseFloat((value + Math.random() * 5 - 2.5).toFixed(2)),
      ma20: parseFloat((value + Math.random() * 3 - 1.5).toFixed(2)),
      rsi: Math.floor(Math.random() * 100),
    });
  }
  
  return data;
};

interface TrendIndicatorProps {
  symbol: string;
  timeframe?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ 
  symbol, 
  timeframe = '1M' 
}) => {
  const { colorTheme } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(timeframe);
  const [trendDirection, setTrendDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [trendStrength, setTrendStrength] = useState<'strong' | 'moderate' | 'weak'>('moderate');
  const [indicators, setIndicators] = useState<{
    rsi: number;
    macd: number;
    adx: number;
    momentum: number;
    volatility: number;
  }>({
    rsi: 50,
    macd: 0,
    adx: 25,
    momentum: 0,
    volatility: 15
  });

  // Load data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const mockData = generateMockData();
        setData(mockData);
        
        // Determine trend direction and strength
        const lastFiveValues = mockData.slice(-5).map(item => item.value);
        const firstValue = lastFiveValues[0];
        const lastValue = lastFiveValues[lastFiveValues.length - 1];
        const percentChange = ((lastValue - firstValue) / firstValue) * 100;
        
        if (percentChange > 1) {
          setTrendDirection('up');
          setTrendStrength(percentChange > 5 ? 'strong' : percentChange > 2 ? 'moderate' : 'weak');
        } else if (percentChange < -1) {
          setTrendDirection('down');
          setTrendStrength(percentChange < -5 ? 'strong' : percentChange < -2 ? 'moderate' : 'weak');
        } else {
          setTrendDirection('neutral');
          setTrendStrength('weak');
        }
        
        // Set mock indicators
        setIndicators({
          rsi: Math.floor(Math.random() * 100),
          macd: parseFloat((Math.random() * 2 - 1).toFixed(2)),
          adx: Math.floor(Math.random() * 50) + 10,
          momentum: parseFloat((Math.random() * 10 - 5).toFixed(2)),
          volatility: parseFloat((Math.random() * 20 + 5).toFixed(2))
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load trend data');
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [symbol, selectedTimeframe]);

  // Get color based on trend direction
  const getTrendColor = () => {
    if (trendDirection === 'up') {
      return 'text-green-600 dark:text-green-400';
    } else if (trendDirection === 'down') {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };
  
  // Get background color based on trend direction
  const getTrendBgColor = () => {
    if (trendDirection === 'up') {
      return 'bg-green-100 dark:bg-green-900/30';
    } else if (trendDirection === 'down') {
      return 'bg-red-100 dark:bg-red-900/30';
    }
    return 'bg-gray-100 dark:bg-gray-800';
  };
  
  // Get trend icon
  const getTrendIcon = () => {
    if (trendDirection === 'up') {
      return trendStrength === 'strong' ? (
        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
      ) : (
        <ArrowUp className="w-5 h-5 text-green-600 dark:text-green-400" />
      );
    } else if (trendDirection === 'down') {
      return trendStrength === 'strong' ? (
        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
      ) : (
        <ArrowDown className="w-5 h-5 text-red-600 dark:text-red-400" />
      );
    }
    return <BarChart2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
  };
  
  // Get trend description
  const getTrendDescription = () => {
    if (trendDirection === 'up') {
      return `${trendStrength.charAt(0).toUpperCase() + trendStrength.slice(1)} Uptrend`;
    } else if (trendDirection === 'down') {
      return `${trendStrength.charAt(0).toUpperCase() + trendStrength.slice(1)} Downtrend`;
    }
    return 'Neutral Trend';
  };
  
  // Get indicator status color
  const getIndicatorStatusColor = (value: number, type: 'rsi' | 'adx' | 'other') => {
    if (type === 'rsi') {
      if (value > 70) return 'text-red-600 dark:text-red-400';
      if (value < 30) return 'text-green-600 dark:text-green-400';
      return 'text-yellow-600 dark:text-yellow-400';
    } else if (type === 'adx') {
      if (value > 25) return 'text-green-600 dark:text-green-400';
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      if (value > 0) return 'text-green-600 dark:text-green-400';
      if (value < 0) return 'text-red-600 dark:text-red-400';
      return 'text-gray-600 dark:text-gray-400';
    }
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
            <BarChart2 className="mr-2 h-5 w-5 text-primary-500" />
            Trend Indicator
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {symbol} • Technical trend analysis
          </p>
        </div>
        <div className="flex space-x-1">
          {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-2 py-1 text-xs font-medium rounded ${
                selectedTimeframe === tf
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className={`p-3 rounded-lg ${getTrendBgColor()}`}>
          <div className="flex items-center">
            {getTrendIcon()}
            <h4 className="ml-2 font-medium">{getTrendDescription()}</h4>
          </div>
          <p className={`text-2xl font-bold mt-1 ${getTrendColor()}`}>
            {data[data.length - 1]?.value.toFixed(2)}
            <span className="text-sm ml-1">
              {trendDirection === 'up' ? '+' : trendDirection === 'down' ? '-' : ''}
              {Math.abs(((data[data.length - 1]?.value - data[data.length - 6]?.value) / data[data.length - 6]?.value) * 100).toFixed(2)}%
            </span>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            Last 5 days
          </p>
        </div>
        
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
          <h4 className="font-medium">Key Indicators</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">RSI</p>
              <p className={`font-medium ${getIndicatorStatusColor(indicators.rsi, 'rsi')}`}>
                {indicators.rsi}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">MACD</p>
              <p className={`font-medium ${getIndicatorStatusColor(indicators.macd, 'other')}`}>
                {indicators.macd > 0 ? '+' : ''}{indicators.macd}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">ADX</p>
              <p className={`font-medium ${getIndicatorStatusColor(indicators.adx, 'adx')}`}>
                {indicators.adx}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Volatility</p>
              <p className="font-medium">
                {indicators.volatility}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
          <h4 className="font-medium">Trend Strength</h4>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className={`h-2.5 rounded-full ${
                  trendDirection === 'up' 
                    ? 'bg-green-600' 
                    : trendDirection === 'down' 
                    ? 'bg-red-600' 
                    : 'bg-yellow-600'
                }`} 
                style={{ 
                  width: `${
                    trendStrength === 'strong' 
                      ? '85%' 
                      : trendStrength === 'moderate' 
                      ? '50%' 
                      : '25%'
                  }` 
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Weak</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Moderate</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Strong</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Price Trend</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getPrimaryColor()} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={getPrimaryColor()} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString();
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={getPrimaryColor()} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
              <Line 
                type="monotone" 
                dataKey="ma5" 
                stroke="#ff7300" 
                dot={false} 
                name="MA(5)"
              />
              <Line 
                type="monotone" 
                dataKey="ma20" 
                stroke="#387908" 
                dot={false} 
                name="MA(20)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Volume</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.slice(-14)}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value;
                  }}
                />
                <Tooltip 
                  formatter={(value: number) => {
                    if (value >= 1000000) return [`${(value / 1000000).toFixed(2)}M`, 'Volume'];
                    if (value >= 1000) return [`${(value / 1000).toFixed(0)}K`, 'Volume'];
                    return [value, 'Volume'];
                  }}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString();
                  }}
                />
                <Bar dataKey="volume" fill={getPrimaryColor()} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">RSI</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.slice(-14)}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  domain={[0, 100]}
                  ticks={[0, 30, 50, 70, 100]}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}`, 'RSI']}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString();
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rsi" 
                  stroke={getPrimaryColor()} 
                  dot={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey="date" 
                  stroke="transparent" 
                  strokeWidth={0}
                  dot={false}
                  activeDot={false}
                  legendType="none"
                  yAxisId={1}
                  y={() => 30}
                />
                <Line 
                  type="monotone" 
                  dataKey="date" 
                  stroke="transparent" 
                  strokeWidth={0}
                  dot={false}
                  activeDot={false}
                  legendType="none"
                  yAxisId={1}
                  y={() => 70}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium mb-2">Trend Analysis</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {symbol} is currently in a {trendStrength} {trendDirection}trend based on technical analysis. 
          {trendDirection === 'up' ? (
            ` The stock has shown positive momentum with increasing volume, suggesting continued upward movement. RSI at ${indicators.rsi} indicates ${
              indicators.rsi > 70 ? 'overbought conditions, suggesting caution' : 
              indicators.rsi < 30 ? 'oversold conditions, suggesting potential reversal' : 
              'moderate momentum'
            }.`
          ) : trendDirection === 'down' ? (
            ` The stock has shown negative momentum with ${
              Math.random() > 0.5 ? 'increasing' : 'decreasing'
            } volume, suggesting continued downward pressure. RSI at ${indicators.rsi} indicates ${
              indicators.rsi > 70 ? 'overbought conditions, suggesting potential reversal' : 
              indicators.rsi < 30 ? 'oversold conditions, suggesting caution' : 
              'moderate downward momentum'
            }.`
          ) : (
            ` The stock is showing neutral momentum with sideways movement. RSI at ${indicators.rsi} indicates balanced buying and selling pressure. Watch for breakout signals in either direction.`
          )}
        </p>
      </div>
    </div>
  );
};

export default TrendIndicator;
