"""
MCP Authentication Server Tests for Story 1.2
Tests the MCP authentication server functionality and tools
"""
import pytest
import asyncio
from typing import Dict, Any
from utils.mcp_test_client import MCPTestClient, MCPTestScenarios, wait_for_mcp_server, assert_mcp_tool_response
from fixtures.test_users import VALID_CREDENTIALS, INVALID_CREDENTIALS, INACTIVE_USER_CREDENTIALS, LOCKED_USER_CREDENTIALS

# Test marks
pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.mcp,
    pytest.mark.integration
]

class TestMCPAuthServer:
    """Test MCP authentication server functionality."""

    @pytest.fixture(scope="class")
    async def mcp_server_ready(self):
        """Ensure MCP server is available before running tests."""
        server_available = await wait_for_mcp_server("http://localhost:8002", max_retries=10, delay=2.0)
        if not server_available:
            pytest.skip("MCP authentication server not available")
        yield True

    @pytest.fixture
    async def mcp_client(self, mcp_server_ready):
        """Create MCP test client."""
        client = MCPTestClient("http://localhost:8002")
        connected = await client.connect()
        if not connected:
            pytest.skip("Could not connect to MCP server")
        
        yield client
        await client.disconnect()

    async def test_mcp_server_health(self, mcp_client: MCPTestClient):
        """Test MCP server health check."""
        health = await mcp_client.health_check()
        
        assert health["status"] in ["healthy", "ok"], f"Unexpected health status: {health}"
        assert "error" not in health, f"Health check returned error: {health.get('error')}"

    async def test_mcp_tools_availability(self, mcp_client: MCPTestClient):
        """Test that all required MCP authentication tools are available."""
        tools_result = await MCPTestScenarios.test_mcp_tools_availability(mcp_client)
        
        assert tools_result["all_tools_available"], f"Missing tools: {tools_result['missing_tools']}"
        
        # Verify specific tools
        required_tools = [
            "authenticate_user",
            "validate_token", 
            "create_user",
            "get_user_profile",
            "update_user_profile",
            "invalidate_session",
            "get_user_sessions"
        ]
        
        available_tools = tools_result["available_tools"]
        for tool in required_tools:
            assert tool in available_tools, f"Required tool '{tool}' not available"

    async def test_mcp_authenticate_valid_user(self, mcp_client: MCPTestClient):
        """Test MCP user authentication with valid credentials."""
        response = await mcp_client.authenticate_user(
            VALID_CREDENTIALS["email"],
            VALID_CREDENTIALS["password"]
        )
        
        await assert_mcp_tool_response(
            response, 
            expected_success=True,
            required_fields=["session_token", "user_id", "expires_at"]
        )
        
        assert response["user_id"] is not None
        assert response["session_token"] is not None
        assert response["expires_at"] is not None

    async def test_mcp_authenticate_invalid_credentials(self, mcp_client: MCPTestClient):
        """Test MCP authentication with invalid credentials."""
        response = await mcp_client.authenticate_user(
            INVALID_CREDENTIALS["email"],
            INVALID_CREDENTIALS["password"]
        )
        
        await assert_mcp_tool_response(
            response,
            expected_success=False,
            required_fields=["error"]
        )
        
        assert "invalid" in response["error"].lower() or "not found" in response["error"].lower()

    async def test_mcp_authenticate_inactive_user(self, mcp_client: MCPTestClient):
        """Test MCP authentication with inactive user."""
        response = await mcp_client.authenticate_user(
            INACTIVE_USER_CREDENTIALS["email"],
            INACTIVE_USER_CREDENTIALS["password"]
        )
        
        await assert_mcp_tool_response(
            response,
            expected_success=False,
            required_fields=["error"]
        )
        
        assert "inactive" in response["error"].lower() or "deactivated" in response["error"].lower()

    async def test_mcp_authenticate_locked_user(self, mcp_client: MCPTestClient):
        """Test MCP authentication with locked user."""
        response = await mcp_client.authenticate_user(
            LOCKED_USER_CREDENTIALS["email"],
            LOCKED_USER_CREDENTIALS["password"]
        )
        
        await assert_mcp_tool_response(
            response,
            expected_success=False,
            required_fields=["error"]
        )
        
        assert "locked" in response["error"].lower() or "blocked" in response["error"].lower()

    async def test_mcp_token_validation(self, mcp_client: MCPTestClient):
        """Test MCP token validation."""
        # First authenticate to get a token
        auth_response = await mcp_client.authenticate_user(
            VALID_CREDENTIALS["email"],
            VALID_CREDENTIALS["password"]
        )
        
        assert auth_response["success"], f"Authentication failed: {auth_response.get('error')}"
        session_token = auth_response["session_token"]
        
        # Validate the token
        validation_response = await mcp_client.validate_token(session_token)
        
        await assert_mcp_tool_response(
            validation_response,
            expected_success=True,
            required_fields=["user_id", "expires_at", "valid"]
        )
        
        assert validation_response["valid"] is True
        assert validation_response["user_id"] == auth_response["user_id"]

    async def test_mcp_invalid_token_validation(self, mcp_client: MCPTestClient):
        """Test MCP validation with invalid token."""
        response = await mcp_client.validate_token("invalid-token-12345")
        
        await assert_mcp_tool_response(
            response,
            expected_success=False,
            required_fields=["error"]
        )

    async def test_mcp_get_user_profile(self, mcp_client: MCPTestClient):
        """Test MCP get user profile."""
        # First authenticate to get user ID
        auth_response = await mcp_client.authenticate_user(
            VALID_CREDENTIALS["email"],
            VALID_CREDENTIALS["password"]
        )
        
        assert auth_response["success"], f"Authentication failed: {auth_response.get('error')}"
        user_id = auth_response["user_id"]
        session_token = auth_response["session_token"]
        
        # Set session token for authorized request
        mcp_client.set_session_token(session_token)
        
        # Get user profile
        profile_response = await mcp_client.get_user_profile(user_id)
        
        await assert_mcp_tool_response(
            profile_response,
            expected_success=True,
            required_fields=["user_id", "email", "created_at"]
        )
        
        assert profile_response["user_id"] == user_id
        assert profile_response["email"] == VALID_CREDENTIALS["email"]

    async def test_mcp_session_invalidation(self, mcp_client: MCPTestClient):
        """Test MCP session invalidation."""
        # First authenticate to get session
        auth_response = await mcp_client.authenticate_user(
            VALID_CREDENTIALS["email"],
            VALID_CREDENTIALS["password"]
        )
        
        assert auth_response["success"], f"Authentication failed: {auth_response.get('error')}"
        session_token = auth_response["session_token"]
        
        # Invalidate session
        invalidation_response = await mcp_client.invalidate_session(session_token)
        
        await assert_mcp_tool_response(
            invalidation_response,
            expected_success=True
        )
        
        # Verify token is now invalid
        validation_response = await mcp_client.validate_token(session_token)
        assert validation_response["success"] is False, "Token should be invalid after session invalidation"

    async def test_mcp_complete_auth_flow(self, mcp_client: MCPTestClient):
        """Test complete MCP authentication flow."""
        flow_result = await MCPTestScenarios.test_authentication_flow(
            mcp_client, 
            VALID_CREDENTIALS["email"],
            VALID_CREDENTIALS["password"]
        )
        
        # Verify each step succeeded
        assert flow_result["authentication"]["success"], "Authentication step failed"
        assert flow_result["token_validation"]["success"], "Token validation step failed" 
        assert flow_result["profile_access"]["success"], "Profile access step failed"
        assert flow_result["session_invalidation"]["success"], "Session invalidation step failed"

    async def test_mcp_error_handling(self, mcp_client: MCPTestClient):
        """Test MCP error handling scenarios."""
        error_results = await MCPTestScenarios.test_error_handling(mcp_client)
        
        # All error scenarios should return success=False
        assert error_results["invalid_credentials"]["success"] is False
        assert error_results["invalid_token"]["success"] is False
        assert error_results["invalid_user_id"]["success"] is False
        assert error_results["malformed_request"]["success"] is False
        
        # All should have error messages
        for scenario, result in error_results.items():
            assert "error" in result, f"Error scenario '{scenario}' missing error message"

    async def test_mcp_concurrent_authentication(self, mcp_client: MCPTestClient):
        """Test MCP handles concurrent authentication requests."""
        # Create multiple authentication tasks
        auth_tasks = []
        for i in range(5):
            task = mcp_client.authenticate_user(
                VALID_CREDENTIALS["email"],
                VALID_CREDENTIALS["password"]
            )
            auth_tasks.append(task)
        
        # Execute concurrently
        results = await asyncio.gather(*auth_tasks, return_exceptions=True)
        
        # All should succeed (or at least not raise exceptions)
        for i, result in enumerate(results):
            assert not isinstance(result, Exception), f"Task {i} raised exception: {result}"
            assert result["success"], f"Task {i} failed: {result.get('error')}"

    async def test_mcp_session_management(self, mcp_client: MCPTestClient):
        """Test MCP session management functionality."""
        # Authenticate user
        auth_response = await mcp_client.authenticate_user(
            VALID_CREDENTIALS["email"],
            VALID_CREDENTIALS["password"]
        )
        
        assert auth_response["success"], f"Authentication failed: {auth_response.get('error')}"
        user_id = auth_response["user_id"]
        session_token = auth_response["session_token"]
        
        # Set session for subsequent requests
        mcp_client.set_session_token(session_token)
        
        # Get user sessions
        sessions_response = await mcp_client.get_user_sessions(user_id)
        
        await assert_mcp_tool_response(
            sessions_response,
            expected_success=True,
            required_fields=["sessions"]
        )
        
        # Verify current session is in the list
        sessions = sessions_response["sessions"]
        assert len(sessions) >= 1, "User should have at least one active session"
        
        # Find current session
        current_session = None
        for session in sessions:
            if session.get("session_token") == session_token:
                current_session = session
                break
        
        assert current_session is not None, "Current session not found in sessions list"

class TestMCPIntegrationWithHTTPAPI:
    """Test MCP integration with HTTP API endpoints."""

    @pytest.fixture
    async def mcp_client(self):
        """Create MCP test client."""
        client = MCPTestClient("http://localhost:8002")
        connected = await client.connect()
        if not connected:
            pytest.skip("Could not connect to MCP server")
        
        yield client
        await client.disconnect()

    async def test_mcp_http_api_consistency(self, mcp_client: MCPTestClient, http_client):
        """Test that MCP and HTTP API return consistent results."""
        email = VALID_CREDENTIALS["email"]
        password = VALID_CREDENTIALS["password"]
        
        # Test via MCP
        mcp_auth = await mcp_client.authenticate_user(email, password)
        
        # Test via HTTP API
        http_response = await http_client.post("/api/v1/auth/login", json={
            "email": email,
            "password": password
        })
        
        # Both should succeed
        assert mcp_auth["success"], f"MCP authentication failed: {mcp_auth.get('error')}"
        assert http_response.status_code == 200, f"HTTP authentication failed: {http_response.text}"
        
        http_data = http_response.json()
        
        # Compare user data (should be consistent)
        assert mcp_auth["user_id"] is not None
        assert http_data["user"]["id"] is not None
        assert http_data["user"]["email"] == email

    async def test_mcp_session_with_http_validation(self, mcp_client: MCPTestClient, http_client):
        """Test MCP session token works with HTTP API validation."""
        # Authenticate via MCP
        mcp_auth = await mcp_client.authenticate_user(
            VALID_CREDENTIALS["email"],
            VALID_CREDENTIALS["password"]
        )
        
        assert mcp_auth["success"], f"MCP authentication failed: {mcp_auth.get('error')}"
        session_token = mcp_auth["session_token"]
        
        # Use session token with HTTP API
        http_client.cookies.set("access_token", session_token)
        
        # Test authenticated endpoint
        me_response = await http_client.get("/api/v1/auth/me")
        
        # Should work with MCP-generated token
        assert me_response.status_code == 200, f"HTTP /me endpoint failed: {me_response.text}"
        
        me_data = me_response.json()
        assert me_data["email"] == VALID_CREDENTIALS["email"] 