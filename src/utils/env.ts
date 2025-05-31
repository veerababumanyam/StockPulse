/**
 * Environment Variable Utility
 * Provides safe access to environment variables in both Vite and Jest environments
 */

/**
 * Safely access environment variables
 * Works in both Vite (import.meta.env) and Jest/Node (process.env) environments
 */
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    // Check if we're in a Vite environment
    if (typeof window !== 'undefined' && (window as any).import?.meta?.env) {
      return (window as any).import.meta.env[key] || defaultValue;
    }
    // Check for global import.meta (set by setupTests.ts)
    if (typeof globalThis !== 'undefined' && (globalThis as any).import?.meta?.env) {
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

/**
 * Common environment variables used throughout the application
 */
export const ENV = {
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000'),
  FMP_API_KEY: getEnvVar('VITE_FMP_API_KEY', 'YOUR_FMP_API_KEY'),
  TAAPI_API_KEY: getEnvVar('VITE_TAAPI_API_KEY', 'YOUR_TAAPI_API_KEY'),
  GITHUB_TOKEN: getEnvVar('VITE_GITHUB_TOKEN', ''),
} as const; 