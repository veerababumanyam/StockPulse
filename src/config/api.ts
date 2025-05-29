/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Environment-based API configuration
export const API_CONFIG = {
  // Base URL for the FastAPI backend
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",

  // Request timeout in milliseconds
  TIMEOUT: 10000,

  // Enable credentials for cookie-based auth
  WITH_CREDENTIALS: true,

  // Default headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },

  // Auth endpoints
  AUTH_ENDPOINTS: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Debug function to log API configuration
export const debugApiConfig = (): void => {
  console.log("🔧 API Configuration:");
  console.log("Base URL:", API_CONFIG.BASE_URL);
  console.log("Environment Variable:", import.meta.env.VITE_API_BASE_URL);
  console.log("Current Origin:", window.location.origin);
  console.log("Auth Endpoints:", {
    login: getApiUrl(API_CONFIG.AUTH_ENDPOINTS.LOGIN),
    register: getApiUrl(API_CONFIG.AUTH_ENDPOINTS.REGISTER),
    logout: getApiUrl(API_CONFIG.AUTH_ENDPOINTS.LOGOUT),
    me: getApiUrl(API_CONFIG.AUTH_ENDPOINTS.ME),
  });
};

// API configuration for Financial Modeling Prep
// Use environment variables in production
export const FMP_API_KEY =
  import.meta.env.VITE_FMP_API_KEY || "YOUR_FMP_API_KEY";
export const FMP_BASE_URL = "https://financialmodelingprep.com/api/v3";

// API configuration for TAAPI.IO
// Use environment variables in production
export const TAAPI_API_KEY =
  import.meta.env.VITE_TAAPI_API_KEY || "YOUR_TAAPI_API_KEY";
export const TAAPI_BASE_URL = "https://api.taapi.io";

// GitHub configuration
// These should be configured in your CI/CD pipeline, not in source code
export const GITHUB_REPO = "https://github.com/veerababumanyam/StockPulse.git";
export const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ""; // Never hardcode tokens
