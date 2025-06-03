"""
MCP (Model Context Protocol) Client Implementation
For connecting to MCP servers in StockPulse infrastructure
"""

import asyncio
import json
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import httpx
import logging
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class MCPRequest(BaseModel):
    """MCP request format."""
    jsonrpc: str = "2.0"
    id: str
    method: str
    params: Dict[str, Any] = Field(default_factory=dict)

class MCPResponse(BaseModel):
    """MCP response format."""
    jsonrpc: str = "2.0"
    id: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None

class MCPTool(BaseModel):
    """MCP tool definition."""
    name: str
    description: str
    parameters: Dict[str, Any]
    required: List[str] = Field(default_factory=list)

class MCPResource(BaseModel):
    """MCP resource definition."""
    uri: str
    name: str
    description: str
    mime_type: Optional[str] = None

class MCPError(Exception):
    """MCP protocol error."""
    def __init__(self, code: int, message: str, data: Optional[Dict[str, Any]] = None):
        self.code = code
        self.message = message
        self.data = data or {}
        super().__init__(f"MCP Error {code}: {message}")


class MCPClient:
    """MCP client for connecting to MCP servers."""
    
    def __init__(self, server_url: str, timeout: float = 30.0):
        self.server_url = server_url.rstrip('/')
        self.timeout = timeout
        self.client: Optional[httpx.AsyncClient] = None
        self.tools: Dict[str, MCPTool] = {}
        self.resources: Dict[str, MCPResource] = {}
        self.connected = False
    
    async def connect(self) -> bool:
        """Connect to MCP server and initialize capabilities."""
        try:
            self.client = httpx.AsyncClient(timeout=self.timeout)
            
            # Initialize connection
            init_response = await self._send_request("initialize", {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {"listChanged": True},
                    "resources": {"listChanged": True, "subscribe": True}
                },
                "clientInfo": {
                    "name": "stockpulse-agent",
                    "version": "1.0.0"
                }
            })
            
            if not init_response.get("success", False):
                logger.warning("MCP initialization returned no success flag, continuing anyway")
            
            # List available tools
            try:
                tools_response = await self._send_request("tools/list", {})
                if tools_response.get("tools"):
                    for tool_data in tools_response["tools"]:
                        tool = MCPTool(**tool_data)
                        self.tools[tool.name] = tool
            except Exception as e:
                logger.warning(f"Could not list tools: {e}")
            
            # List available resources
            try:
                resources_response = await self._send_request("resources/list", {})
                if resources_response.get("resources"):
                    for resource_data in resources_response["resources"]:
                        resource = MCPResource(**resource_data)
                        self.resources[resource.uri] = resource
            except Exception as e:
                logger.warning(f"Could not list resources: {e}")
            
            self.connected = True
            logger.info(f"Connected to MCP server: {self.server_url}")
            logger.info(f"Available tools: {list(self.tools.keys())}")
            logger.info(f"Available resources: {list(self.resources.keys())}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to MCP server {self.server_url}: {e}")
            self.connected = False
            # Return False but don't raise - allow graceful degradation
            return False
    
    async def disconnect(self):
        """Disconnect from MCP server."""
        if self.client:
            await self.client.aclose()
            self.client = None
        self.connected = False
        logger.info(f"Disconnected from MCP server: {self.server_url}")
    
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call an MCP tool with fallback to mock data."""
        if not self.connected:
            logger.warning(f"Not connected to MCP server, using fallback for {tool_name}")
            return self._get_fallback_data(tool_name, arguments)
        
        if tool_name not in self.tools:
            logger.warning(f"Tool not found: {tool_name}, using fallback")
            return self._get_fallback_data(tool_name, arguments)
        
        try:
            response = await self._send_request("tools/call", {
                "name": tool_name,
                "arguments": arguments
            })
            
            if "error" in response:
                error = response["error"]
                logger.error(f"MCP tool error: {error}")
                return self._get_fallback_data(tool_name, arguments)
            
            return response.get("content", {})
            
        except Exception as e:
            logger.error(f"Tool call error for {tool_name}: {e}")
            return self._get_fallback_data(tool_name, arguments)
    
    def _get_fallback_data(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Return fallback mock data when MCP is unavailable."""
        if "market_data" in tool_name:
            symbols = arguments.get("symbols", ["AAPL", "GOOGL"])
            return {
                "results": [
                    {"symbol": symbol, "price": 150.0 + hash(symbol) % 100, "change": (hash(symbol) % 10) - 5}
                    for symbol in symbols[:5]
                ]
            }
        elif "knowledge_graph" in tool_name or "sentiment" in tool_name:
            return {
                "results": [
                    {"content": "Market sentiment analysis based on recent news and social media", "confidence": 0.8}
                ]
            }
        elif "search" in tool_name:
            return {
                "results": [
                    {"title": "Market Update", "content": "Latest market analysis and trends", "score": 0.9}
                ]
            }
        else:
            return {"results": [], "message": f"Fallback response for {tool_name}"}
    
    async def _send_request(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Send MCP request to server."""
        if not self.client:
            raise MCPError(-32002, "Client not initialized")
        
        request = MCPRequest(
            id=str(datetime.utcnow().timestamp()),
            method=method,
            params=params
        )
        
        try:
            response = await self.client.post(
                f"{self.server_url}/mcp",
                json=request.dict(),
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "StockPulse-MCP-Client/1.0.0"
                }
            )
            
            if response.status_code != 200:
                raise MCPError(
                    -32603,
                    f"HTTP {response.status_code}: {response.text}"
                )
            
            result = response.json()
            
            if "error" in result:
                error = result["error"]
                raise MCPError(
                    error.get("code", -32603),
                    error.get("message", "Unknown error"),
                    error.get("data")
                )
            
            return result.get("result", {})
            
        except httpx.TimeoutException:
            raise MCPError(-32002, f"Request timeout to {self.server_url}")
        except httpx.RequestError as e:
            raise MCPError(-32002, f"Connection error: {str(e)}")
        except json.JSONDecodeError as e:
            raise MCPError(-32700, f"Invalid JSON response: {str(e)}") 