/**
 * Portfolio Calculations Utilities
 * Pure functions for portfolio metrics calculations and data transformations
 * Optimized for performance with memoization support
 */
import { Portfolio, PortfolioPosition, Transaction, PerformanceMetrics } from '../types/portfolio';

// Constants for calculations
export const TRADING_DAYS_PER_YEAR = 252;
export const RISK_FREE_RATE = 0.02; // 2% annual risk-free rate

// Number formatting utilities
export const formatCurrency = (
  value: number,
  options: {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
  } = {}
): string => {
  const {
    currency = 'USD',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    compact = false,
  } = options;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  });

  return formatter.format(value);
};

export const formatPercentage = (
  value: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSign?: boolean;
  } = {}
): string => {
  const {
    minimumFractionDigits = 1,
    maximumFractionDigits = 2,
    showSign = true,
  } = options;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay: showSign ? 'exceptZero' : 'auto',
  });

  return formatter.format(value / 100);
};

export const formatNumber = (
  value: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
  } = {}
): string => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    compact = false,
  } = options;

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  });

  return formatter.format(value);
};

// Portfolio calculation functions
export const calculatePortfolioValue = (positions: PortfolioPosition[]): number => {
  return positions.reduce((total, position) => total + position.market_value, 0);
};

export const calculateTotalCost = (positions: PortfolioPosition[]): number => {
  return positions.reduce((total, position) => total + position.total_cost, 0);
};

export const calculateTotalPnL = (positions: PortfolioPosition[]): number => {
  return positions.reduce((total, position) => total + position.unrealized_pnl, 0);
};

export const calculateTotalPnLPercentage = (
  totalPnL: number,
  totalCost: number
): number => {
  if (totalCost === 0) return 0;
  return (totalPnL / totalCost) * 100;
};

export const calculateDayPnL = (positions: PortfolioPosition[]): number => {
  return positions.reduce((total, position) => total + position.day_pnl, 0);
};

export const calculatePortfolioWeights = (
  positions: PortfolioPosition[],
  totalValue: number
): PortfolioPosition[] => {
  if (totalValue === 0) {
    return positions.map(pos => ({ ...pos, weight_percentage: 0 }));
  }

  return positions.map(position => ({
    ...position,
    weight_percentage: (position.market_value / totalValue) * 100,
  }));
};

// Position sorting and filtering
export type SortOption = 'symbol' | 'value' | 'pnl' | 'percentage' | 'weight';
export type SortOrder = 'ASC' | 'DESC';

export const sortPositions = (
  positions: PortfolioPosition[],
  sortBy: SortOption,
  sortOrder: SortOrder = 'DESC'
): PortfolioPosition[] => {
  const sortedPositions = [...positions].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case 'symbol':
        aValue = a.symbol;
        bValue = b.symbol;
        break;
      case 'value':
        aValue = a.market_value;
        bValue = b.market_value;
        break;
      case 'pnl':
        aValue = a.unrealized_pnl;
        bValue = b.unrealized_pnl;
        break;
      case 'percentage':
        aValue = a.unrealized_pnl_percentage;
        bValue = b.unrealized_pnl_percentage;
        break;
      case 'weight':
        aValue = a.weight_percentage;
        bValue = b.weight_percentage;
        break;
      default:
        aValue = a.market_value;
        bValue = b.market_value;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'ASC' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    const numA = Number(aValue);
    const numB = Number(bValue);
    
    return sortOrder === 'ASC' ? numA - numB : numB - numA;
  });

  return sortedPositions;
};

export const filterPositions = (
  positions: PortfolioPosition[],
  filters: {
    search?: string;
    minValue?: number;
    maxValue?: number;
    profitableOnly?: boolean;
    topN?: number;
  }
): PortfolioPosition[] => {
  const {
    search,
    minValue,
    maxValue,
    profitableOnly,
    topN,
  } = filters;

  let filtered = [...positions];

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(position =>
      position.symbol.toLowerCase().includes(searchLower)
    );
  }

  // Value range filters
  if (minValue !== undefined) {
    filtered = filtered.filter(position => position.market_value >= minValue);
  }

  if (maxValue !== undefined) {
    filtered = filtered.filter(position => position.market_value <= maxValue);
  }

  // Profitable only filter
  if (profitableOnly) {
    filtered = filtered.filter(position => position.unrealized_pnl > 0);
  }

  // Top N filter
  if (topN) {
    filtered = filtered
      .sort((a, b) => b.market_value - a.market_value)
      .slice(0, topN);
  }

  return filtered;
};

// Performance calculations
export const calculateSharpeRatio = (
  returns: number[],
  riskFreeRate: number = RISK_FREE_RATE
): number => {
  if (returns.length < 2) return 0;

  const annualizedRiskFreeRate = riskFreeRate / TRADING_DAYS_PER_YEAR;
  const excessReturns = returns.map(r => r - annualizedRiskFreeRate);
  
  const meanExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
  const variance = excessReturns.reduce((sum, r) => sum + Math.pow(r - meanExcessReturn, 2), 0) / (excessReturns.length - 1);
  const standardDeviation = Math.sqrt(variance);
  
  if (standardDeviation === 0) return 0;
  
  return (meanExcessReturn / standardDeviation) * Math.sqrt(TRADING_DAYS_PER_YEAR);
};

export const calculateVolatility = (returns: number[]): number => {
  if (returns.length < 2) return 0;

  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1);
  
  return Math.sqrt(variance * TRADING_DAYS_PER_YEAR) * 100; // Annualized percentage
};

export const calculateMaxDrawdown = (values: number[]): number => {
  if (values.length < 2) return 0;

  let maxDrawdown = 0;
  let peak = values[0];

  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i];
    } else {
      const drawdown = (peak - values[i]) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }

  return maxDrawdown * 100; // Return as percentage
};

export const calculateBeta = (
  portfolioReturns: number[],
  marketReturns: number[]
): number => {
  if (portfolioReturns.length !== marketReturns.length || portfolioReturns.length < 2) {
    return 1; // Default beta
  }

  const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
  const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;

  let covariance = 0;
  let marketVariance = 0;

  for (let i = 0; i < portfolioReturns.length; i++) {
    const portfolioDeviation = portfolioReturns[i] - portfolioMean;
    const marketDeviation = marketReturns[i] - marketMean;
    
    covariance += portfolioDeviation * marketDeviation;
    marketVariance += marketDeviation * marketDeviation;
  }

  if (marketVariance === 0) return 1;

  return covariance / marketVariance;
};

// Transaction analysis
export const calculateTradingCosts = (transactions: Transaction[]): number => {
  return transactions.reduce((total, transaction) => total + transaction.fees, 0);
};

export const calculateTurnoverRate = (
  transactions: Transaction[],
  averagePortfolioValue: number,
  timeframe: 'monthly' | 'quarterly' | 'annual' = 'annual'
): number => {
  if (averagePortfolioValue === 0) return 0;

  const totalTraded = transactions
    .filter(t => t.transaction_type === 'BUY' || t.transaction_type === 'SELL')
    .reduce((total, transaction) => total + Math.abs(transaction.total_amount), 0);

  let multiplier = 1;
  switch (timeframe) {
    case 'monthly':
      multiplier = 12;
      break;
    case 'quarterly':
      multiplier = 4;
      break;
    case 'annual':
      multiplier = 1;
      break;
  }

  return (totalTraded / averagePortfolioValue) * multiplier;
};

// Risk metrics
export const calculateValueAtRisk = (
  returns: number[],
  confidenceLevel: number = 0.95,
  portfolioValue: number
): number => {
  if (returns.length === 0) return 0;

  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  const var95 = sortedReturns[index] || 0;

  return Math.abs(var95 * portfolioValue);
};

// Utility for memoization keys
export const createCalculationKey = (
  positions: PortfolioPosition[],
  additionalData?: any
): string => {
  const positionHash = positions
    .map(p => `${p.id}-${p.current_price}-${p.quantity}`)
    .join('|');
  
  const additionalHash = additionalData 
    ? JSON.stringify(additionalData)
    : '';

  return `${positionHash}-${additionalHash}`;
};

// Data transformation utilities
export const transformPositionsForChart = (
  positions: PortfolioPosition[]
): Array<{ name: string; value: number; percentage: number }> => {
  const totalValue = calculatePortfolioValue(positions);
  
  return positions.map(position => ({
    name: position.symbol,
    value: position.market_value,
    percentage: totalValue > 0 ? (position.market_value / totalValue) * 100 : 0,
  }));
};

export const groupTransactionsByDate = (
  transactions: Transaction[],
  groupBy: 'day' | 'week' | 'month' = 'day'
): Record<string, Transaction[]> => {
  const grouped: Record<string, Transaction[]> = {};

  transactions.forEach(transaction => {
    const date = new Date(transaction.transaction_date);
    let key: string;

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(transaction);
  });

  return grouped;
};

// Input validation utilities
export const validatePortfolioData = (portfolio: Portfolio): boolean => {
  return !!(
    portfolio &&
    typeof portfolio.total_value === 'number' &&
    typeof portfolio.cash_balance === 'number' &&
    typeof portfolio.total_cost === 'number' &&
    portfolio.total_value >= 0 &&
    portfolio.cash_balance >= 0 &&
    portfolio.total_cost >= 0
  );
};

export const validatePositionData = (position: PortfolioPosition): boolean => {
  return !!(
    position &&
    position.symbol &&
    typeof position.quantity === 'number' &&
    typeof position.current_price === 'number' &&
    typeof position.market_value === 'number' &&
    position.quantity >= 0 &&
    position.current_price >= 0 &&
    position.market_value >= 0
  );
};

export const sanitizeNumericInput = (value: any, defaultValue: number = 0): number => {
  const parsed = Number(value);
  return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
}; 