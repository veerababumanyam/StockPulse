"""
MCP (Model Context Protocol) test client for Story 1.2 authentication testing
"""
import asyncio
import json
import httpx
from typing import Dict, Any, Optional, List
from datetime import datetime

class MCPTestClient:
    """Test client for MCP authentication server communication."""
    
    def __init__(self, base_url: str = "http://localhost:8002"):
        self.base_url = base_url.rstrip('/')
        self.session_token: Optional[str] = None
        self.client: Optional[httpx.AsyncClient] = None
        self.connected = False
        
    async def connect(self):
        """Connect to MCP authentication server."""
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=30.0,
            headers={"Content-Type": "application/json"}
        )
        
        try:
            # Test connection
            response = await self.client.get("/health")
            if response.status_code == 200:
                self.connected = True
                return True
        except Exception as e:
            print(f"Failed to connect to MCP server: {e}")
            return False
        
        return False
    
    async def disconnect(self):
        """Disconnect from MCP server."""
        if self.client:
            await self.client.aclose()
            self.client = None
        self.connected = False
        self.session_token = None
    
    def set_session_token(self, token: str):
        """Set session token for authenticated requests."""
        self.session_token = token
        if self.client:
            self.client.headers.update({"Authorization": f"Bearer {token}"})
    
    async def call_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Call an MCP tool with parameters."""
        if not self.connected or not self.client:
            raise Exception("MCP client not connected")
        
        payload = {
            "tool": tool_name,
            "parameters": parameters,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            response = await self.client.post("/tools/call", json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            return {
                "success": False,
                "error": f"HTTP {e.response.status_code}: {e.response.text}",
                "tool": tool_name
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "tool": tool_name
            }
    
    async def list_tools(self) -> List[Dict[str, Any]]:
        """List available MCP tools."""
        if not self.connected or not self.client:
            raise Exception("MCP client not connected")
        
        try:
            response = await self.client.get("/tools/list")
            response.raise_for_status()
            return response.json().get("tools", [])
        except Exception as e:
            print(f"Failed to list tools: {e}")
            return []
    
    async def get_tool_info(self, tool_name: str) -> Dict[str, Any]:
        """Get information about a specific tool."""
        if not self.connected or not self.client:
            raise Exception("MCP client not connected")
        
        try:
            response = await self.client.get(f"/tools/{tool_name}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e), "tool": tool_name}
    
    async def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user via MCP."""
        return await self.call_tool("authenticate_user", {
            "email": email,
            "password": password
        })
    
    async def validate_token(self, token: str) -> Dict[str, Any]:
        """Validate authentication token via MCP."""
        return await self.call_tool("validate_token", {
            "token": token
        })
    
    async def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile via MCP."""
        return await self.call_tool("get_user_profile", {
            "user_id": user_id
        })
    
    async def create_user(self, email: str, password: str, **kwargs) -> Dict[str, Any]:
        """Create new user via MCP."""
        parameters = {
            "email": email,
            "password": password,
            **kwargs
        }
        return await self.call_tool("create_user", parameters)
    
    async def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile via MCP."""
        return await self.call_tool("update_user_profile", {
            "user_id": user_id,
            "updates": updates
        })
    
    async def invalidate_session(self, session_token: str) -> Dict[str, Any]:
        """Invalidate user session via MCP."""
        return await self.call_tool("invalidate_session", {
            "session_token": session_token
        })
    
    async def get_user_sessions(self, user_id: str) -> Dict[str, Any]:
        """Get user sessions via MCP."""
        return await self.call_tool("get_user_sessions", {
            "user_id": user_id
        })
    
    async def health_check(self) -> Dict[str, Any]:
        """Check MCP server health."""
        if not self.connected or not self.client:
            return {"status": "disconnected"}
        
        try:
            response = await self.client.get("/health")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"status": "error", "error": str(e)}

class MCPTestScenarios:
    """Common MCP test scenarios for authentication testing."""
    
    @staticmethod
    async def test_authentication_flow(client: MCPTestClient, email: str, password: str) -> Dict[str, Any]:
        """Test complete authentication flow via MCP."""
        results = {
            "authentication": None,
            "token_validation": None,
            "profile_access": None,
            "session_invalidation": None
        }
        
        # 1. Authenticate user
        auth_result = await client.authenticate_user(email, password)
        results["authentication"] = auth_result
        
        if not auth_result.get("success"):
            return results
        
        session_token = auth_result.get("session_token")
        user_id = auth_result.get("user_id")
        
        # 2. Validate token
        if session_token:
            token_result = await client.validate_token(session_token)
            results["token_validation"] = token_result
            
            # Set token for subsequent requests
            client.set_session_token(session_token)
        
        # 3. Access user profile
        if user_id:
            profile_result = await client.get_user_profile(user_id)
            results["profile_access"] = profile_result
        
        # 4. Invalidate session
        if session_token:
            invalidate_result = await client.invalidate_session(session_token)
            results["session_invalidation"] = invalidate_result
        
        return results
    
    @staticmethod
    async def test_mcp_tools_availability(client: MCPTestClient) -> Dict[str, Any]:
        """Test that required MCP tools are available."""
        required_tools = [
            "authenticate_user",
            "validate_token",
            "create_user",
            "get_user_profile",
            "update_user_profile",
            "invalidate_session",
            "get_user_sessions"
        ]
        
        available_tools = await client.list_tools()
        tool_names = [tool.get("name") for tool in available_tools]
        
        results = {
            "available_tools": tool_names,
            "required_tools": required_tools,
            "missing_tools": [],
            "tool_details": {}
        }
        
        for tool in required_tools:
            if tool not in tool_names:
                results["missing_tools"].append(tool)
            else:
                tool_info = await client.get_tool_info(tool)
                results["tool_details"][tool] = tool_info
        
        results["all_tools_available"] = len(results["missing_tools"]) == 0
        
        return results
    
    @staticmethod
    async def test_error_handling(client: MCPTestClient) -> Dict[str, Any]:
        """Test MCP error handling scenarios."""
        results = {
            "invalid_credentials": None,
            "invalid_token": None,
            "invalid_user_id": None,
            "malformed_request": None
        }
        
        # Test invalid credentials
        invalid_auth = await client.authenticate_user("invalid@example.com", "wrongpassword")
        results["invalid_credentials"] = invalid_auth
        
        # Test invalid token
        invalid_token = await client.validate_token("invalid-token-12345")
        results["invalid_token"] = invalid_token
        
        # Test invalid user ID
        invalid_profile = await client.get_user_profile("invalid-user-id")
        results["invalid_user_id"] = invalid_profile
        
        # Test malformed request (missing parameters)
        try:
            malformed = await client.call_tool("authenticate_user", {})
            results["malformed_request"] = malformed
        except Exception as e:
            results["malformed_request"] = {"error": str(e)}
        
        return results

# Utility functions for MCP testing
async def wait_for_mcp_server(base_url: str = "http://localhost:8002", max_retries: int = 30, delay: float = 1.0) -> bool:
    """Wait for MCP server to be available."""
    client = MCPTestClient(base_url)
    
    for attempt in range(max_retries):
        if await client.connect():
            await client.disconnect()
            return True
        await asyncio.sleep(delay)
    
    return False

async def assert_mcp_tool_response(response: Dict[str, Any], expected_success: bool = True, required_fields: List[str] = None):
    """Assert MCP tool response has expected structure."""
    assert "success" in response, "Response missing 'success' field"
    assert response["success"] == expected_success, f"Expected success={expected_success}, got {response['success']}"
    
    if required_fields:
        for field in required_fields:
            assert field in response, f"Response missing required field: {field}"
    
    if not expected_success:
        assert "error" in response, "Error response missing 'error' field" 