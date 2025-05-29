"""
Pytest configuration and fixtures for Story 1.2 testing with MCP integration
"""
import asyncio
import pytest
import httpx
from typing import AsyncGenerator, Dict, Any
from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from fixtures.test_auth_server import TestAuthServerForMCPIntegration
from fixtures.test_users import TEST_USERS
from utils.mcp_test_client import MCPTestClient

# Pytest configuration
pytest_plugins = ["pytest_asyncio"]

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_server():
    """Start test authentication server for the session."""
    server = TestAuthServerForMCPIntegration()
    await server.start()
    yield server
    await server.stop()

@pytest.fixture(scope="session")
async def mcp_auth_client():
    """Create MCP authentication client for testing."""
    client = MCPTestClient("http://localhost:8002")
    await client.connect()
    yield client
    await client.disconnect()

@pytest.fixture
async def http_client():
    """HTTP client for API testing."""
    async with httpx.AsyncClient(
        base_url="http://localhost:8000",
        follow_redirects=True,
        timeout=30.0
    ) as client:
        yield client

@pytest.fixture
async def authenticated_http_client(http_client: httpx.AsyncClient):
    """HTTP client with authenticated session."""
    # Login with test user
    login_response = await http_client.post("/api/v1/auth/login", json={
        "email": "testuser@example.com",
        "password": "Password123!"
    })
    assert login_response.status_code == 200
    
    # Extract cookies for subsequent requests
    cookies = login_response.cookies
    http_client.cookies.update(cookies)
    
    yield http_client

@pytest.fixture(scope="session") 
async def browser():
    """Playwright browser instance for E2E testing."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,  # Set to False for debugging
            args=["--disable-web-security", "--disable-features=VizDisplayCompositor"]
        )
        yield browser
        await browser.close()

@pytest.fixture
async def browser_context(browser: Browser):
    """Browser context with authentication setup."""
    context = await browser.new_context(
        viewport={"width": 1280, "height": 720},
        locale="en-US",
        timezone_id="America/New_York",
        permissions=["clipboard-read", "clipboard-write"]
    )
    yield context
    await context.close()

@pytest.fixture
async def page(browser_context: BrowserContext):
    """Page instance for E2E testing."""
    page = await browser_context.new_page()
    yield page
    await page.close()

@pytest.fixture
async def authenticated_page(page: Page):
    """Page with authenticated user session."""
    # Navigate to login page
    await page.goto("http://localhost:3000/login")
    
    # Fill login form
    await page.fill('[data-testid="email-input"]', "testuser@example.com")
    await page.fill('[data-testid="password-input"]', "Password123!")
    
    # Submit login
    await page.click('[data-testid="login-submit"]')
    
    # Wait for redirect to dashboard
    await page.wait_for_url("**/dashboard")
    
    yield page

@pytest.fixture
def test_users():
    """Test user data."""
    return TEST_USERS

@pytest.fixture
def valid_login_data():
    """Valid login credentials for testing."""
    return {
        "email": "testuser@example.com",
        "password": "Password123!"
    }

@pytest.fixture
def invalid_login_data():
    """Invalid login credentials for testing."""
    return {
        "email": "invalid@example.com", 
        "password": "wrongpassword"
    }

@pytest.fixture
def inactive_user_data():
    """Inactive user credentials for testing."""
    return {
        "email": "inactive@example.com",
        "password": "Password123!"
    }

@pytest.fixture
def locked_user_data():
    """Locked user credentials for testing."""
    return {
        "email": "locked@example.com",
        "password": "Password123!"
    }

@pytest.fixture
async def rate_limit_reset():
    """Reset rate limiting before test."""
    # Reset rate limit counters via test server
    async with httpx.AsyncClient() as client:
        await client.post("http://localhost:8000/test/reset-state")
    yield
    # Cleanup after test
    async with httpx.AsyncClient() as client:
        await client.post("http://localhost:8000/test/reset-state")

@pytest.fixture
def mcp_auth_tools():
    """MCP authentication tools for testing."""
    return [
        "authenticate_user",
        "validate_token", 
        "create_user",
        "get_user_profile",
        "update_user_profile", 
        "invalidate_session",
        "get_user_sessions"
    ]

@pytest.fixture
async def mcp_authenticated_session(mcp_auth_client: MCPTestClient):
    """MCP client with authenticated session."""
    # Authenticate via MCP
    auth_result = await mcp_auth_client.call_tool("authenticate_user", {
        "email": "testuser@example.com",
        "password": "Password123!"
    })
    
    assert auth_result["success"] is True
    session_token = auth_result["session_token"]
    
    # Set session for subsequent calls
    mcp_auth_client.set_session_token(session_token)
    
    yield mcp_auth_client
    
    # Cleanup session
    await mcp_auth_client.call_tool("invalidate_session", {
        "session_token": session_token
    })

# Test markers
pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.timeout(30)  # 30 second timeout for all tests
]

# Custom test decorators
def requires_backend(func):
    """Decorator for tests that require backend server."""
    return pytest.mark.backend(func)

def requires_mcp(func):
    """Decorator for tests that require MCP servers.""" 
    return pytest.mark.mcp(func)

def requires_frontend(func):
    """Decorator for tests that require frontend server."""
    return pytest.mark.frontend(func)

def slow_test(func):
    """Decorator for slow tests."""
    return pytest.mark.slow(func)

# Utility functions
def assert_login_response(response_data: Dict[str, Any]):
    """Assert login response has correct structure."""
    assert "user" in response_data
    assert "message" in response_data
    assert "csrf_token" in response_data
    
    user = response_data["user"]
    assert "id" in user
    assert "email" in user
    assert "created_at" in user
    assert "last_login" in user

def assert_error_response(response_data: Dict[str, Any], expected_detail: str = None):
    """Assert error response has correct structure."""
    assert "detail" in response_data
    if expected_detail:
        assert response_data["detail"] == expected_detail

async def wait_for_element(page: Page, selector: str, timeout: int = 5000):
    """Wait for element to be visible."""
    await page.wait_for_selector(selector, timeout=timeout, state="visible")

async def assert_cookie_set(page: Page, cookie_name: str):
    """Assert that a specific cookie is set."""
    cookies = await page.context.cookies()
    cookie_names = [cookie["name"] for cookie in cookies]
    assert cookie_name in cookie_names, f"Cookie {cookie_name} not found" 