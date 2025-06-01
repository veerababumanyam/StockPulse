/**
 * Portfolio calculation utilities
 * Functions for calculating portfolio metrics and formatting financial data
 */

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number as percentage
 * @param value - The value to format as percentage
 * @param decimals - Number of decimal places (default: 2)
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2
): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Calculate portfolio total value
 * @param positions - Array of position objects with quantity and price
 */
export const calculatePortfolioValue = (positions: Array<{ quantity: number; price: number }>): number => {
  return positions.reduce((total, position) => total + (position.quantity * position.price), 0);
};

/**
 * Calculate portfolio daily change
 * @param currentValue - Current portfolio value
 * @param previousValue - Previous day portfolio value
 */
export const calculateDailyChange = (currentValue: number, previousValue: number): {
  amount: number;
  percentage: number;
} => {
  const amount = currentValue - previousValue;
  const percentage = previousValue !== 0 ? (amount / previousValue) * 100 : 0;
  
  return { amount, percentage };
};

/**
 * Calculate position weight in portfolio
 * @param positionValue - Value of the specific position
 * @param totalPortfolioValue - Total portfolio value
 */
export const calculatePositionWeight = (positionValue: number, totalPortfolioValue: number): number => {
  return totalPortfolioValue !== 0 ? (positionValue / totalPortfolioValue) * 100 : 0;
};

/**
 * Calculate unrealized P&L for a position
 * @param quantity - Number of shares
 * @param currentPrice - Current market price
 * @param costBasis - Original purchase price
 */
export const calculateUnrealizedPnL = (quantity: number, currentPrice: number, costBasis: number): {
  amount: number;
  percentage: number;
} => {
  const amount = quantity * (currentPrice - costBasis);
  const percentage = costBasis !== 0 ? ((currentPrice - costBasis) / costBasis) * 100 : 0;
  
  return { amount, percentage };
}; 