/**
 * Formatting utilities for numbers, currencies, and other display values
 */

type FormatCurrencyOptions = {
  minFractionDigits?: number;
  maxFractionDigits?: number;
  currency?: string;
  locale?: string;
};

/**
 * Format a number as a currency string
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, { currency: 'EUR' }) // "€1,234.56"
 */
export const formatCurrency = (
  amount: number,
  options: FormatCurrencyOptions = {}
): string => {
  const {
    minFractionDigits = 2,
    maxFractionDigits = 2,
    currency = 'USD',
    locale = undefined,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  }).format(amount);
};

type FormatChangeOptions = {
  showSign?: boolean;
  showPercentage?: boolean;
  showCurrency?: boolean;
  currency?: string;
};

/**
 * Format a change value with percentage
 * @example
 * formatChange(10.5, 5.25) // { formattedValue: "+$10.50 (5.25%)", isPositive: true, formattedPercent: "+5.25%" }
 */
export const formatChange = (
  value: number,
  percent: number,
  options: FormatChangeOptions = {}
): {
  formattedValue: string;
  isPositive: boolean;
  formattedPercent: string;
} => {
  const {
    showSign = true,
    showPercentage = true,
    showCurrency = true,
    currency = 'USD',
  } = options;

  const isPositive = value >= 0;
  const sign = showSign ? (isPositive ? '+' : '') : '';
  const absValue = Math.abs(value);
  
  let formattedValue = '';
  if (showCurrency) {
    formattedValue = formatCurrency(absValue, { currency });
  } else {
    formattedValue = absValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const formattedPercent = `${isPositive ? '+' : ''}${percent.toFixed(2)}%`;
  
  return {
    formattedValue: `${sign}${formattedValue}${showPercentage ? ` (${formattedPercent})` : ''}`,
    isPositive,
    formattedPercent,
  };
};

/**
 * Format a date according to the specified options
 * @example
 * formatDate(new Date()) // "Jun 1, 2023, 2:30:45 PM"
 * formatDate(new Date(), { dateStyle: 'medium', timeStyle: 'short' }) // "Jun 1, 2023, 2:30 PM"
 */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return dateObj.toLocaleString(undefined, options);
};

/**
 * Format a number with optional decimal places and localization
 * @example
 * formatNumber(1234.567) // "1,234.57"
 * formatNumber(1234.567, { maximumFractionDigits: 0 }) // "1,235"
 */
export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  });
};

/**
 * Format a date as "time ago" string
 * @example
 * formatTimeAgo(new Date(Date.now() - 60000)) // "1 minute ago"
 * formatTimeAgo(new Date(Date.now() - 3600000)) // "1 hour ago"
 */
export const formatTimeAgo = (date: Date | string | number): string => {
  const now = new Date();
  const target = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const diffInMs = now.getTime() - target.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  } else {
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
  }
};
