import axios from 'axios';
import { FMP_API_KEY, FMP_BASE_URL, TAAPI_API_KEY, TAAPI_BASE_URL } from '@/config/api';

// Financial Modeling Prep API Service
export const fmpApi = {
  // Company Profile
  getCompanyProfile: async (symbol: string) => {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/profile/${symbol}?apikey=${FMP_API_KEY}`);
      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching company profile:', error);
      throw error;
    }
  },

  // Real-time Quote
  getQuote: async (symbol: string) => {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/quote/${symbol}?apikey=${FMP_API_KEY}`);
      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  },

  // Historical Price Data
  getHistoricalPrices: async (symbol: string, timeframe: 'daily' | 'weekly' | 'monthly' = 'daily', limit: number = 365) => {
    try {
      const endpoint = timeframe === 'daily' 
        ? 'historical-price-full' 
        : timeframe === 'weekly' 
          ? 'historical-price-full/weekly' 
          : 'historical-price-full/monthly';
      
      const response = await axios.get(`${FMP_BASE_URL}/${endpoint}/${symbol}?apikey=${FMP_API_KEY}&limit=${limit}`);
      return response.data.historical || [];
    } catch (error) {
      console.error(`Error fetching ${timeframe} historical prices:`, error);
      throw error;
    }
  },

  // Financial Statements
  getIncomeStatement: async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5) => {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/income-statement/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching income statement:', error);
      throw error;
    }
  },

  getBalanceSheet: async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5) => {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/balance-sheet-statement/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      throw error;
    }
  },

  getCashFlowStatement: async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5) => {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/cash-flow-statement/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching cash flow statement:', error);
      throw error;
    }
  },

  // Key Metrics and Ratios
  getKeyMetrics: async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5) => {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/key-metrics/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching key metrics:', error);
      throw error;
    }
  },

  getFinancialRatios: async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5) => {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/ratios/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching financial ratios:', error);
      throw error;
    }
  },

  // News and Sentiment
  getCompanyNews: async (symbol: string, limit: number = 50) => {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/stock_news?tickers=${symbol}&limit=${limit}&apikey=${FMP_API_KEY}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching company news:', error);
      throw error;
    }
  },

  // Market Data
  getMarketIndices: async () => {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/quotes/index?apikey=${FMP_API_KEY}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching market indices:', error);
      throw error;
    }
  },

  getSectorPerformance: async () => {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/sector-performance?apikey=${FMP_API_KEY}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching sector performance:', error);
      throw error;
    }
  },

  // Stock Screening
  getStockScreener: async (params: any) => {
    try {
      const queryParams = new URLSearchParams({
        ...params,
        apikey: FMP_API_KEY
      }).toString();
      
      const response = await axios.get(`${FMP_BASE_URL}/stock-screener?${queryParams}`);
      return response.data || [];
    } catch (error) {
      console.error('Error with stock screener:', error);
      throw error;
    }
  },

  // Earnings Calendar
  getEarningsCalendar: async (from?: string, to?: string) => {
    try {
      let url = `${FMP_BASE_URL}/earning-calendar?apikey=${FMP_API_KEY}`;
      if (from) url += `&from=${from}`;
      if (to) url += `&to=${to}`;
      
      const response = await axios.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching earnings calendar:', error);
      throw error;
    }
  },
};

// TAAPI.IO API Service for Technical Indicators
export const taapiApi = {
  // RSI (Relative Strength Index)
  getRSI: async (symbol: string, interval: string = '1h', backtrack: number = 0) => {
    try {
      const response = await axios.get(`${TAAPI_BASE_URL}/rsi`, {
        params: {
          secret: TAAPI_API_KEY,
          exchange: 'binance',
          symbol: `${symbol}/USDT`,
          interval,
          backtrack
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching RSI:', error);
      throw error;
    }
  },

  // MACD (Moving Average Convergence Divergence)
  getMACD: async (symbol: string, interval: string = '1h', backtrack: number = 0) => {
    try {
      const response = await axios.get(`${TAAPI_BASE_URL}/macd`, {
        params: {
          secret: TAAPI_API_KEY,
          exchange: 'binance',
          symbol: `${symbol}/USDT`,
          interval,
          backtrack
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching MACD:', error);
      throw error;
    }
  },

  // Bollinger Bands
  getBollingerBands: async (symbol: string, interval: string = '1h', backtrack: number = 0) => {
    try {
      const response = await axios.get(`${TAAPI_BASE_URL}/bbands`, {
        params: {
          secret: TAAPI_API_KEY,
          exchange: 'binance',
          symbol: `${symbol}/USDT`,
          interval,
          backtrack
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Bollinger Bands:', error);
      throw error;
    }
  },

  // Moving Averages
  getEMA: async (symbol: string, interval: string = '1h', period: number = 20, backtrack: number = 0) => {
    try {
      const response = await axios.get(`${TAAPI_BASE_URL}/ema`, {
        params: {
          secret: TAAPI_API_KEY,
          exchange: 'binance',
          symbol: `${symbol}/USDT`,
          interval,
          period,
          backtrack
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching EMA:', error);
      throw error;
    }
  },

  getSMA: async (symbol: string, interval: string = '1h', period: number = 20, backtrack: number = 0) => {
    try {
      const response = await axios.get(`${TAAPI_BASE_URL}/sma`, {
        params: {
          secret: TAAPI_API_KEY,
          exchange: 'binance',
          symbol: `${symbol}/USDT`,
          interval,
          period,
          backtrack
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching SMA:', error);
      throw error;
    }
  },

  // Stochastic Oscillator
  getStochastic: async (symbol: string, interval: string = '1h', backtrack: number = 0) => {
    try {
      const response = await axios.get(`${TAAPI_BASE_URL}/stoch`, {
        params: {
          secret: TAAPI_API_KEY,
          exchange: 'binance',
          symbol: `${symbol}/USDT`,
          interval,
          backtrack
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Stochastic:', error);
      throw error;
    }
  },

  // ATR (Average True Range)
  getATR: async (symbol: string, interval: string = '1h', backtrack: number = 0) => {
    try {
      const response = await axios.get(`${TAAPI_BASE_URL}/atr`, {
        params: {
          secret: TAAPI_API_KEY,
          exchange: 'binance',
          symbol: `${symbol}/USDT`,
          interval,
          backtrack
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ATR:', error);
      throw error;
    }
  },

  // Fibonacci Retracement
  getFibonacciRetracement: async (symbol: string, interval: string = '1h', backtrack: number = 0) => {
    try {
      const response = await axios.get(`${TAAPI_BASE_URL}/fibonacciretracement`, {
        params: {
          secret: TAAPI_API_KEY,
          exchange: 'binance',
          symbol: `${symbol}/USDT`,
          interval,
          backtrack
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Fibonacci Retracement:', error);
      throw error;
    }
  },

  // Ichimoku Cloud
  getIchimokuCloud: async (symbol: string, interval: string = '1h', backtrack: number = 0) => {
    try {
      const response = await axios.get(`${TAAPI_BASE_URL}/ichimoku`, {
        params: {
          secret: TAAPI_API_KEY,
          exchange: 'binance',
          symbol: `${symbol}/USDT`,
          interval,
          backtrack
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Ichimoku Cloud:', error);
      throw error;
    }
  },
};
