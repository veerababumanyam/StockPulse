
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  positiveColor = "#0D9488", 
  negativeColor = "#F56565" 
}) => {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y'>('1M');
  
  // Determine if the trend is positive (for line color)
  const isPositive = data.length > 1 && data[data.length - 1].price >= data[0].price;
  const lineColor = isPositive ? positiveColor : negativeColor;
  
  // Filter data based on selected time range
  const getFilteredData = () => {
    if (!data.length) return [];
    
    const now = new Date();
    const lastDate = new Date(data[data.length - 1].date);
    
    switch (timeRange) {
      case '1D':
        return data.slice(-2); // Just show today
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
        <div className="bg-white p-2 shadow-md border border-gray-200 rounded-md">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm font-medium">{formatValue(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="stockpulse-card p-4 w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{symbol} Price Chart</h3>
        <div className="flex space-x-1">
          {(['1D', '1W', '1M', '3M', 'YTD', '1Y'] as const).map((range) => (
            <Button 
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              className={`py-1 px-2 text-xs ${
                timeRange === range 
                  ? 'bg-stockpulse-blue text-white' 
                  : 'text-gray-500 hover:text-stockpulse-blue'
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                const d = new Date(date);
                // For 1D view, show times, otherwise show dates
                return timeRange === '1D' 
                  ? d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                  : d.toLocaleDateString([], {month: 'short', day: 'numeric'});
              }}
              tick={{fontSize: 10}}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{fontSize: 10}} 
              tickFormatter={(value) => `$${value}`}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={lineColor} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;
