// src/setupTests.ts

// Import testing library utilities
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor(private callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
  
  observe(target: Element) {}
  unobserve(target: Element) {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

window.IntersectionObserver = MockIntersectionObserver as any;

// Mock console methods
const consoleError = console.error;
const consoleWarn = console.warn;

beforeAll(() => {
  // Mock console.error to catch React warnings
  console.error = vi.fn((...args) => {
    // Ignore React warning about useLayoutEffect
    if (typeof args[0] === 'string' && args[0].includes('useLayoutEffect')) {
      return;
    }
    consoleError(...args);
  });

  // Mock console.warn
  console.warn = vi.fn((...args) => {
    consoleWarn(...args);
  });
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

afterAll(() => {
  // Restore original console methods
  console.error = consoleError;
  console.warn = consoleWarn;
});

// Polyfill for import.meta.env in test environment
if (typeof global !== 'undefined') {
  (global as any).importMeta = {
    env: {
      VITE_API_BASE_URL: 'http://localhost:8000',
      VITE_FMP_API_KEY: 'test-fmp-key',
      VITE_TAAPI_API_KEY: 'test-taapi-key',
      VITE_GITHUB_TOKEN: 'test-github-token',
    },
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
      },
    },
  },
  writable: true,
  configurable: true,
});

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
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
