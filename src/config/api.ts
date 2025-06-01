/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */
import axios from 'axios';

// Helper function to safely access import.meta.env
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    // Check if we're in a Vite environment
    if (typeof window !== 'undefined' && (window as any).import?.meta?.env) {
      return (window as any).import.meta.env[key] || defaultValue;
    }
    // Check for global import.meta (set by setupTests.ts)
    if (
      typeof globalThis !== 'undefined' &&
      (globalThis as any).import?.meta?.env
    ) {
      return (globalThis as any).import.meta.env[key] || defaultValue;
    }
    // Fallback for Jest/Node environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

// API Base URL - use environment variable or default to localhost
export const API_BASE_URL = getEnvVar(
  'VITE_API_BASE_URL',
  'http://localhost:8000',
);

// API Configuration object
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  WITH_CREDENTIALS: true, // Essential for HttpOnly cookies
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  },

  // Portfolio Management
  PORTFOLIO: {
    LIST: '/api/v1/portfolio',
    CREATE: '/api/v1/portfolio',
    DETAIL: (id: string) => `/api/v1/portfolio/${id}`,
    UPDATE: (id: string) => `/api/v1/portfolio/${id}`,
    DELETE: (id: string) => `/api/v1/portfolio/${id}`,
    DASHBOARD: '/api/v1/portfolio/dashboard',
    POSITIONS: (id: string) => `/api/v1/portfolio/${id}/positions`,
    TRANSACTIONS: (id: string) => `/api/v1/portfolio/${id}/transactions`,
    AI_INSIGHTS: (id: string) => `/api/v1/portfolio/${id}/insights`,
  },

  // API Key Management
  API_KEYS: {
    LIST: '/api/v1/api-keys',
    CREATE: '/api/v1/api-keys',
    UPDATE: (id: string) => `/api/v1/api-keys/${id}`,
    DELETE: (id: string) => `/api/v1/api-keys/${id}`,
    VALIDATE: (id: string) => `/api/v1/api-keys/${id}/validate`,
    PROVIDERS: '/api/v1/api-keys/providers',
    STATS: '/api/v1/api-keys/stats',
  },

  // Market Data
  MARKET: {
    QUOTE: '/api/v1/market/quote',
    SEARCH: '/api/v1/market/search',
    HISTORY: '/api/v1/market/history',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Request timeout configurations
export const TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  UPLOAD: 60000, // 1 minute
  LONG_RUNNING: 120000, // 2 minutes
} as const;

// Error message mappings
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access forbidden. Please check your permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// API Client Configuration - Axios instance for API calls
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: API_CONFIG.WITH_CREDENTIALS, // Essential for HttpOnly cookies
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Request interceptor for adding authentication headers
apiClient.interceptors.request.use(
  (config) => {
    // Add any request modifications here (e.g., auth tokens)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized responses
    if (error.response?.status === 401) {
      // Dispatch event for AuthContext to handle
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

// Export apiClient as default export
export default apiClient;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Debug function to log API configuration
export const debugApiConfig = (): void => {
  console.log('🔧 API Configuration:');
  console.log('Base URL:', API_CONFIG.BASE_URL);
  console.log('Environment Variable:', getEnvVar('VITE_API_BASE_URL'));
  console.log('Current Origin:', window.location.origin);
  console.log('Auth Endpoints:', {
    login: getApiUrl(API_ENDPOINTS.AUTH.LOGIN),
    register: getApiUrl(API_ENDPOINTS.AUTH.REGISTER),
    logout: getApiUrl(API_ENDPOINTS.AUTH.LOGOUT),
    me: getApiUrl(API_ENDPOINTS.AUTH.ME),
  });
};

// API configuration for Financial Modeling Prep
// Use environment variables in production
export const FMP_API_KEY = getEnvVar('VITE_FMP_API_KEY', 'YOUR_FMP_API_KEY');
export const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

// API configuration for TAAPI.IO
// Use environment variables in production
export const TAAPI_API_KEY = getEnvVar(
  'VITE_TAAPI_API_KEY',
  'YOUR_TAAPI_API_KEY',
);
export const TAAPI_BASE_URL = 'https://api.taapi.io';

// GitHub configuration
// These should be configured in your CI/CD pipeline, not in source code
export const GITHUB_REPO = 'https://github.com/veerababumanyam/StockPulse.git';
export const GITHUB_TOKEN = getEnvVar('VITE_GITHUB_TOKEN', '') || ''; // Never hardcode tokens
