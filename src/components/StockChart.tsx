import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Button } from '@/components/ui/button';

interface ChartData {
  date: string;
  price: number;
}

interface StockChartProps {
  data: ChartData[];
  symbol: string;
  positiveColor?: string;
  negativeColor?: string;
}

const StockChart: React.FC<StockChartProps> = ({ 
  data, 
  symbol, 
  positiveColor = "#10B981", 
  negativeColor = "#F87171" 
}) => {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y'>('1M');
  
  // Determine if the trend is positive (for line color)
  const isPositive = data.length > 1 && data[data.length - 1].price >= data[0].price;
  const lineColor = isPositive ? positiveColor : negativeColor;
  const gradientColor = isPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(248, 113, 113, 0.2)";
  
  // Filter data based on selected time range
  const getFilteredData = () => {
    if (!data.length) return [];
    
    const now = new Date();
    const lastDate = new Date(data[data.length - 1].date);
    
    switch (timeRange) {
      case '1D':
        return data.slice(-2);
      case '1W':
        return data.slice(-7);
      case '1M':
        return data.slice(-30);
      case '3M':
        return data.slice(-90);
      case 'YTD':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return data.filter(item => new Date(item.date) >= startOfYear);
      case '1Y':
        return data;
      default:
        return data;
    }
  };
  
  const filteredData = getFilteredData();
  
  // Format values for tooltip
  const formatValue = (value: number) => {
    return `$${value.toFixed(2)}`;
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="neumorphic p-4 shadow-neumorphic-sm">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-base font-semibold">{formatValue(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="stockpulse-card p-6 w-full h-full animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-heading font-semibold flex items-center">
          <div 
            className={`h-3 w-3 rounded-full mr-2 ${isPositive ? 'bg-stockpulse-green' : 'bg-stockpulse-coral'}`}
          ></div>
          {symbol} Price Chart
        </h3>
        <div className="neumorphic p-1 rounded-xl inline-flex">
          {(['1D', '1W', '1M', '3M', 'YTD', '1Y'] as const).map((range) => (
            <Button 
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              className={`py-1.5 px-3.5 text-xs h-auto rounded-lg ${
                timeRange === range 
                  ? 'text-white shadow-none' 
                  : 'text-gray-600 hover:text-stockpulse-blue-dark hover:bg-stockpulse-pastel-blue'
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-72 w-full neumorphic p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                const d = new Date(date);
                // For 1D view, show times, otherwise show dates
                return timeRange === '1D' 
                  ? d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                  : d.toLocaleDateString([], {month: 'short', day: 'numeric'});
              }}
              tick={{fontSize: 11, fill: '#6B7280'}}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{fontSize: 11, fill: '#6B7280'}} 
              tickFormatter={(value) => `$${value}`}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={lineColor} 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center mt-5 text-sm text-gray-500 border-t border-gray-100 pt-4">
        <div>
          <span className="font-medium text-gray-700">Open:</span> ${filteredData[0]?.price.toFixed(2)}
        </div>
        <div>
          <span className="font-medium text-gray-700">Close:</span> ${filteredData[filteredData.length - 1]?.price.toFixed(2)}
        </div>
        <div className={isPositive ? 'text-stockpulse-green' : 'text-stockpulse-coral'}>
          <span className="font-medium">Change:</span> {isPositive ? '+' : '-'}
          ${Math.abs(filteredData[filteredData.length - 1]?.price - filteredData[0]?.price).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default StockChart;
