#!/usr/bin/env python3
"""Check what endpoints are actually available on the MCP auth server"""
import asyncio
import httpx

async def check_endpoints():
    async with httpx.AsyncClient() as client:
        endpoints_to_test = [
            "/",
            "/health", 
            "/docs",
            "/openapi.json",
            "/tools/list",
            "/tools/call",
            "/mcp/tools/list",
            "/api/tools/list",
            "/v1/tools/list"
        ]
        
        print("🔍 Testing MCP Auth Server endpoints on port 8002...")
        print("=" * 60)
        
        for endpoint in endpoints_to_test:
            try:
                response = await client.get(f"http://localhost:8002{endpoint}")
                print(f"✅ {endpoint:<20} -> {response.status_code}")
                if response.status_code == 200:
                    try:
                        data = response.json()
                        if isinstance(data, dict) and len(str(data)) < 300:
                            print(f"   Data: {data}")
                        elif isinstance(data, list):
                            print(f"   Items: {len(data)}")
                        else:
                            print(f"   Size: {len(str(data))} chars")
                    except:
                        print(f"   Text: {response.text[:100]}...")
            except Exception as e:
                print(f"❌ {endpoint:<20} -> Error: {e}")
        
        print("\n🔍 Testing POST to tools endpoints...")
        post_endpoints = ["/tools/call", "/mcp/tools/call", "/api/tools/call"]
        test_payload = {
            "tool": "authenticate_user",
            "parameters": {"email": "test@example.com", "password": "test123"}
        }
        
        for endpoint in post_endpoints:
            try:
                response = await client.post(f"http://localhost:8002{endpoint}", json=test_payload)
                print(f"✅ POST {endpoint:<15} -> {response.status_code}")
                if response.status_code != 404:
                    try:
                        data = response.json()
                        print(f"   Response: {data}")
                    except:
                        print(f"   Text: {response.text[:100]}...")
            except Exception as e:
                print(f"❌ POST {endpoint:<15} -> Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_endpoints()) 