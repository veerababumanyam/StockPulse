# Story 2.1 Test Suite

## Overview

This directory contains comprehensive tests for **Story 2.1: Basic Dashboard Layout and Portfolio Snapshot**. The test suite validates all implemented functionality including:

- Portfolio management (CRUD operations)
- Dashboard API with real-time data
- API key management with encryption
- Market data integration
- AI analysis integration
- Event-driven architecture
- Error handling and fallbacks
- Performance and load testing

## Test Structure

```
tests/story-2.1/
├── conftest.py                    # Test configuration and fixtures
├── test_portfolio_api.py          # Portfolio API endpoint tests
├── test_api_keys.py              # API key management tests
├── test_end_to_end.py            # End-to-end integration tests
├── setup_test_database.py       # Database setup with real API keys
├── run_story_2_1_tests.py       # Comprehensive test runner
├── pytest.ini                   # Pytest configuration
├── reports/                      # Test reports and coverage
└── README.md                     # This file
```

## Prerequisites

### 1. Environment Setup

Ensure you have the following installed:
- Python 3.11+
- PostgreSQL (running)
- All project dependencies

### 2. Database Configuration

Set environment variables:
```bash
export TEST_DATABASE_URL="postgresql+asyncpg://test_user:test_pass@localhost:5432/test_stockpulse"
export API_KEY_ENCRYPTION_KEY="your_encryption_key_here"
```

### 3. API Keys

The test suite uses real API keys for integration testing. These are embedded in the test setup:

- **OpenAI**: For AI portfolio analysis
- **Anthropic**: For AI portfolio insights
- **Google Gemini**: For AI analysis
- **Financial Modeling Prep**: For market data
- **Alpha Vantage**: For stock quotes
- **Polygon.io**: For real-time data
- **TAAPI.IO**: For technical indicators
- **OpenRouter**: For multi-model AI access

## Running Tests

### Quick Test Run

Run all tests with the automated test runner:

```bash
# From the story-2.1 directory
python run_story_2_1_tests.py
```

This will:
1. Set up the test database with real API keys
2. Run all test suites (unit, integration, performance, e2e)
3. Generate comprehensive reports
4. Provide a final summary

### Manual Test Execution

#### 1. Database Setup

First, set up the test database:

```bash
python setup_test_database.py
```

#### 2. Run Specific Test Suites

```bash
# Unit tests only
pytest -m "unit and not integration" -v

# Integration tests with real APIs
pytest -m integration -v

# End-to-end tests
pytest -m e2e -v

# Performance tests
pytest -m performance -v

# All tests
pytest -v
```

#### 3. Generate Coverage Report

```bash
pytest --cov=app --cov-report=html:reports/coverage --cov-report=term-missing
```

## Test Categories

### Unit Tests (`test_portfolio_api.py`, `test_api_keys.py`)

- **Portfolio API**: CRUD operations, validation, error handling
- **API Key Management**: Encryption, validation, security features
- **Data Integrity**: Financial calculations, weight calculations
- **Error Handling**: Invalid inputs, authentication, authorization

**Markers**: `unit`

### Integration Tests (`test_end_to_end.py`)

- **Market Data Integration**: Real API calls to FMP, Alpha Vantage, Polygon
- **AI Analysis Integration**: Real API calls to OpenAI, Anthropic, Gemini
- **API Key Validation**: Real validation with provider APIs
- **Database Integration**: Full CRUD operations with real data

**Markers**: `integration`, `api_required`

### Performance Tests

- **Load Testing**: Concurrent dashboard requests
- **Response Time**: Dashboard performance requirements
- **Scalability**: Large portfolio handling

**Markers**: `performance`, `slow`

### End-to-End Tests

- **Complete Workflow**: Full user journey from setup to dashboard
- **Data Consistency**: Transaction history vs portfolio positions
- **Real-time Updates**: Portfolio value calculations
- **Error Recovery**: Fallback mechanisms

**Markers**: `e2e`

## Test Configuration

### Pytest Settings (`pytest.ini`)

- **Coverage Threshold**: 80% minimum
- **Timeout**: 300s default, 1200s for e2e tests
- **Async Support**: Enabled
- **Report Generation**: HTML, XML, JSON formats

### Fixtures (`conftest.py`)

- **Database Session**: Async database connections
- **Test Client**: FastAPI test client
- **Authentication**: User tokens and headers
- **Test Data**: Sample portfolios, positions, transactions
- **API Keys**: Encrypted test keys
- **Mock Services**: Market data and AI service mocks

## Real API Key Testing

The test suite includes integration tests with real APIs:

### Financial Data APIs
- **FMP**: Stock quotes, financial data
- **Alpha Vantage**: Market data, global quotes
- **Polygon**: Real-time stock prices

### AI/ML APIs
- **OpenAI**: GPT models for portfolio analysis
- **Anthropic**: Claude for insights
- **Gemini**: Google's AI for analysis

### Validation
- Each API key is validated against the real provider
- Response times and rate limits are measured
- Error handling for invalid/expired keys is tested

## Reports and Output

### Generated Reports

After running tests, find reports in `reports/`:

- **story_2_1_test_report.json**: Detailed test results
- **story_2_1_summary.md**: Human-readable summary
- **coverage/index.html**: Code coverage report
- **junit_*.xml**: JUnit format for CI/CD
- **report_*.html**: HTML test reports

### Report Contents

- **Test Results**: Pass/fail status for each test suite
- **Performance Metrics**: Response times, throughput
- **Coverage Analysis**: Code coverage by module
- **API Validation**: Real API key validation results
- **Error Analysis**: Failed test details and stack traces

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check PostgreSQL is running
   pg_ctl status
   
   # Verify connection string
   echo $TEST_DATABASE_URL
   ```

2. **API Key Validation Failures**
   - Check if API keys are still valid
   - Verify rate limits aren't exceeded
   - Ensure network connectivity

3. **Import Errors**
   ```bash
   # Ensure you're in the correct directory
   cd tests/story-2.1
   
   # Check Python path
   python -c "import sys; print(sys.path)"
   ```

4. **Test Timeouts**
   - Integration tests may take longer due to real API calls
   - Performance tests stress the system and may be slow
   - Increase timeout values if needed

### Debug Mode

Run tests with debug output:

```bash
pytest -v -s --tb=long --log-cli-level=DEBUG
```

### Selective Testing

Run specific tests:

```bash
# Test only portfolio API
pytest test_portfolio_api.py -v

# Test only dashboard functionality
pytest test_end_to_end.py::TestDashboardEndToEnd -v

# Test specific function
pytest test_portfolio_api.py::TestPortfolioAPI::test_create_portfolio_success -v
```

## Success Criteria

### Story 2.1 Acceptance Criteria

✅ **Dashboard Layout**: Clean, responsive dashboard interface
✅ **Portfolio Snapshot**: Real-time portfolio values and P&L
✅ **Market Data Integration**: Live stock prices from multiple providers
✅ **AI Insights**: Automated portfolio analysis and recommendations
✅ **API Key Management**: Secure storage and validation
✅ **Performance**: < 2s dashboard load time
✅ **Error Handling**: Graceful fallbacks for API failures
✅ **Data Integrity**: Accurate financial calculations
✅ **Security**: Encrypted API keys, authenticated endpoints

### Test Success Criteria

- **All Tests Pass**: 100% test success rate
- **Coverage**: > 80% code coverage
- **Performance**: Dashboard loads in < 2 seconds
- **Integration**: Real API validation succeeds
- **Security**: No sensitive data exposed in tests

## Production Readiness

Upon successful test completion, Story 2.1 implementation is:

🚀 **Ready for Production Deployment**

- All functionality tested and validated
- Real API integrations verified
- Performance requirements met
- Security standards implemented
- Error handling proven robust
- Documentation complete

## Next Steps

After Story 2.1 testing:

1. **Deploy to Staging**: Use validated configuration
2. **User Acceptance Testing**: Validate with real users
3. **Performance Monitoring**: Set up production monitoring
4. **Story 2.2**: Begin next story implementation

---

**Contact**: For questions about Story 2.1 testing, refer to the implementation documentation in `docs/stories/story-2.1-implementation.md`. 