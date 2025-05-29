"""
Setup verification test for Story 1.2 MCP integration
This test verifies that all components work together correctly:
- Test server in tests/story-1.2/fixtures/
- MCP auth server in /mcp-servers/auth-server/
- MCP client utilities
"""
import pytest
import asyncio
import httpx
from fixtures.test_auth_server import TestAuthServerForMCPIntegration
from utils.mcp_test_client import MCPTestClient, wait_for_mcp_server

pytestmark = [
    pytest.mark.asyncio
]

class TestStory12SetupVerification:
    """Verify that Story 1.2 test infrastructure is properly set up."""

    async def test_test_server_starts_correctly(self):
        """Test that our test server starts correctly and serves expected endpoints."""
        server = TestAuthServerForMCPIntegration(port=8001)  # Different port to avoid conflicts
        
        try:
            await server.start()
            
            # Test health endpoint
            async with httpx.AsyncClient() as client:
                response = await client.get("http://localhost:8001/health")
                assert response.status_code == 200
                
                data = response.json()
                assert data["status"] == "healthy"
                assert data["service"] == "stockpulse-test-auth-server"
                assert data["mcp_auth_server"] == "http://localhost:8002"
                assert data["test_users_count"] == 3
                
        finally:
            await server.stop()

    async def test_test_server_login_functionality(self):
        """Test that login functionality works in our test server."""
        server = TestAuthServerForMCPIntegration(port=8001)
        
        try:
            await server.start()
            
            async with httpx.AsyncClient() as client:
                # Test valid login
                response = await client.post("http://localhost:8001/api/v1/auth/login", json={
                    "email": "testuser@example.com",
                    "password": "Password123!"
                })
                
                assert response.status_code == 200
                data = response.json()
                
                assert "user" in data
                assert "message" in data
                assert "csrf_token" in data
                assert data["user"]["email"] == "testuser@example.com"
                assert data["message"] == "Login successful"
                
                # Test invalid login
                response = await client.post("http://localhost:8001/api/v1/auth/login", json={
                    "email": "invalid@example.com",
                    "password": "wrongpassword"
                })
                
                assert response.status_code == 401
                
        finally:
            await server.stop()

    async def test_mcp_server_connectivity(self):
        """Test that we can connect to the MCP auth server."""
        # Wait for MCP server to be available (if running)
        server_available = await wait_for_mcp_server("http://localhost:8002", max_retries=3, delay=1.0)
        
        if not server_available:
            pytest.skip("MCP authentication server not available at localhost:8002")
        
        client = MCPTestClient("http://localhost:8002")
        
        try:
            connected = await client.connect()
            assert connected, "Should be able to connect to MCP server"
            
            # Test health check
            health = await client.health_check()
            assert health["status"] in ["healthy", "ok"], f"Unexpected health status: {health}"
            
        finally:
            await client.disconnect()

    async def test_mcp_server_tools_available(self):
        """Test that MCP server has required authentication tools."""
        server_available = await wait_for_mcp_server("http://localhost:8002", max_retries=3, delay=1.0)
        
        if not server_available:
            pytest.skip("MCP authentication server not available at localhost:8002")
        
        client = MCPTestClient("http://localhost:8002")
        
        try:
            connected = await client.connect()
            assert connected, "Should be able to connect to MCP server"
            
            # List available tools
            tools = await client.list_tools()
            tool_names = [tool.get("name") for tool in tools]
            
            required_tools = [
                "authenticate_user",
                "validate_token",
                "get_user_profile",
                "invalidate_session",
                "get_user_sessions"
            ]
            
            for tool in required_tools:
                assert tool in tool_names, f"Required tool '{tool}' not available. Available: {tool_names}"
                
        finally:
            await client.disconnect()

    async def test_mcp_authentication_flow(self):
        """Test complete MCP authentication flow."""
        server_available = await wait_for_mcp_server("http://localhost:8002", max_retries=3, delay=1.0)
        
        if not server_available:
            pytest.skip("MCP authentication server not available at localhost:8002")
        
        client = MCPTestClient("http://localhost:8002")
        
        try:
            connected = await client.connect()
            assert connected, "Should be able to connect to MCP server"
            
            # Test authentication
            auth_result = await client.authenticate_user("testuser@example.com", "Password123!")
            
            assert auth_result["success"], f"Authentication should succeed: {auth_result}"
            assert "user_id" in auth_result
            assert "session_token" in auth_result
            assert "expires_at" in auth_result
            
            session_token = auth_result["session_token"]
            user_id = auth_result["user_id"]
            
            # Test token validation
            validation_result = await client.validate_token(session_token)
            assert validation_result["success"], f"Token validation should succeed: {validation_result}"
            assert validation_result["valid"] is True
            assert validation_result["user_id"] == user_id
            
            # Test get user profile
            client.set_session_token(session_token)
            profile_result = await client.get_user_profile(user_id)
            assert profile_result["success"], f"Profile access should succeed: {profile_result}"
            assert profile_result["email"] == "testuser@example.com"
            
            # Test session invalidation
            invalidate_result = await client.invalidate_session(session_token)
            assert invalidate_result["success"], f"Session invalidation should succeed: {invalidate_result}"
            
            # Verify token is now invalid
            validation_result = await client.validate_token(session_token)
            assert validation_result["success"] is False, "Token should be invalid after session invalidation"
            
        finally:
            await client.disconnect()

    async def test_test_infrastructure_integration(self):
        """Test that test server and MCP server can work together."""
        # Start test server
        test_server = TestAuthServerForMCPIntegration(port=8001)
        
        try:
            await test_server.start()
            
            # Check MCP server availability
            mcp_available = await wait_for_mcp_server("http://localhost:8002", max_retries=3, delay=1.0)
            
            if not mcp_available:
                pytest.skip("MCP authentication server not available at localhost:8002")
            
            # Test parallel authentication via both servers
            async with httpx.AsyncClient() as http_client:
                # HTTP API authentication
                http_response = await http_client.post("http://localhost:8001/api/v1/auth/login", json={
                    "email": "testuser@example.com",
                    "password": "Password123!"
                })
                assert http_response.status_code == 200
                
            # MCP authentication
            mcp_client = MCPTestClient("http://localhost:8002")
            try:
                await mcp_client.connect()
                mcp_auth = await mcp_client.authenticate_user("testuser@example.com", "Password123!")
                assert mcp_auth["success"], f"MCP authentication failed: {mcp_auth}"
                
                # Both should work independently
                http_data = http_response.json()
                assert http_data["user"]["email"] == "testuser@example.com"
                assert mcp_auth["user_id"] is not None
                
            finally:
                await mcp_client.disconnect()
                
        finally:
            await test_server.stop()

    def test_file_structure_compliance(self):
        """Test that all files are in the correct locations within tests folder."""
        import os
        
        # Get current working directory
        current_dir = os.getcwd()
        
        # We should be in tests/story-1.2
        assert current_dir.endswith(os.path.join("tests", "story-1.2")) or current_dir.endswith("tests\\story-1.2"), f"Should be in tests/story-1.2, but in {current_dir}"
        
        # Verify test files are in current directory (which should be tests/story-1.2/)
        required_files = [
            "conftest.py",
            "README.md", 
            "test_setup_verification.py",
            "fixtures/",
            "fixtures/test_auth_server.py",
            "fixtures/test_users.py",
            "utils/",
            "utils/mcp_test_client.py",
            "mcp/",
            "mcp/test_auth_mcp_server.py"
        ]
        
        for item in required_files:
            assert os.path.exists(item), f"Missing required file/directory: {item}"
        
        # Verify MCP servers are in the correct location (up two levels)
        project_root = os.path.join(current_dir, "..", "..")
        mcp_servers_path = os.path.join(project_root, "mcp-servers")
        auth_server_path = os.path.join(mcp_servers_path, "auth-server", "server.py")
        
        assert os.path.exists(mcp_servers_path), f"MCP servers directory should exist at {mcp_servers_path}"
        assert os.path.exists(auth_server_path), f"Auth server should exist at {auth_server_path}"
        
        # Verify NO MCP servers exist in tests (they should be separate)
        tests_mcp_path = os.path.join(current_dir, "..", "mcp-servers")
        assert not os.path.exists(tests_mcp_path), "MCP servers should NOT be in tests folder"

    def test_mcp_server_location_correct(self):
        """Test that MCP servers are in the correct location outside tests."""
        import os
        
        current_dir = os.getcwd()
        
        # Verify MCP servers are in /mcp-servers/ (not in tests)
        project_root = os.path.join(current_dir, "..", "..")
        mcp_servers_dir = os.path.join(project_root, "mcp-servers")
        assert os.path.exists(mcp_servers_dir), f"MCP servers directory should exist at {mcp_servers_dir}"
        
        auth_server_dir = os.path.join(mcp_servers_dir, "auth-server")
        assert os.path.exists(auth_server_dir), f"Auth server directory should exist at {auth_server_dir}"
        
        auth_server_file = os.path.join(auth_server_dir, "server.py")
        assert os.path.exists(auth_server_file), f"Auth server should exist at {auth_server_file}"
        
        # Verify NO MCP servers exist in tests folder (they should be separate)
        tests_mcp_path = os.path.join(current_dir, "..", "mcp-servers")
        assert not os.path.exists(tests_mcp_path), "MCP servers should NOT be in tests folder" 