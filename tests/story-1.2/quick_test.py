#!/usr/bin/env python3
"""
Quick test to verify Story 1.2 infrastructure is working
"""
import asyncio
import httpx
from utils.mcp_test_client import MCPTestClient

async def test_mcp_server():
    """Test MCP server connectivity"""
    print("🔍 Testing MCP Server Connectivity...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://localhost:8002/health")
            data = response.json()
            print(f"✅ MCP Server Health: {data['status']}")
            print(f"   Service: {data['service']}")
            print(f"   Test Users Count: {data.get('test_users_count', 'N/A')}")
        except Exception as e:
            print(f"❌ MCP Server Error: {e}")
            return False
    
    # Test MCP authentication
    try:
        client = MCPTestClient("http://localhost:8002")
        await client.connect()
        
        # Test authentication
        auth_result = await client.authenticate_user("testuser@example.com", "Password123!")
        if auth_result.get("success"):
            print(f"✅ MCP Authentication: Success")
            print(f"   User ID: {auth_result.get('user_id')}")
            print(f"   Session Token: {auth_result.get('session_token')[:20]}...")
        else:
            print(f"❌ MCP Authentication Failed: {auth_result}")
            
        await client.disconnect()
        
    except Exception as e:
        print(f"❌ MCP Client Error: {e}")
        return False
    
    return True

async def test_http_server():
    """Test HTTP test server"""
    print("\n🔍 Testing HTTP Test Server...")
    
    from fixtures.test_auth_server import TestAuthServerForMCPIntegration
    
    server = TestAuthServerForMCPIntegration(port=8001)  # Different port to avoid conflict
    
    try:
        await server.start()
        print("✅ HTTP Test Server Started")
        
        async with httpx.AsyncClient() as client:
            # Test health endpoint
            response = await client.get("http://localhost:8001/health")
            data = response.json()
            print(f"✅ HTTP Server Health: {data['status']}")
            
            # Test login endpoint
            response = await client.post("http://localhost:8001/api/v1/auth/login", json={
                "email": "testuser@example.com", 
                "password": "Password123!"
            })
            
            if response.status_code == 200:
                print("✅ HTTP Login Test: Success")
                data = response.json()
                print(f"   User Email: {data['user']['email']}")
            else:
                print(f"❌ HTTP Login Test Failed: {response.status_code}")
                
    except Exception as e:
        print(f"❌ HTTP Server Error: {e}")
        return False
    finally:
        await server.stop()
    
    return True

def test_file_structure():
    """Test file structure compliance"""
    print("\n🔍 Testing File Structure...")
    
    import os
    
    required_files = [
        "conftest.py",
        "test_setup_verification.py", 
        "fixtures/test_auth_server.py",
        "fixtures/test_users.py",
        "utils/mcp_test_client.py",
        "mcp/test_auth_mcp_server.py"
    ]
    
    all_good = True
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ Missing: {file}")
            all_good = False
    
    return all_good

async def main():
    """Run all quick tests"""
    print("🚀 Story 1.2 Infrastructure Quick Test\n")
    
    # Test file structure first
    file_ok = test_file_structure()
    
    # Test MCP server
    mcp_ok = await test_mcp_server()
    
    # Test HTTP server
    http_ok = await test_http_server()
    
    print("\n📊 Test Results:")
    print(f"   File Structure: {'✅ PASS' if file_ok else '❌ FAIL'}")
    print(f"   MCP Server: {'✅ PASS' if mcp_ok else '❌ FAIL'}")
    print(f"   HTTP Server: {'✅ PASS' if http_ok else '❌ FAIL'}")
    
    if all([file_ok, mcp_ok, http_ok]):
        print("\n🎉 All tests passed! Infrastructure is ready for testing.")
        return True
    else:
        print("\n❌ Some tests failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1) 