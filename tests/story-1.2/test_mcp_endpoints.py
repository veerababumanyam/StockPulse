#!/usr/bin/env python3
"""
Test MCP server endpoints directly
"""
import asyncio
import httpx

async def test_mcp_endpoints():
    async with httpx.AsyncClient() as client:
        print("Testing MCP Server endpoints...")
        
        # Test health
        response = await client.get("http://localhost:8002/health")
        print(f"Health: {response.status_code} - {response.json()}")
        
        # Test root
        response = await client.get("http://localhost:8002/")
        print(f"Root: {response.status_code} - {response.json()}")
        
        # Test tools list
        response = await client.get("http://localhost:8002/tools/list")
        print(f"Tools list: {response.status_code} - {response.json()}")
        
        # Test authentication via POST to tools/call
        auth_data = {
            "tool": "authenticate_user",
            "parameters": {
                "email": "testuser@example.com",
                "password": "Password123!"
            }
        }
        response = await client.post("http://localhost:8002/tools/call", json=auth_data)
        print(f"Auth call: {response.status_code} - {response.json()}")

if __name__ == "__main__":
    asyncio.run(test_mcp_endpoints()) 