import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fmpApi } from '@api/services';

// Custom hook for fetching company profile
export const useCompanyProfile = (symbol: string) => {
  return useQuery({
    queryKey: ['companyProfile', symbol],
    queryFn: () => fmpApi.getCompanyProfile(symbol),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!symbol,
  });
};

// Custom hook for fetching real-time quote
export const useQuote = (symbol: string, refetchInterval?: number) => {
  return useQuery({
    queryKey: ['quote', symbol],
    queryFn: () => fmpApi.getQuote(symbol),
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: refetchInterval || 1000 * 30, // 30 seconds by default
    enabled: !!symbol,
  });
};

// Custom hook for fetching historical prices
export const useHistoricalPrices = (
  symbol: string, 
  timeframe: 'daily' | 'weekly' | 'monthly' = 'daily', 
  limit: number = 365
) => {
  return useQuery({
    queryKey: ['historicalPrices', symbol, timeframe, limit],
    queryFn: () => fmpApi.getHistoricalPrices(symbol, timeframe, limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!symbol,
  });
};

// Custom hook for fetching financial statements
export const useFinancialStatements = (
  symbol: string,
  statementType: 'income' | 'balance' | 'cashflow',
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
) => {
  return useQuery({
    queryKey: ['financialStatement', symbol, statementType, period, limit],
    queryFn: () => {
      switch (statementType) {
        case 'income':
          return fmpApi.getIncomeStatement(symbol, period, limit);
        case 'balance':
          return fmpApi.getBalanceSheet(symbol, period, limit);
        case 'cashflow':
          return fmpApi.getCashFlowStatement(symbol, period, limit);
        default:
          throw new Error(`Invalid statement type: ${statementType}`);
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!symbol,
  });
};

// Custom hook for fetching key metrics and ratios
export const useKeyMetrics = (
  symbol: string,
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
) => {
  return useQuery({
    queryKey: ['keyMetrics', symbol, period, limit],
    queryFn: () => fmpApi.getKeyMetrics(symbol, period, limit),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!symbol,
  });
};

// Custom hook for fetching financial ratios
export const useFinancialRatios = (
  symbol: string,
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
) => {
  return useQuery({
    queryKey: ['financialRatios', symbol, period, limit],
    queryFn: () => fmpApi.getFinancialRatios(symbol, period, limit),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!symbol,
  });
};

// Custom hook for fetching company news
export const useCompanyNews = (symbol: string, limit: number = 50) => {
  return useQuery({
    queryKey: ['companyNews', symbol, limit],
    queryFn: () => fmpApi.getCompanyNews(symbol, limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!symbol,
  });
};

// Custom hook for fetching market indices
export const useMarketIndices = () => {
  return useQuery({
    queryKey: ['marketIndices'],
    queryFn: () => fmpApi.getMarketIndices(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // 1 minute
  });
};

// Custom hook for fetching sector performance
export const useSectorPerformance = () => {
  return useQuery({
    queryKey: ['sectorPerformance'],
    queryFn: () => fmpApi.getSectorPerformance(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchInterval: 1000 * 60 * 15, // 15 minutes
  });
};

// Custom hook for stock screening
export const useStockScreener = (params: any) => {
  return useQuery({
    queryKey: ['stockScreener', params],
    queryFn: () => fmpApi.getStockScreener(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!params,
  });
};

// Custom hook for fetching earnings calendar
export const useEarningsCalendar = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ['earningsCalendar', from, to],
    queryFn: () => fmpApi.getEarningsCalendar(from, to),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
