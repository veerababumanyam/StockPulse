// src/setupTests.ts

// Optional: Import jest-dom for custom Jest matchers for asserting on DOM nodes.
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Temporarily disabled MSW setup to resolve import issues
// import { server } from './mocks/server';

// // Establish API mocking before all tests.
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// // Reset any request handlers that we may add during the tests,
// // so they don't affect other tests.
// afterEach(() => server.resetHandlers());

// // Clean up after the tests are finished.
// afterAll(() => server.close());

// Polyfill for import.meta.env in Jest environment
if (typeof global !== 'undefined') {
  (global as any).importMeta = {
    env: {
      VITE_API_BASE_URL: 'http://localhost:8000',
      VITE_FMP_API_KEY: 'test-fmp-key',
      VITE_TAAPI_API_KEY: 'test-taapi-key',
      VITE_GITHUB_TOKEN: 'test-github-token',
    }
  };
}

// Mock import.meta for Jest
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_BASE_URL: 'http://localhost:8000',
        VITE_FMP_API_KEY: 'test-fmp-key',
        VITE_TAAPI_API_KEY: 'test-taapi-key',
        VITE_GITHUB_TOKEN: 'test-github-token',
      }
    }
  },
  writable: true,
  configurable: true
});

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver for responsive components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver for lazy loading components
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})); 