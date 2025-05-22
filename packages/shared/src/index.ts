// Common types and utilities for StockPulse AI platform

// Stock-related types
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  pe: number | null;
  dividend: number | null;
  sector: string;
}

export interface StockPrice {
  date: string;
  price: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

// AI analysis types
export interface AIInsight {
  id: string;
  stock: string;
  type: 'buy' | 'sell' | 'hold' | 'watch';
  confidence: number; // 0-100
  summary: string;
  details: string;
  timeframe: 'short' | 'medium' | 'long';
  timestamp: string;
}

// User-related types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  stocksWatchlist?: string[];
  defaultTimeframe?: 'day' | 'week' | 'month' | 'year';
}

// Helper functions
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'percent', 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(value / 100);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatCompactNumber(value: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  });
  return formatter.format(value);
}

// Constants
export const TIME_FRAMES = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'MAX'] as const;
export type TimeFrame = typeof TIME_FRAMES[number]; 