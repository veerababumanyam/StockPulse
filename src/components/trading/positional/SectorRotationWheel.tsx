import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, Sector, ResponsiveContainer, 
  Tooltip, Legend
} from 'recharts';
import { Compass, TrendingUp, TrendingDown, ArrowRight, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Mock data for the sector rotation wheel
const generateMockSectorData = () => {
  const sectors = [
    { name: 'Technology', value: 0, performance: 0, momentum: 0, phase: '' },
    { name: 'Healthcare', value: 0, performance: 0, momentum: 0, phase: '' },
    { name: 'Financials', value: 0, performance: 0, momentum: 0, phase: '' },
    { name: 'Consumer Discretionary', value: 0, performance: 0, momentum: 0, phase: '' },
    { name: 'Communication Services', value: 0, performance: 0, momentum: 0, phase: '' },
    { name: 'Industrials', value: 0, performance: 0, momentum: 0, phase: '' },
    { name: 'Consumer Staples', value: 0, performance: 0, momentum: 0, phase: '' },
    { name: 'Energy', value: 0, performance: 0, momentum: 0, phase: '' },
    { name: 'Utilities', value: 0, performance: 0, momentum: 0, phase: '' },
    { name: 'Materials', value: 0, performance: 0, momentum: 0, phase: '' },
    { name: 'Real Estate', value: 0, performance: 0, momentum: 0, phase: '' }
  ];
  
  // Assign random values to each sector
  const phases = ['Early Expansion', 'Late Expansion', 'Early Contraction', 'Late Contraction'];
  
  return sectors.map(sector => {
    const value = Math.floor(Math.random() * 20) + 5; // 5-25
    const performance = parseFloat((Math.random() * 40 - 20).toFixed(2)); // -20% to +20%
    const momentum = parseFloat((Math.random() * 10 - 5).toFixed(2)); // -5 to +5
    const phase = phases[Math.floor(Math.random() * phases.length)];
    
    return {
      ...sector,
      value,
      performance,
      momentum,
      phase
    };
  });
};

interface SectorRotationWheelProps {
  timeframe?: '1W' | '1M' | '3M' | '6M' | '1Y';
  showPerformance?: boolean;
  showMomentum?: boolean;
}

const SectorRotationWheel: React.FC<SectorRotationWheelProps> = ({ 
  timeframe = '3M',
  showPerformance = true,
  showMomentum = true
}) => {
  const { colorTheme } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(timeframe);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [marketPhase, setMarketPhase] = useState<string>('Expansion');
  const [selectedSector, setSelectedSector] = useState<any>(null);

  // Load data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const mockData = generateMockSectorData();
        setData(mockData);
        
        // Set a random market phase
        const phases = ['Early Expansion', 'Late Expansion', 'Early Contraction', 'Late Contraction'];
        setMarketPhase(phases[Math.floor(Math.random() * phases.length)]);
        
        // Set the first sector as selected
        setSelectedSector(mockData[0]);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load sector rotation data');
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [selectedTimeframe]);

  // Get colors based on current theme
  const getThemeColors = () => {
    switch (colorTheme) {
      case 'tropical-jungle':
        return ['#29A329', '#32CD32', '#FFFF00', '#013220', '#F5FFFA'];
      case 'ocean-sunset':
        return ['#008B8B', '#FF7F50', '#FFCBA4', '#191970', '#F0F8FF'];
      case 'desert-storm':
        return ['#C19A6B', '#B7410E', '#F4A460', '#654321', '#F9F6E7'];
      case 'berry-fields':
        return ['#8E4585', '#FF1493', '#E6E6FA', '#614051', '#FFF0F5'];
      case 'arctic-moss':
        return ['#4682B4', '#9CAF88', '#B0E0E6', '#36454F', '#F8F8FF'];
      default:
        return ['#FF1493', '#000000', '#FFFFFF', '#000000', '#FFFFFF'];
    }
  };

  // Get performance color
  const getPerformanceColor = (value: number) => {
    if (value > 5) return 'text-green-600 dark:text-green-400';
    if (value < -5) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };
  
  // Get momentum icon
  const getMomentumIcon = (value: number) => {
    if (value > 2) return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
    if (value < -2) return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
    return <ArrowRight className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
  };
  
  // Get phase color
  const getPhaseColor = (phase: string) => {
    if (phase.includes('Expansion')) return 'text-green-600 dark:text-green-400';
    if (phase.includes('Contraction')) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  // Handle pie chart hover
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
    setSelectedSector(data[index]);
  };

  // Custom active shape for the pie chart
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.8}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">
          {payload.name}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
          {`${(percent * 100).toFixed(2)}%`}
        </text>
      </g>
    );
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
            <Compass className="mr-2 h-5 w-5 text-primary-500" />
            Sector Rotation Wheel
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Market cycle analysis and sector performance
          </p>
        </div>
        <div className="flex space-x-1">
          {['1W', '1M', '3M', '6M', '1Y'].map((tf) => (
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex flex-col items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getThemeColors()[index % getThemeColors().length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => {
                      return [`${value}%`, props.payload.name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 max-w-md">
              <div className="flex items-center">
                <Info className="w-4 h-4 text-primary-500 mr-2" />
                <h4 className="font-medium">Current Market Phase</h4>
              </div>
              <p className={`text-sm mt-1 ${getPhaseColor(marketPhase)}`}>
                {marketPhase}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {marketPhase.includes('Early Expansion') ? (
                  'Recovery phase with technology and consumer discretionary sectors typically outperforming.'
                ) : marketPhase.includes('Late Expansion') ? (
                  'Growth phase with industrials and materials sectors typically outperforming.'
                ) : marketPhase.includes('Early Contraction') ? (
                  'Slowdown phase with utilities and consumer staples sectors typically outperforming.'
                ) : (
                  'Recession phase with healthcare and defensive sectors typically outperforming.'
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <h4 className="text-sm font-medium mb-3">Sector Performance</h4>
          
          {selectedSector ? (
            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg mb-4">
              <h5 className="font-medium">{selectedSector.name}</h5>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Performance</p>
                  <p className={`font-medium ${getPerformanceColor(selectedSector.performance)}`}>
                    {selectedSector.performance > 0 ? '+' : ''}{selectedSector.performance}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Momentum</p>
                  <div className="flex items-center">
                    {getMomentumIcon(selectedSector.momentum)}
                    <span className="ml-1 font-medium">
                      {selectedSector.momentum > 0 ? '+' : ''}{selectedSector.momentum}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Allocation</p>
                  <p className="font-medium">
                    {selectedSector.value}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phase</p>
                  <p className={`font-medium ${getPhaseColor(selectedSector.phase)}`}>
                    {selectedSector.phase}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg mb-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a sector to view details
              </p>
            </div>
          )}
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {data.map((sector, index) => (
              <div 
                key={index}
                className={`p-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                  selectedSector?.name === sector.name 
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                }`}
                onClick={() => setSelectedSector(sector)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: getThemeColors()[index % getThemeColors().length] }}
                    ></div>
                    <h5 className="font-medium text-sm">{sector.name}</h5>
                  </div>
                  <span className={`text-xs font-medium ${getPerformanceColor(sector.performance)}`}>
                    {sector.performance > 0 ? '+' : ''}{sector.performance}%
                  </span>
                </div>
                {showMomentum && (
                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>Momentum:</span>
                    <div className="flex items-center ml-1">
                      {getMomentumIcon(sector.momentum)}
                      <span className="ml-1">
                        {sector.momentum > 0 ? '+' : ''}{sector.momentum}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium mb-2">Sector Rotation Strategy</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          The market is currently in the <span className={getPhaseColor(marketPhase)}>{marketPhase}</span> phase of the economic cycle. 
          {marketPhase.includes('Early Expansion') ? (
            ' Consider overweighting technology, consumer discretionary, and financial sectors while reducing exposure to utilities and consumer staples.'
          ) : marketPhase.includes('Late Expansion') ? (
            ' Consider overweighting industrials, materials, and energy sectors while reducing exposure to technology and consumer discretionary.'
          ) : marketPhase.includes('Early Contraction') ? (
            ' Consider overweighting utilities, consumer staples, and healthcare sectors while reducing exposure to industrials and materials.'
          ) : (
            ' Consider overweighting healthcare, utilities, and defensive sectors while reducing exposure to cyclicals and financials.'
          )}
        </p>
      </div>
    </div>
  );
};

export default SectorRotationWheel;
