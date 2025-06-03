# 🔐 StockPulse Authentication Tests - Quick Reference

## 🚀 Quick Start

### Prerequisites

- Frontend running on `http://localhost:3000`
- Backend running on `http://localhost:8000`
- Node.js and npm installed
- Playwright installed (`npx playwright install`)

### Run All Tests

```bash
# Run core authentication tests (recommended)
node tests/run-all-auth-tests.js

# Run quick development suite
node tests/run-all-auth-tests.js --quick

# Run full CI/CD suite
node tests/run-all-auth-tests.js --full
```

### Run Specific Test Types

```bash
# Unit tests only
node tests/run-all-auth-tests.js --unit-only

# API tests only
node tests/run-all-auth-tests.js --api-only

# E2E tests only
node tests/run-all-auth-tests.js --e2e-only
```

### Debug Options

```bash
# Run with visual browser (headed mode)
node tests/run-all-auth-tests.js --headed

# Run with debug output
node tests/run-all-auth-tests.js --debug

# Generate comprehensive report
node tests/run-all-auth-tests.js --report
```

### Individual Test Commands

```bash
# Run unit tests with Vitest
npm run test

# Run Playwright tests
npx playwright test

# Run specific project
npx playwright test --project auth-unit-tests
npx playwright test --project auth-flow-tests
npx playwright test --project api-auth-tests
```

## 📁 Test File Organization

```
tests/
├── auth.setup.ts                    # Authentication setup
├── auth/                            # Authentication tests
│   ├── auth-context.test.tsx        # ✅ Unit tests
│   ├── login-component.test.tsx     # ✅ Component tests
│   ├── debug-auth.test.tsx          # ✅ Debug tests
│   ├── complete-auth-flows.test.ts  # 🔄 Integration tests
│   ├── multi-role-auth.test.ts      # 🔄 Role-based tests
│   └── api-auth.test.ts             # 🔄 API tests
├── e2e/                             # End-to-end tests
│   ├── auth-flow.spec.ts            # 🔄 E2E tests
│   ├── global-setup.ts              # Global setup
│   └── global-teardown.ts           # Global cleanup
└── run-all-auth-tests.js            # ✅ Test runner
```

**Legend**: ✅ Working | 🔄 Created (needs backend connectivity)

## 🎯 Test Status

### ✅ Working Tests (100% Pass Rate)

- **Unit Tests**: AuthContext, Login Component, Debug Auth
- **Test Infrastructure**: Test runner, setup, configuration

### 🔄 Created Tests (Waiting for Backend Fix)

- **Integration Tests**: Complete auth flows
- **Multi-Role Tests**: Admin, User, Guest permissions
- **API Tests**: Backend authentication endpoints
- **E2E Tests**: Full user journeys

## 🔧 Troubleshooting

### Common Issues

#### "Frontend not running"

```bash
# Start frontend
npm run dev
```

#### "Backend not accessible"

```bash
# Start backend
cd services/backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### "Rate limiting errors"

- Backend has aggressive rate limiting
- Tests include delays to handle this
- Consider adjusting backend rate limits for testing

#### "Authentication setup fails"

- Check if login page loads at `http://localhost:3000/auth/login`
- Verify backend API responds at `http://localhost:8000/health`
- Check browser console for errors

### Debug Steps

1. **Check Services**:

   ```bash
   curl http://localhost:3000        # Frontend
   curl http://localhost:8000/health # Backend
   ```

2. **Run Debug Tests**:

   ```bash
   node tests/run-all-auth-tests.js --unit-only --debug
   ```

3. **Visual Debugging**:
   ```bash
   node tests/run-all-auth-tests.js --headed
   ```

## 📊 Test Reports

### Generated Reports

- **JSON Report**: `test-results/auth-test-report.json`
- **HTML Report**: `test-results/auth-test-report.html`
- **Playwright HTML**: `test-results/html-report/index.html`

### View Reports

```bash
# Open HTML report
npx playwright show-report

# View custom report
open test-results/auth-test-report.html
```

## 🎯 Next Steps

1. **Fix Backend Connectivity**: Resolve frontend-backend communication
2. **Run Full Suite**: Execute all tests once connectivity is fixed
3. **CI/CD Integration**: Add tests to deployment pipeline
4. **Monitoring**: Set up continuous test monitoring

## 🆘 Support

For issues or questions:

1. Check `tests/AUTHENTICATION_TEST_SUMMARY.md` for detailed analysis
2. Review test logs in `test-results/` directory
3. Run debug mode for detailed output
4. Check browser console for frontend errors

🚀

# Watchlist Widget Test Suite

## Overview

This directory contains comprehensive tests for **Story 2.4 - Watchlist Widget** implementation. The test suite covers all aspects of the feature from frontend components to backend integration and end-to-end user flows.

## 🎯 Testing Strategy

Our testing strategy follows the **Testing Pyramid** approach:

```
        🔺 E2E Tests (Few)
       🔺🔺 Integration Tests (Some)
    🔺🔺🔺🔺 Unit Tests (Many)
```

### Test Categories

1. **Unit Tests** (Fast, Isolated)

   - Component logic testing
   - Service function testing
   - Utility function testing

2. **Integration Tests** (Medium, API focused)

   - Service-to-API integration
   - Component-to-service integration
   - WebSocket real-time functionality

3. **End-to-End Tests** (Slow, Full user flows)
   - Complete user journeys
   - Cross-browser compatibility
   - Performance validation

## 📁 File Organization

```
tests/
├── components/
│   └── watchlist.test.tsx              # React component tests
├── services/
│   ├── watchlistService.test.ts        # Watchlist API service tests
│   └── websocketService.test.ts        # WebSocket service tests
├── e2e/
│   └── watchlist-integration.spec.ts   # End-to-end integration tests
├── run-watchlist-tests.js              # Test runner script
└── README.md                           # This documentation
```

## 🧪 Test Files Detail

### Component Tests (`components/watchlist.test.tsx`)

Tests the **Watchlist React component** functionality:

- ✅ **Rendering**: Widget display, loading states, empty states
- ✅ **CRUD Operations**: Add/remove symbols with validation
- ✅ **Navigation**: Click-through to stock detail pages
- ✅ **Real-time Updates**: WebSocket integration and data updates
- ✅ **Error Handling**: Network failures, API errors, retry mechanisms
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen readers
- ✅ **Configuration**: Widget customization options

**Key Test Scenarios:**

```typescript
// Rendering tests
it("renders watchlist widget with title");
it("displays loading state initially");
it("shows empty state when no items");

// CRUD functionality
it("opens add symbol modal on button click");
it("validates symbol input");
it("successfully adds a valid symbol");
it("successfully removes a symbol");

// Real-time updates
it("subscribes to WebSocket updates on mount");
it("updates stock data when WebSocket message received");
```

### Service Tests (`services/`)

#### WatchlistService Tests (`watchlistService.test.ts`)

Tests the **Watchlist API service** functionality:

- ✅ **Singleton Pattern**: Instance management
- ✅ **CRUD Operations**: Get, add, remove watchlist items
- ✅ **Caching**: Data caching and invalidation
- ✅ **Validation**: Symbol format and existence validation
- ✅ **Error Handling**: Network errors, API failures
- ✅ **Demo Mode**: Fallback behavior when API unavailable

**Key Test Scenarios:**

```typescript
// API integration
it("fetches watchlist from API successfully");
it("successfully adds a new symbol");
it("successfully removes a symbol");

// Caching behavior
it("uses cached data when available and fresh");
it("invalidates cache after successful addition");

// Error handling
it("falls back to mock data when API fails");
it("simulates success when API is unavailable");
```

#### WebSocketService Tests (`websocketService.test.ts`)

Tests the **WebSocket real-time service** functionality:

- ✅ **Connection Management**: Connect, disconnect, timeout handling
- ✅ **Subscription Management**: Symbol subscriptions, unsubscriptions
- ✅ **Message Handling**: Market data updates, heartbeat, errors
- ✅ **Reconnection Logic**: Auto-reconnect with exponential backoff
- ✅ **Status Tracking**: Connection status callbacks
- ✅ **Error Resilience**: Malformed messages, callback errors

**Key Test Scenarios:**

```typescript
// Connection management
it("connects to WebSocket server successfully");
it("handles connection timeout");
it("attempts reconnection after connection loss");

// Message handling
it("handles market data updates");
it("handles heartbeat messages");
it("handles malformed JSON messages");

// Subscription management
it("subscribes to multiple symbols from watchlist");
it("only unsubscribes from server when no callbacks remain");
```

### E2E Integration Tests (`e2e/watchlist-integration.spec.ts`)

Tests the **complete user experience** using Playwright:

- ✅ **Widget Rendering**: Full dashboard integration
- ✅ **Add Symbol Flow**: Complete add symbol user journey
- ✅ **Remove Symbol Flow**: Complete remove symbol user journey
- ✅ **Navigation Flow**: Stock detail page navigation
- ✅ **Real-time Updates**: WebSocket integration testing
- ✅ **Error Scenarios**: Network failures, timeout handling
- ✅ **Accessibility**: Keyboard navigation, ARIA compliance
- ✅ **Responsive Design**: Mobile, tablet viewport testing
- ✅ **Performance**: Load times, large dataset handling

**Key Test Scenarios:**

```typescript
// Complete user flows
test("successfully adds a valid symbol");
test("navigates to stock detail page on click");
test("simulates real-time price updates");

// Error handling
test("displays error state when API fails");
test("retries loading on retry button click");

// Accessibility & Performance
test("keyboard navigation works correctly");
test("loads within performance budget");
```

## 🚀 Running Tests

### Quick Start

```bash
# Run all tests
node tests/run-watchlist-tests.js

# Run specific test types
node tests/run-watchlist-tests.js --component
node tests/run-watchlist-tests.js --services
node tests/run-watchlist-tests.js --e2e

# Generate coverage report
node tests/run-watchlist-tests.js --coverage

# Verbose output
node tests/run-watchlist-tests.js --verbose

# Watch mode
node tests/run-watchlist-tests.js --watch
```

### Individual Test Commands

```bash
# Component tests only
npm run test tests/components/watchlist.test.tsx

# Service tests only
npm run test tests/services/*.test.ts

# E2E tests only
npm run test:e2e tests/e2e/watchlist-integration.spec.ts

# Coverage report
npm run test:coverage
```

### Test Runner Features

The custom test runner (`run-watchlist-tests.js`) provides:

- ✅ **Prerequisites Check**: Validates environment setup
- ✅ **Sequential Execution**: Runs tests in logical order
- ✅ **Detailed Reporting**: Color-coded output with timestamps
- ✅ **Coverage Integration**: Automatic coverage report generation
- ✅ **Error Aggregation**: Comprehensive failure reporting
- ✅ **Performance Metrics**: Execution time tracking

## 📊 Coverage Requirements

We maintain **high code coverage** standards:

| Component        | Target Coverage | Critical Paths                          |
| ---------------- | --------------- | --------------------------------------- |
| React Components | 90%+            | User interactions, error states         |
| Services         | 95%+            | API calls, caching, error handling      |
| WebSocket        | 85%+            | Connection management, message handling |
| Integration      | 80%+            | Complete user flows                     |

## 🔧 Test Configuration

### Testing Frameworks

- **Frontend**: Vitest + React Testing Library
- **Services**: Vitest with mocks
- **E2E**: Playwright
- **Coverage**: c8 (via Vitest)

### Mock Strategy

```typescript
// API Client mocking
vi.mock("../../src/services/api");

// WebSocket mocking
global.WebSocket = MockWebSocket as any;

// Router mocking
vi.mock("react-router-dom", async () => ({
  ...actual,
  useNavigate: () => vi.fn(),
}));
```

### Test Data

We use **consistent test data** across all test files:

```typescript
const mockWatchlistData = {
  watchlistId: "test-watchlist",
  name: "Test Watchlist",
  items: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 185.42,
      change: 2.34,
      changePercent: 1.28,
      // ... complete mock data
    },
  ],
};
```

## 🚨 Test Quality Standards

### Test Naming Convention

```typescript
describe("Component/Service Name", () => {
  describe("Feature Category", () => {
    it("should do something specific when condition occurs");
  });
});
```

### Assertion Patterns

```typescript
// ✅ Good - Specific assertions
expect(screen.getByTestId("stock-price-AAPL")).toContainText("$185.42");

// ❌ Avoid - Generic assertions
expect(element).toBeTruthy();
```

### Async Testing

```typescript
// ✅ Proper async testing
await waitFor(() => {
  expect(screen.getByText("AAPL")).toBeInTheDocument();
});

// ✅ Act wrapper for state changes
await act(async () => {
  fireEvent.click(submitButton);
});
```

## 🐛 Debugging Tests

### Common Issues

1. **Timing Issues**

   ```typescript
   // Use waitFor for async operations
   await waitFor(() => {
     expect(element).toBeVisible();
   });
   ```

2. **Mock Persistence**

   ```typescript
   // Clear mocks between tests
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

3. **WebSocket Testing**
   ```typescript
   // Use fake timers for WebSocket timeouts
   vi.useFakeTimers();
   await vi.advanceTimersByTimeAsync(5000);
   ```

### Debug Commands

```bash
# Run single test with debugging
npm run test -- --reporter=verbose watchlist.test.tsx

# Run with console output
DEBUG=* npm run test

# E2E with headed browser
npm run test:e2e -- --headed
```

## 📈 Continuous Integration

### CI Pipeline Integration

```yaml
# Example GitHub Actions
- name: Run Watchlist Tests
  run: |
    node tests/run-watchlist-tests.js --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Quality Gates

- ✅ All tests must pass
- ✅ Coverage must meet thresholds
- ✅ No accessibility violations
- ✅ Performance budgets met
- ✅ E2E tests pass in multiple browsers

## 🔍 Test Maintenance

### Regular Updates Required

1. **Mock Data Updates**: Keep test data synchronized with API changes
2. **Selector Updates**: Update data-testid selectors when UI changes
3. **Coverage Thresholds**: Adjust coverage requirements as codebase evolves
4. **Performance Budgets**: Update timing expectations based on infrastructure

### Refactoring Guidelines

- ✅ Extract common test utilities
- ✅ Use test factories for complex mock data
- ✅ Group related tests in describe blocks
- ✅ Keep individual tests focused and atomic

## 📚 Additional Resources

- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Vitest Guide](https://vitest.dev/guide/)
- [Story 2.4 Implementation](../docs/stories/story-2.4.md)

---

## 🎯 Success Criteria

The test suite validates that **Story 2.4 - Watchlist Widget** meets all requirements:

- ✅ **Functional**: All CRUD operations work correctly
- ✅ **Real-time**: WebSocket integration provides live updates
- ✅ **User Experience**: Navigation and interactions are smooth
- ✅ **Accessibility**: WCAG 2.1 AA+ compliance
- ✅ **Performance**: Meets load time and responsiveness targets
- ✅ **Reliability**: Graceful error handling and recovery
- ✅ **Security**: Input validation and sanitization

**When all tests pass, the feature is ready for production deployment! 🚀**
