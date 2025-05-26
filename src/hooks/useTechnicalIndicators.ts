import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { taapiApi } from '@api/services';

// Custom hook for fetching RSI (Relative Strength Index)
export const useRSI = (symbol: string, interval: string = '1h', backtrack: number = 0) => {
  return useQuery({
    queryKey: ['rsi', symbol, interval, backtrack],
    queryFn: () => taapiApi.getRSI(symbol, interval, backtrack),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!symbol,
  });
};

// Custom hook for fetching MACD (Moving Average Convergence Divergence)
export const useMACD = (symbol: string, interval: string = '1h', backtrack: number = 0) => {
  return useQuery({
    queryKey: ['macd', symbol, interval, backtrack],
    queryFn: () => taapiApi.getMACD(symbol, interval, backtrack),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!symbol,
  });
};

// Custom hook for fetching Bollinger Bands
export const useBollingerBands = (symbol: string, interval: string = '1h', backtrack: number = 0) => {
  return useQuery({
    queryKey: ['bollingerBands', symbol, interval, backtrack],
    queryFn: () => taapiApi.getBollingerBands(symbol, interval, backtrack),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!symbol,
  });
};

// Custom hook for fetching EMA (Exponential Moving Average)
export const useEMA = (
  symbol: string, 
  interval: string = '1h', 
  period: number = 20, 
  backtrack: number = 0
) => {
  return useQuery({
    queryKey: ['ema', symbol, interval, period, backtrack],
    queryFn: () => taapiApi.getEMA(symbol, interval, period, backtrack),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!symbol,
  });
};

// Custom hook for fetching SMA (Simple Moving Average)
export const useSMA = (
  symbol: string, 
  interval: string = '1h', 
  period: number = 20, 
  backtrack: number = 0
) => {
  return useQuery({
    queryKey: ['sma', symbol, interval, period, backtrack],
    queryFn: () => taapiApi.getSMA(symbol, interval, period, backtrack),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!symbol,
  });
};

// Custom hook for fetching Stochastic Oscillator
export const useStochastic = (symbol: string, interval: string = '1h', backtrack: number = 0) => {
  return useQuery({
    queryKey: ['stochastic', symbol, interval, backtrack],
    queryFn: () => taapiApi.getStochastic(symbol, interval, backtrack),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!symbol,
  });
};

// Custom hook for fetching ATR (Average True Range)
export const useATR = (symbol: string, interval: string = '1h', backtrack: number = 0) => {
  return useQuery({
    queryKey: ['atr', symbol, interval, backtrack],
    queryFn: () => taapiApi.getATR(symbol, interval, backtrack),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!symbol,
  });
};

// Custom hook for fetching Fibonacci Retracement
export const useFibonacciRetracement = (symbol: string, interval: string = '1h', backtrack: number = 0) => {
  return useQuery({
    queryKey: ['fibonacciRetracement', symbol, interval, backtrack],
    queryFn: () => taapiApi.getFibonacciRetracement(symbol, interval, backtrack),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!symbol,
  });
};

// Custom hook for fetching Ichimoku Cloud
export const useIchimokuCloud = (symbol: string, interval: string = '1h', backtrack: number = 0) => {
  return useQuery({
    queryKey: ['ichimokuCloud', symbol, interval, backtrack],
    queryFn: () => taapiApi.getIchimokuCloud(symbol, interval, backtrack),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!symbol,
  });
};
