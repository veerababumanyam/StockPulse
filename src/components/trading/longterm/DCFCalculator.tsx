import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar
} from 'recharts';
import { Calculator, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

// Mock data for DCF calculation
interface YearlyData {
  year: number;
  revenue: number;
  growthRate: number;
  ebit: number;
  margin: number;
  nopat: number;
  depreciation: number;
  capex: number;
  nwcChange: number;
  fcf: number;
  discountedFcf: number;
}

interface SummaryData {
  enterpriseValue: number;
  netDebt: number;
  equityValue: number;
  sharesOutstanding: number;
  fairValue: number;
  discountRate: number;
  terminalGrowthRate: number;
  terminalValue: number;
  discountedTerminalValue: number;
}

const generateMockFinancialData = (years = 5): { yearlyData: YearlyData[]; summary: SummaryData } => {
  const data: YearlyData[] = [];
  const currentYear = new Date().getFullYear();
  
  // Base revenue and growth rate
  const revenue = 1000 + Math.random() * 500; // $1000M - $1500M
  const growthRate = 0.05 + Math.random() * 0.15; // 5% - 20%
  const marginImprovement = 0.002 + Math.random() * 0.005; // 0.2% - 0.7% per year
  // Current financials
  const operatingMargin = 0.15 + Math.random() * 0.10; // 15% - 25%
  const taxRate = 0.21 + Math.random() * 0.05; // 21% - 26%
  const capexPercent = 0.08 + Math.random() * 0.04; // 8% - 12% of revenue
  const depreciationPercent = 0.05 + Math.random() * 0.03; // 5% - 8% of revenue
  const nwcPercent = 0.10 + Math.random() * 0.05; // 10% - 15% of revenue
  // Terminal values
  const terminalGrowthRate = 0.02 + Math.random() * 0.01; // 2% - 3%
  const discountRate = 0.08 + Math.random() * 0.04; // 8% - 12%
  // Generate yearly data
  for (let i = 0; i <= years; i++) {
    const year = currentYear + i;
    const yearRevenue = revenue * Math.pow(1 + growthRate, i);
    const yearMargin = operatingMargin + (marginImprovement * i);
    const ebit = yearRevenue * yearMargin;
    const taxes = ebit * taxRate;
    const nopat = ebit - taxes;
    const depreciation = yearRevenue * depreciationPercent;
    const capex = yearRevenue * capexPercent;
    const nwcChange = i === 0 ? 0 : (yearRevenue - data[i-1].revenue) * nwcPercent;
    const fcf = nopat + depreciation - capex - nwcChange;
    data.push({
      year,
      revenue: parseFloat(yearRevenue.toFixed(1)),
      growthRate: parseFloat((i === 0 ? 0 : ((yearRevenue / data[i-1].revenue) - 1) * 100).toFixed(1)),
      ebit: parseFloat(ebit.toFixed(1)),
      margin: parseFloat((yearMargin * 100).toFixed(1)),
      nopat: parseFloat(nopat.toFixed(1)),
      depreciation: parseFloat(depreciation.toFixed(1)),
      capex: parseFloat(capex.toFixed(1)),
      nwcChange: parseFloat(nwcChange.toFixed(1)),
      fcf: parseFloat(fcf.toFixed(1)),
      discountedFcf: parseFloat((fcf / Math.pow(1 + discountRate, i)).toFixed(1))
    });
  }
  // Calculate terminal value
  const terminalFcf = data[years].fcf * (1 + terminalGrowthRate);
  const terminalValue = terminalFcf / (discountRate - terminalGrowthRate);
  const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate, years);
  // Calculate enterprise value
  const enterpriseValue = data.reduce((sum, year) => sum + year.discountedFcf, 0) + discountedTerminalValue;
  // Company specific data
  const netDebt = (0.2 + Math.random() * 0.3) * enterpriseValue; // 20% - 50% of EV
  const equityValue = enterpriseValue - netDebt;
  const sharesOutstanding = 100 + Math.random() * 900; // 100M - 1000M shares
  const fairValue = equityValue / sharesOutstanding;
  return {
    yearlyData: data,
    summary: {
      enterpriseValue: parseFloat(enterpriseValue.toFixed(1)),
      netDebt: parseFloat(netDebt.toFixed(1)),
      equityValue: parseFloat(equityValue.toFixed(1)),
      sharesOutstanding: parseFloat(sharesOutstanding.toFixed(1)),
      fairValue: parseFloat(fairValue.toFixed(2)),
      discountRate: parseFloat((discountRate * 100).toFixed(1)),
      terminalGrowthRate: parseFloat((terminalGrowthRate * 100).toFixed(1)),
      terminalValue: parseFloat(terminalValue.toFixed(1)),
      discountedTerminalValue: parseFloat(discountedTerminalValue.toFixed(1))
    }
  };
};

interface DCFCalculatorProps {
  symbol: string;
  currentPrice?: number;
  years?: number;
}

const DCFCalculator: React.FC<DCFCalculatorProps> = ({ 
  symbol, 
  currentPrice = 150.25,
  years = 5
}) => {
  const { colorTheme } = useTheme();
  const [data, setData] = useState<{ yearlyData: YearlyData[]; summary: SummaryData } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [discountRate, setDiscountRate] = useState<number>(10);
  const [terminalGrowthRate, setTerminalGrowthRate] = useState<number>(2);
  const [forecastYears, setForecastYears] = useState<number>(years);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Load data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const financialData = generateMockFinancialData(forecastYears);
        setData(financialData);
        setDiscountRate(financialData.summary.discountRate);
        setTerminalGrowthRate(financialData.summary.terminalGrowthRate);
        setLoading(false);
      } catch (err) {
        setError('Failed to load financial data');
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [forecastYears]);

  // Recalculate DCF when inputs change
  useEffect(() => {
    if (!data) return;
    
    // Update discount rate and terminal growth rate
    const updatedSummary = { ...data.summary };
    updatedSummary.discountRate = discountRate;
    updatedSummary.terminalGrowthRate = terminalGrowthRate;
    
    // Recalculate discounted FCF and terminal value
    const updatedYearlyData = data.yearlyData.map((year: any, index: number) => {
      const discountedFcf = year.fcf / Math.pow(1 + (discountRate / 100), index);
      return {
        ...year,
        discountedFcf: parseFloat(discountedFcf.toFixed(1))
      };
    });
    
    // Recalculate terminal value
    const lastYear = updatedYearlyData[updatedYearlyData.length - 1];
    const terminalFcf = lastYear.fcf * (1 + (terminalGrowthRate / 100));
    const terminalValue = terminalFcf / ((discountRate / 100) - (terminalGrowthRate / 100));
    const discountedTerminalValue = terminalValue / Math.pow(1 + (discountRate / 100), updatedYearlyData.length - 1);
    
    // Update summary
    updatedSummary.terminalValue = parseFloat(terminalValue.toFixed(1));
    updatedSummary.discountedTerminalValue = parseFloat(discountedTerminalValue.toFixed(1));
    
    // Recalculate enterprise value
    const enterpriseValue = updatedYearlyData.reduce((sum: number, year: any) => sum + year.discountedFcf, 0) + discountedTerminalValue;
    updatedSummary.enterpriseValue = parseFloat(enterpriseValue.toFixed(1));
    
    // Recalculate equity value and fair value
    updatedSummary.equityValue = parseFloat((enterpriseValue - updatedSummary.netDebt).toFixed(1));
    updatedSummary.fairValue = parseFloat((updatedSummary.equityValue / updatedSummary.sharesOutstanding).toFixed(2));
    
    // Update data
    setData({
      yearlyData: updatedYearlyData,
      summary: updatedSummary
    });
  }, [discountRate, terminalGrowthRate]);

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

  // Get valuation status
  const getValuationStatus = () => {
    if (!data) return { text: 'Loading...', color: 'text-gray-500' };
    
    const fairValue = data.summary.fairValue;
    const percentDiff = ((fairValue - currentPrice) / currentPrice) * 100;
    
    if (percentDiff > 20) {
      return { 
        text: 'Significantly Undervalued', 
        color: 'text-green-600 dark:text-green-400',
        icon: <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
      };
    } else if (percentDiff > 5) {
      return { 
        text: 'Moderately Undervalued', 
        color: 'text-green-600 dark:text-green-400',
        icon: <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
      };
    } else if (percentDiff < -20) {
      return { 
        text: 'Significantly Overvalued', 
        color: 'text-red-600 dark:text-red-400',
        icon: <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
      };
    } else if (percentDiff < -5) {
      return { 
        text: 'Moderately Overvalued', 
        color: 'text-red-600 dark:text-red-400',
        icon: <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
      };
    } else {
      return { 
        text: 'Fairly Valued', 
        color: 'text-yellow-600 dark:text-yellow-400',
        icon: <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      };
    }
  };

  // Guard for null data
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

  if (!data) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-primary-500" />
            DCF Valuation
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {symbol} • Discounted Cash Flow Analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Forecast:</span>
          <div className="flex space-x-1">
            {[3, 5, 7, 10].map((y) => (
              <button
                key={y}
                onClick={() => setForecastYears(y)}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  forecastYears === y
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {y}y
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Free Cash Flow Projection</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.yearlyData}
                  margin={{
                    top: 5,
                    right: 5,
                    left: 5,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(value) => `$${value}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value}M`, 'FCF']}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    name="Free Cash Flow" 
                    dataKey="fcf" 
                    fill={getPrimaryColor()} 
                    opacity={0.8} 
                  />
                  <Bar 
                    name="Discounted FCF" 
                    dataKey="discountedFcf" 
                    fill={getSecondaryColor()} 
                    opacity={0.8} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Revenue & Growth</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.yearlyData}
                  margin={{
                    top: 5,
                    right: 5,
                    left: 5,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(value) => `$${value}M`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'Revenue') return [`$${value}M`, name];
                      return [`${value}%`, name];
                    }}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    name="Revenue" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={getPrimaryColor()} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    yAxisId="right"
                    name="Growth Rate" 
                    type="monotone" 
                    dataKey="growthRate" 
                    stroke={getSecondaryColor()} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {showAdvanced && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Profitability Metrics</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.yearlyData}
                    margin={{
                      top: 5,
                      right: 5,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="year" 
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 10 }} 
                      tickFormatter={(value) => `$${value}M`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10 }} 
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'EBIT' || name === 'NOPAT') return [`$${value}M`, name];
                        return [`${value}%`, name];
                      }}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      name="EBIT" 
                      type="monotone" 
                      dataKey="ebit" 
                      stroke={getPrimaryColor()} 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line 
                      yAxisId="left"
                      name="NOPAT" 
                      type="monotone" 
                      dataKey="nopat" 
                      stroke={getSecondaryColor()} 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line 
                      yAxisId="right"
                      name="Operating Margin" 
                      type="monotone" 
                      dataKey="margin" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {showAdvanced ? 'Hide Advanced Charts' : 'Show Advanced Charts'}
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Valuation Summary</h4>
              <div className="flex items-center">
                {getValuationStatus().icon}
                <span className={`ml-1 text-sm font-medium ${getValuationStatus().color}`}>
                  {getValuationStatus().text}
                </span>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Current Price:</span>
                <span className="font-medium">${currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Fair Value:</span>
                <span className="font-medium">${data.summary.fairValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Upside/Downside:</span>
                <span className={`font-medium ${
                  data.summary.fairValue > currentPrice 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {((data.summary.fairValue - currentPrice) / currentPrice * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Enterprise Value:</span>
                <span className="font-medium">${data.summary.enterpriseValue.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">Net Debt:</span>
                <span className="font-medium">${data.summary.netDebt.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">Equity Value:</span>
                <span className="font-medium">${data.summary.equityValue.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">Shares Outstanding:</span>
                <span className="font-medium">{data.summary.sharesOutstanding.toFixed(1)}M</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg mb-6">
            <h4 className="font-medium mb-3">DCF Assumptions</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Discount Rate (WACC): {discountRate}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="0.5"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>5%</span>
                  <span>10%</span>
                  <span>15%</span>
                  <span>20%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Terminal Growth Rate: {terminalGrowthRate}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={terminalGrowthRate}
                  onChange={(e) => setTerminalGrowthRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span>1%</span>
                  <span>2%</span>
                  <span>3%</span>
                  <span>4%</span>
                  <span>5%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Terminal Value:</span>
                <span className="font-medium">${data.summary.terminalValue.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">% of Enterprise Value:</span>
                <span className="font-medium">
                  {((data.summary.discountedTerminalValue / data.summary.enterpriseValue) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Sensitivity Analysis</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Fair value ($) at different discount and growth rates
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 bg-gray-50 dark:bg-gray-900/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      WACC ↓ / g →
                    </th>
                    {[1, 2, 3, 4].map((g) => (
                      <th key={g} className="px-2 py-1 bg-gray-50 dark:bg-gray-900/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {g}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {[8, 10, 12, 14].map((wacc, i) => (
                    <tr key={wacc} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/20'}>
                      <td className="px-2 py-1 whitespace-nowrap font-medium">
                        {wacc}%
                      </td>
                      {[1, 2, 3, 4].map((g) => {
                        // Simple sensitivity calculation
                        const multiplier = (wacc === discountRate && g === terminalGrowthRate) ? 1 : 
                                          (wacc < discountRate) ? (1 + (discountRate - wacc) * 0.05) :
                                          (1 - (wacc - discountRate) * 0.05);
                        const growthMultiplier = (g > terminalGrowthRate) ? 
                                               (1 + (g - terminalGrowthRate) * 0.03) : 
                                               (1 - (terminalGrowthRate - g) * 0.03);
                        const value = data.summary.fairValue * multiplier * growthMultiplier;
                        
                        const isHighlighted = wacc === Math.round(discountRate) && g === Math.round(terminalGrowthRate);
                        
                        return (
                          <td 
                            key={g} 
                            className={`px-2 py-1 whitespace-nowrap ${
                              isHighlighted ? 'bg-primary-100 dark:bg-primary-900/30 font-medium' : ''
                            } ${
                              value > currentPrice 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            ${value.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium mb-2">Valuation Analysis</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Based on our DCF analysis, {symbol} appears to be {
            data.summary.fairValue > currentPrice 
              ? `undervalued by ${((data.summary.fairValue - currentPrice) / currentPrice * 100).toFixed(1)}%. ` 
              : `overvalued by ${((currentPrice - data.summary.fairValue) / currentPrice * 100).toFixed(1)}%. `
          }
          The fair value estimate of ${data.summary.fairValue.toFixed(2)} is derived from projected free cash flows over the next {forecastYears} years, 
          discounted at a WACC of {discountRate}% and assuming a terminal growth rate of {terminalGrowthRate}%.
          {
            data.summary.discountedTerminalValue / data.summary.enterpriseValue > 0.7
              ? ' Note that terminal value represents a significant portion of the total valuation, which increases uncertainty.'
              : ''
          }
          {
            data.yearlyData[1].growthRate > 15
              ? ' The model assumes relatively high growth rates in the near term, which may be optimistic.'
              : ' The model assumes moderate growth rates, which appear reasonable given historical performance.'
          }
        </p>
      </div>
    </div>
  );
};

export default DCFCalculator;
