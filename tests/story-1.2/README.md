# Story 1.2: User Login Flow - Test Suite

This directory contains all tests for **Story 1.2: Implement User Login Flow** including unit tests, integration tests, and E2E tests with MCP integration.

**Key Principle: All test files remain in `/tests/` folder. MCP servers are used from existing `/mcp-servers/` infrastructure.**

## Test Structure

```
tests/story-1.2/
├── README.md                         # This file
├── test_setup_verification.py        # Setup verification tests
├── unit/                             # Unit tests
│   ├── test_auth_context.py          # AuthContext React component tests
│   ├── test_login_form.py            # LoginForm component tests
│   ├── test_auth_service.py          # authService API client tests
│   └── test_jwt_utils.py             # JWT utility functions tests
├── integration/                      # Integration tests
│   ├── test_login_flow.py            # Full login flow integration
│   ├── test_mcp_auth.py              # MCP authentication server tests
│   ├── test_cookie_handling.py       # HttpOnly cookie integration
│   └── test_security_features.py    # Rate limiting, CSRF, lockout tests
├── e2e/                              # End-to-end tests with Playwright
│   ├── test_login_ui.py              # UI interaction tests
│   ├── test_responsive.py           # Cross-browser & mobile tests
│   ├── test_accessibility.py        # A11y compliance tests
│   └── test_mcp_integration.py       # Full MCP workflow tests
├── mcp/                              # MCP-specific tests
│   ├── test_auth_mcp_server.py       # MCP Auth server testing
│   ├── test_mcp_tools.py             # MCP tool functionality
│   └── test_mcp_communication.py    # MCP protocol compliance
├── fixtures/                         # Test data and fixtures
│   ├── test_users.py                 # Test user data
│   ├── test_auth_server.py           # Test auth server (localhost:8000)
│   └── mock_responses.py             # Mock API responses
├── utils/                            # Test utilities
│   ├── mcp_test_client.py            # MCP testing utilities
│   ├── playwright_utils.py           # Playwright test helpers
│   └── assertions.py                 # Custom test assertions
└── conftest.py                       # pytest configuration and fixtures
```

## Infrastructure Integration

### MCP Servers (External to Tests)
```
/mcp-servers/auth-server/server.py    # Enhanced auth MCP server (localhost:8002)
├── Real authentication functionality
├── Test user database 
├── Session management
└── Full MCP tool implementation
```

### Test Servers (In Tests)
```
tests/story-1.2/fixtures/test_auth_server.py  # Test HTTP API server (localhost:8000)
├── Provides HTTP endpoints for frontend testing
├── Integrates with MCP auth server
└── Test-specific functionality
```

## Test Execution

### Run All Tests
```bash
cd tests/story-1.2
pytest
```

### Run Setup Verification First
```bash
# Verify infrastructure is working
pytest test_setup_verification.py -v
```

### Run Specific Test Categories
```bash
# Unit tests only
pytest unit/

# Integration tests (requires running backend)
pytest integration/

# E2E tests (requires frontend + backend)
pytest e2e/

# MCP tests (requires MCP servers)
pytest mcp/
```

### Run with Coverage
```bash
pytest --cov=src/components/auth --cov=src/contexts --cov=src/services --cov-report=html
```

## MCP Integration Testing

This test suite includes comprehensive MCP (Model Context Protocol) testing using the **existing MCP infrastructure**:

1. **MCP Auth Server Testing** - Testing the enhanced MCP auth server at `/mcp-servers/auth-server/`
2. **MCP Tool Validation** - Testing individual MCP tools for authentication
3. **MCP Communication** - Testing MCP protocol compliance and message handling
4. **MCP Integration** - End-to-end testing of authentication flow through MCP

### MCP vs HTTP API Testing
- **MCP Server** (localhost:8002): Tests MCP protocol, tools, and session management
- **Test HTTP Server** (localhost:8000): Tests frontend integration and HTTP API compliance
- **Both servers** share the same test user database for consistency

## Prerequisites

### Required Services
1. **Enhanced MCP Auth Server** - `python mcp-servers/auth-server/server.py` (port 8002)
2. **Test HTTP Server** - Started automatically by pytest fixtures (port 8000)
3. **Frontend Dev Server** - `npm run dev` (port 3000) - for E2E tests only
4. **Database Services** - Via Docker compose (PostgreSQL, Redis, etc.)

### Quick Start
```bash
# 1. Start MCP Auth Server
cd mcp-servers/auth-server
python server.py

# 2. Run verification tests
cd tests/story-1.2
pytest test_setup_verification.py -v

# 3. Run all tests
pytest
```

## Test Data

Test users are defined in `fixtures/test_users.py`:
- `testuser@example.com` - Active user for success scenarios
- `inactive@example.com` - Inactive user for deactivation testing  
- `locked@example.com` - Locked user for account lockout testing
- `admin@example.com` - Admin user for privileged operations

**Same test users are available in both Test HTTP Server and MCP Auth Server.**

## Architecture Benefits

### ✅ Proper Separation
- **Tests** stay in `/tests/` folder
- **MCP Servers** stay in `/mcp-servers/` folder
- **Clear responsibility boundaries**

### ✅ MCP Integration
- Tests use **existing MCP infrastructure**
- Enhanced MCP server with real functionality
- Full MCP protocol compliance testing

### ✅ Comprehensive Coverage
- HTTP API testing for frontend integration
- MCP protocol testing for server-to-server communication
- End-to-end testing with Playwright
- Unit tests for individual components

## Continuous Integration

Tests are designed to run in CI/CD environments with:
- Automatic test server startup/shutdown
- MCP server health checks and skipping if unavailable
- Headless browser support for E2E tests
- Docker container support for databases
- Parallel test execution
- Comprehensive reporting

## Contributing

When adding new tests:
1. **Place in appropriate subdirectory** (unit/integration/e2e/mcp)
2. **Follow naming convention** `test_*.py`
3. **Include MCP testing** where authentication is involved
4. **Add fixtures to `fixtures/` directory**
5. **Update this README** with new test categories
6. **Keep all test files in `/tests/` folder**
7. **Use existing MCP servers** from `/mcp-servers/` 