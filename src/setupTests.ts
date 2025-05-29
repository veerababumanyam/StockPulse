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