import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Info,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

// Mock data for dividend chart
const generateMockDividendData = (years = 10) => {
  const data = [];
  const currentYear = new Date().getFullYear();

  // Base dividend and growth rate
  let dividend = 0.5 + Math.random() * 1.5; // $0.50 - $2.00 per share
  const growthRate = 0.03 + Math.random() * 0.07; // 3% - 10%

  // Generate yearly data
  for (let i = 0; i < years; i++) {
    const year = currentYear - years + i;

    // Add some randomness to growth
    const yearGrowth = growthRate + (Math.random() * 0.04 - 0.02); // +/- 2%

    if (i > 0) {
      dividend = dividend * (1 + yearGrowth);
    }

    // Calculate payout ratio and yield
    const eps = dividend / (0.3 + Math.random() * 0.3); // 30% - 60% payout ratio
    const payoutRatio = (dividend / eps) * 100;

    // Assume stock price grows with EPS but with more volatility
    const stockPrice = eps * (10 + Math.random() * 10); // P/E of 10-20
    const dividendYield = (dividend / stockPrice) * 100;

    data.push({
      year,
      dividend: parseFloat(dividend.toFixed(2)),
      growth: parseFloat(
        (i === 0 ? 0 : (dividend / data[i - 1].dividend - 1) * 100).toFixed(1),
      ),
      payoutRatio: parseFloat(payoutRatio.toFixed(1)),
      yield: parseFloat(dividendYield.toFixed(2)),
      stockPrice: parseFloat(stockPrice.toFixed(2)),
    });
  }

  // Generate future projections
  for (let i = 0; i < 5; i++) {
    const year = currentYear + i;
    const lastDividend = data[data.length - 1].dividend;
    const projectedGrowth = growthRate + (Math.random() * 0.02 - 0.01); // +/- 1%
    const projectedDividend =
      lastDividend * Math.pow(1 + projectedGrowth, i + 1);

    // Calculate payout ratio and yield
    const eps = projectedDividend / (0.3 + Math.random() * 0.3); // 30% - 60% payout ratio
    const payoutRatio = (projectedDividend / eps) * 100;

    // Assume stock price grows with EPS but with more volatility
    const stockPrice = eps * (10 + Math.random() * 10); // P/E of 10-20
    const dividendYield = (projectedDividend / stockPrice) * 100;

    data.push({
      year,
      dividend: parseFloat(projectedDividend.toFixed(2)),
      growth: parseFloat((projectedDividend / lastDividend - 1) * 100).toFixed(
        1,
      ),
      payoutRatio: parseFloat(payoutRatio.toFixed(1)),
      yield: parseFloat(dividendYield.toFixed(2)),
      stockPrice: parseFloat(stockPrice.toFixed(2)),
      isProjection: true,
    });
  }

  // Calculate summary metrics
  const currentDividend =
    data.find((d) => d.year === currentYear - 1)?.dividend || 0;
  const fiveYearCAGR =
    Math.pow(currentDividend / data[0].dividend, 1 / Math.min(5, years)) - 1;
  const tenYearCAGR =
    Math.pow(currentDividend / data[0].dividend, 1 / Math.min(10, years)) - 1;
  const averageYield = data.slice(-5).reduce((sum, d) => sum + d.yield, 0) / 5;
  const averagePayoutRatio =
    data.slice(-5).reduce((sum, d) => sum + d.payoutRatio, 0) / 5;
  const dividendSafety = calculateDividendSafety(
    averagePayoutRatio,
    fiveYearCAGR,
  );

  return {
    yearlyData: data,
    summary: {
      currentDividend,
      fiveYearCAGR: parseFloat((fiveYearCAGR * 100).toFixed(2)),
      tenYearCAGR: parseFloat((tenYearCAGR * 100).toFixed(2)),
      averageYield: parseFloat(averageYield.toFixed(2)),
      averagePayoutRatio: parseFloat(averagePayoutRatio.toFixed(1)),
      dividendSafety,
      consecutiveYearsIncreased: calculateConsecutiveYears(data),
      totalReturn: parseFloat(
        (data[data.length - 1].stockPrice / data[0].stockPrice - 1).toFixed(2),
      ),
    },
  };
};

// Helper function to calculate dividend safety score
const calculateDividendSafety = (payoutRatio: number, growthRate: number) => {
  let score = 0;

  // Payout ratio component (0-50 points)
  if (payoutRatio < 30) score += 50;
  else if (payoutRatio < 50) score += 40;
  else if (payoutRatio < 60) score += 30;
  else if (payoutRatio < 75) score += 20;
  else if (payoutRatio < 90) score += 10;

  // Growth rate component (0-50 points)
  if (growthRate > 10) score += 50;
  else if (growthRate > 7) score += 40;
  else if (growthRate > 5) score += 30;
  else if (growthRate > 3) score += 20;
  else if (growthRate > 0) score += 10;

  return score;
};

// Helper function to calculate consecutive years of dividend increases
const calculateConsecutiveYears = (data: any[]) => {
  let count = 0;

  for (let i = data.length - 1; i > 0; i--) {
    if (data[i].dividend > data[i - 1].dividend) {
      count++;
    } else {
      break;
    }
  }

  return count;
};

interface DividendChartProps {
  symbol: string;
  currentPrice?: number;
  showProjections?: boolean;
}

const DividendChart: React.FC<DividendChartProps> = ({
  symbol,
  currentPrice = 150.25,
  showProjections = true,
}) => {
  const { colorTheme } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'dividend' | 'yield' | 'growth'>(
    'dividend',
  );
  const [showAllData, setShowAllData] = useState<boolean>(false);

  // Load data
  useEffect(() => {
    setLoading(true);

    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const dividendData = generateMockDividendData();
        setData(dividendData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dividend data');
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

  // Get dividend safety rating
  const getDividendSafetyRating = () => {
    if (!data) return { text: 'Loading...', color: 'text-gray-500' };

    const score = data.summary.dividendSafety;

    if (score >= 80) {
      return {
        text: 'Very Safe',
        color: 'text-green-600 dark:text-green-400',
        description:
          'Low payout ratio and strong dividend growth history indicate very sustainable dividends.',
      };
    } else if (score >= 60) {
      return {
        text: 'Safe',
        color: 'text-green-600 dark:text-green-400',
        description:
          'Reasonable payout ratio and good dividend growth history suggest sustainable dividends.',
      };
    } else if (score >= 40) {
      return {
        text: 'Average',
        color: 'text-yellow-600 dark:text-yellow-400',
        description:
          'Moderate payout ratio and dividend growth indicate generally sustainable dividends with some risk.',
      };
    } else if (score >= 20) {
      return {
        text: 'At Risk',
        color: 'text-orange-600 dark:text-orange-400',
        description:
          'High payout ratio or weak dividend growth history suggest potential dividend sustainability issues.',
      };
    } else {
      return {
        text: 'Unsafe',
        color: 'text-red-600 dark:text-red-400',
        description:
          'Very high payout ratio and/or declining dividends indicate significant risk to dividend sustainability.',
      };
    }
  };

  // Filter data based on showAllData
  const getFilteredData = () => {
    if (!data) return [];

    if (showAllData) {
      return data.yearlyData;
    } else {
      // Show last 5 years of historical data and projections if enabled
      const historicalData = data.yearlyData
        .filter((d: any) => !d.isProjection)
        .slice(-5);
      const projectionData = showProjections
        ? data.yearlyData.filter((d: any) => d.isProjection)
        : [];
      return [...historicalData, ...projectionData];
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
            Dividend Analysis
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {symbol} • ${currentPrice.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setChartType('dividend')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                chartType === 'dividend'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Dividend
            </button>
            <button
              onClick={() => setChartType('yield')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                chartType === 'yield'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Yield
            </button>
            <button
              onClick={() => setChartType('growth')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                chartType === 'growth'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Growth
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium">
                {chartType === 'dividend'
                  ? 'Dividend History & Projections'
                  : chartType === 'yield'
                    ? 'Dividend Yield History'
                    : 'Dividend Growth Rate'}
              </h4>
              <div className="flex items-center space-x-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showProjections}
                    onChange={() => setShowProjections(!showProjections)}
                    className="sr-only peer"
                  />
                  <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <span className="ml-2 text-xs text-gray-600 dark:text-gray-300">
                    Show Projections
                  </span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllData}
                    onChange={() => setShowAllData(!showAllData)}
                    className="sr-only peer"
                  />
                  <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <span className="ml-2 text-xs text-gray-600 dark:text-gray-300">
                    Show All History
                  </span>
                </label>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'dividend' ? (
                  <BarChart
                    data={getFilteredData()}
                    margin={{
                      top: 5,
                      right: 5,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#ccc"
                      strokeOpacity={0.3}
                    />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `$${value}`,
                        'Dividend Per Share',
                      ]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Legend />
                    <Bar
                      name="Dividend Per Share"
                      dataKey="dividend"
                      fill={getPrimaryColor()}
                      opacity={0.8}
                      shape={(props: any) => {
                        const { x, y, width, height, isProjection } = props;
                        return (
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={props.fill}
                            opacity={props.payload.isProjection ? 0.5 : 0.8}
                            stroke={
                              props.payload.isProjection ? '#000' : 'none'
                            }
                            strokeDasharray={
                              props.payload.isProjection ? '3 3' : '0'
                            }
                            strokeWidth={props.payload.isProjection ? 1 : 0}
                          />
                        );
                      }}
                    />
                  </BarChart>
                ) : chartType === 'yield' ? (
                  <LineChart
                    data={getFilteredData()}
                    margin={{
                      top: 5,
                      right: 5,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#ccc"
                      strokeOpacity={0.3}
                    />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value}%`,
                        'Dividend Yield',
                      ]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Legend />
                    <Line
                      name="Dividend Yield"
                      type="monotone"
                      dataKey="yield"
                      stroke={getPrimaryColor()}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      strokeDasharray={(d: any) =>
                        d.isProjection ? '5 5' : '0'
                      }
                    />
                    <ReferenceLine
                      y={data.summary.averageYield}
                      stroke="#666"
                      strokeDasharray="3 3"
                      label={{
                        value: 'Avg Yield',
                        position: 'right',
                        fill: '#666',
                        fontSize: 10,
                      }}
                    />
                  </LineChart>
                ) : (
                  <BarChart
                    data={getFilteredData().filter(
                      (d: any, i: number, arr: any[]) => i > 0,
                    )}
                    margin={{
                      top: 5,
                      right: 5,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#ccc"
                      strokeOpacity={0.3}
                    />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value}%`,
                        'Growth Rate',
                      ]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Legend />
                    <Bar
                      name="Dividend Growth Rate"
                      dataKey="growth"
                      fill={getPrimaryColor()}
                      opacity={0.8}
                      shape={(props: any) => {
                        const { x, y, width, height } = props;
                        const value = props.payload.growth;
                        return (
                          <rect
                            x={x}
                            y={value >= 0 ? y : y + height}
                            width={width}
                            height={Math.abs(height)}
                            fill={
                              value >= 0
                                ? getPrimaryColor()
                                : getSecondaryColor()
                            }
                            opacity={props.payload.isProjection ? 0.5 : 0.8}
                            stroke={
                              props.payload.isProjection ? '#000' : 'none'
                            }
                            strokeDasharray={
                              props.payload.isProjection ? '3 3' : '0'
                            }
                            strokeWidth={props.payload.isProjection ? 1 : 0}
                          />
                        );
                      }}
                    />
                    <ReferenceLine y={0} stroke="#666" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">
              Dividend vs. Stock Price
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getFilteredData()}
                  margin={{
                    top: 5,
                    right: 5,
                    left: 5,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ccc"
                    strokeOpacity={0.3}
                  />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `$${value}`}
                    domain={[
                      0,
                      (dataMax: number) => Math.max(dataMax * 1.1, 5),
                    ]}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      return [`$${value}`, name];
                    }}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    name="Stock Price"
                    type="monotone"
                    dataKey="stockPrice"
                    stroke={getSecondaryColor()}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    strokeDasharray={(d: any) => (d.isProjection ? '5 5' : '0')}
                  />
                  <Line
                    yAxisId="right"
                    name="Dividend (10x scale)"
                    type="monotone"
                    dataKey={(d) => d.dividend * 10} // Scale up for visibility
                    stroke={getPrimaryColor()}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    strokeDasharray={(d: any) => (d.isProjection ? '5 5' : '0')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>
              {showProjections &&
                'Dashed/lighter areas represent projections based on historical trends.'}
            </span>
            <span>Data source: Company filings, financial analysis</span>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Dividend Summary</h4>
              <div className="flex items-center">
                <span
                  className={`text-sm font-medium ${getDividendSafetyRating().color}`}
                >
                  {getDividendSafetyRating().text}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Current Dividend:
                </span>
                <span className="font-medium">
                  ${data.summary.currentDividend.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Current Yield:
                </span>
                <span className="font-medium">
                  {(
                    (data.summary.currentDividend / currentPrice) *
                    100
                  ).toFixed(2)}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  5-Year CAGR:
                </span>
                <span
                  className={`font-medium ${
                    data.summary.fiveYearCAGR > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {data.summary.fiveYearCAGR > 0 ? '+' : ''}
                  {data.summary.fiveYearCAGR}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Consecutive Increases:
                </span>
                <span className="font-medium">
                  {data.summary.consecutiveYearsIncreased} years
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Payout Ratio:
                </span>
                <span className="font-medium">
                  {data.summary.averagePayoutRatio}%
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Average Yield:
                </span>
                <span className="font-medium">
                  {data.summary.averageYield}%
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Total Return:
                </span>
                <span
                  className={`font-medium ${
                    data.summary.totalReturn > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {data.summary.totalReturn > 0 ? '+' : ''}
                  {(data.summary.totalReturn * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg mb-6">
            <h4 className="font-medium mb-3">Dividend Safety</h4>

            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className={`h-2.5 rounded-full ${
                    data.summary.dividendSafety >= 80
                      ? 'bg-green-600'
                      : data.summary.dividendSafety >= 60
                        ? 'bg-green-500'
                        : data.summary.dividendSafety >= 40
                          ? 'bg-yellow-500'
                          : data.summary.dividendSafety >= 20
                            ? 'bg-orange-500'
                            : 'bg-red-600'
                  }`}
                  style={{ width: `${data.summary.dividendSafety}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Unsafe</span>
                <span>At Risk</span>
                <span>Average</span>
                <span>Safe</span>
                <span>Very Safe</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
              {getDividendSafetyRating().description}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Income Projection</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Investment Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value="10,000"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    readOnly
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                <h5 className="text-sm font-medium mb-2">
                  Annual Dividend Income
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Current
                    </p>
                    <p className="font-medium">
                      $
                      {(
                        (10000 / currentPrice) *
                        data.summary.currentDividend
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Year 5 (Est.)
                    </p>
                    <p className="font-medium">
                      $
                      {(
                        (10000 / currentPrice) *
                        data.yearlyData[data.yearlyData.length - 1].dividend
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Yield on Cost
                    </p>
                    <p className="font-medium">
                      {(
                        (data.summary.currentDividend / currentPrice) *
                        100
                      ).toFixed(2)}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Future YoC (Est.)
                    </p>
                    <p className="font-medium">
                      {(
                        (data.yearlyData[data.yearlyData.length - 1].dividend /
                          currentPrice) *
                        100
                      ).toFixed(2)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium mb-2">Dividend Analysis</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {symbol} has maintained a{' '}
          {data.summary.consecutiveYearsIncreased > 5 ? 'strong' : 'consistent'}{' '}
          dividend history with
          {data.summary.consecutiveYearsIncreased > 0
            ? ` ${data.summary.consecutiveYearsIncreased} consecutive years of dividend increases`
            : ' regular dividend payments'}
          . The current dividend yield of{' '}
          {((data.summary.currentDividend / currentPrice) * 100).toFixed(2)}% is
          {data.summary.averageYield >
          (data.summary.currentDividend / currentPrice) * 100
            ? ' below'
            : ' above'}{' '}
          its 5-year average of {data.summary.averageYield}%. With a payout
          ratio of {data.summary.averagePayoutRatio}%, the dividend appears to
          be
          {data.summary.averagePayoutRatio < 50
            ? ' well-covered by earnings, leaving room for future increases.'
            : data.summary.averagePayoutRatio < 75
              ? ' adequately covered by earnings, though with less room for significant increases.'
              : ' somewhat stretched, which could limit future dividend growth potential.'}
          The 5-year dividend growth rate of {data.summary.fiveYearCAGR}% is
          {data.summary.fiveYearCAGR > 7
            ? " impressive and well above inflation, suggesting management's commitment to returning value to shareholders."
            : data.summary.fiveYearCAGR > 3
              ? ' solid and above inflation, indicating a balanced approach to shareholder returns.'
              : data.summary.fiveYearCAGR > 0
                ? ' modest but positive, keeping pace with or slightly above inflation.'
                : ' negative, which could be a concern for income-focused investors.'}
          Overall, {symbol}'s dividend can be considered{' '}
          {getDividendSafetyRating().text.toLowerCase()} for income-focused
          investors.
        </p>
      </div>
    </div>
  );
};

export default DividendChart;
