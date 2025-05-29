#!/usr/bin/env python3
"""
Simple verification script to check Story 1.2 test structure
"""
import os
import sys

def main():
    print("🔍 Verifying Story 1.2 Test Structure...")
    
    # Get current working directory
    current_dir = os.getcwd()
    print(f"Current directory: {current_dir}")
    
    # Check if we're in the right place
    expected_suffix = "tests/story-1.2" if "/" in current_dir else "tests\\story-1.2"
    if not current_dir.endswith(expected_suffix):
        print("❌ Not in tests/story-1.2 directory")
        return False
    
    # Check required files and directories
    required_items = [
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
    
    all_good = True
    for item in required_items:
        if os.path.exists(item):
            print(f"✅ {item}")
        else:
            print(f"❌ Missing: {item}")
            all_good = False
    
    # Check MCP servers are outside tests
    project_root = os.path.join(current_dir, "..", "..")
    mcp_servers_path = os.path.join(project_root, "mcp-servers")
    auth_server_path = os.path.join(mcp_servers_path, "auth-server", "server.py")
    
    if os.path.exists(mcp_servers_path):
        print(f"✅ MCP servers directory exists: {mcp_servers_path}")
    else:
        print(f"❌ Missing MCP servers directory: {mcp_servers_path}")
        all_good = False
        
    if os.path.exists(auth_server_path):
        print(f"✅ Auth server exists: {auth_server_path}")
    else:
        print(f"❌ Missing auth server: {auth_server_path}")
        all_good = False
    
    # Check that no MCP servers exist in tests (they should be separate)
    tests_mcp_path = os.path.join(current_dir, "..", "mcp-servers")
    if not os.path.exists(tests_mcp_path):
        print("✅ No MCP servers in tests folder (correct separation)")
    else:
        print("❌ MCP servers found in tests folder (should be in /mcp-servers/)")
        all_good = False
    
    if all_good:
        print("\n🎉 All checks passed! File structure is correct.")
        print("\n📁 Structure Summary:")
        print("   Tests: /tests/story-1.2/ (all test files)")
        print("   MCP Servers: /mcp-servers/ (existing infrastructure)")
        print("   Integration: Tests use existing MCP servers")
        return True
    else:
        print("\n❌ Some checks failed. Please fix the structure.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 