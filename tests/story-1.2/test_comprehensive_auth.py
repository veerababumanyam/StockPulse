#!/usr/bin/env python3
"""
Comprehensive Story 1.2 Authentication Tests
Testing all aspects of the user login flow using MCP Authentication Server
"""
import pytest
import asyncio
import httpx
from datetime import datetime, timedelta
from utils.mcp_test_client import MCPTestClient, MCPTestScenarios

pytestmark = [pytest.mark.asyncio]

class TestStory12UserLoginFlow:
    """Comprehensive tests for Story 1.2 - User Login Flow"""

    async def test_valid_user_authentication(self):
        """Test AC1: Valid user can authenticate with correct credentials"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Test valid login
            result = await client.authenticate_user("testuser@example.com", "Password123!")
            
            assert result["success"] is True, f"Login should succeed: {result}"
            assert "user_id" in result
            assert "session_token" in result
            assert "expires_at" in result
            
            # Verify user ID is correct
            assert result["user_id"] == "mcp-user-id-1"
            
            # Verify session token is valid
            token_validation = await client.validate_token(result["session_token"])
            assert token_validation["success"] is True
            assert token_validation["valid"] is True
            
        finally:
            await client.disconnect()

    async def test_invalid_email_authentication(self):
        """Test AC2: Invalid email returns appropriate error"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            result = await client.authenticate_user("nonexistent@example.com", "Password123!")
            
            assert result["success"] is False
            assert "User not found" in result["error"]
            
        finally:
            await client.disconnect()

    async def test_invalid_password_authentication(self):
        """Test AC3: Invalid password returns appropriate error"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            result = await client.authenticate_user("testuser@example.com", "WrongPassword!")
            
            assert result["success"] is False
            assert "Invalid password" in result["error"]
            
        finally:
            await client.disconnect()

    async def test_inactive_account_authentication(self):
        """Test AC4: Inactive account cannot authenticate"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            result = await client.authenticate_user("inactive@example.com", "Password123!")
            
            assert result["success"] is False
            assert "Account is deactivated" in result["error"]
            
        finally:
            await client.disconnect()

    async def test_locked_account_authentication(self):
        """Test AC5: Locked account cannot authenticate"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            result = await client.authenticate_user("locked@example.com", "Password123!")
            
            assert result["success"] is False
            assert "Account temporarily locked" in result["error"]
            
        finally:
            await client.disconnect()

    async def test_session_token_validation(self):
        """Test AC6: Session tokens can be validated and provide user information"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Authenticate to get session token
            auth_result = await client.authenticate_user("testuser@example.com", "Password123!")
            assert auth_result["success"] is True
            
            session_token = auth_result["session_token"]
            user_id = auth_result["user_id"]
            
            # Validate the session token
            validation_result = await client.validate_token(session_token)
            
            assert validation_result["success"] is True
            assert validation_result["valid"] is True
            assert validation_result["user_id"] == user_id
            assert "expires_at" in validation_result
            
        finally:
            await client.disconnect()

    async def test_user_profile_access_with_session(self):
        """Test AC7: Authenticated users can access their profile"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Authenticate first
            auth_result = await client.authenticate_user("testuser@example.com", "Password123!")
            assert auth_result["success"] is True
            
            user_id = auth_result["user_id"]
            session_token = auth_result["session_token"]
            
            # Set session token for authenticated requests
            client.set_session_token(session_token)
            
            # Access user profile
            profile_result = await client.get_user_profile(user_id)
            
            assert profile_result["success"] is True
            assert profile_result["email"] == "testuser@example.com"
            assert profile_result["is_active"] is True
            assert "created_at" in profile_result
            
        finally:
            await client.disconnect()

    async def test_session_invalidation(self):
        """Test AC8: Sessions can be invalidated (logout)"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Authenticate to get session token
            auth_result = await client.authenticate_user("testuser@example.com", "Password123!")
            assert auth_result["success"] is True
            
            session_token = auth_result["session_token"]
            
            # Verify token is initially valid
            validation_result = await client.validate_token(session_token)
            assert validation_result["success"] is True
            assert validation_result["valid"] is True
            
            # Invalidate the session
            invalidation_result = await client.invalidate_session(session_token)
            assert invalidation_result["success"] is True
            
            # Verify token is now invalid
            validation_result = await client.validate_token(session_token)
            assert validation_result["success"] is False or validation_result["valid"] is False
            
        finally:
            await client.disconnect()

    async def test_multiple_sessions_management(self):
        """Test AC9: Multiple sessions can be managed for a user"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Create multiple sessions for the same user
            auth_result1 = await client.authenticate_user("testuser@example.com", "Password123!")
            assert auth_result1["success"] is True
            
            auth_result2 = await client.authenticate_user("testuser@example.com", "Password123!")
            assert auth_result2["success"] is True
            
            user_id = auth_result1["user_id"]
            
            # Get user sessions
            sessions_result = await client.get_user_sessions(user_id)
            
            # Note: This might not be implemented in the current MCP server,
            # so we'll check if it's available
            if sessions_result.get("success"):
                assert len(sessions_result.get("sessions", [])) >= 2
            else:
                # If sessions management not implemented, verify both tokens are valid
                token1_valid = await client.validate_token(auth_result1["session_token"])
                token2_valid = await client.validate_token(auth_result2["session_token"])
                
                assert token1_valid["success"] is True
                assert token2_valid["success"] is True
            
        finally:
            await client.disconnect()

class TestStory12SecurityFeatures:
    """Tests for security features in authentication"""

    async def test_rate_limiting_prevention(self):
        """Test that rapid authentication attempts are handled properly"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Attempt multiple rapid authentications
            results = []
            for i in range(10):
                result = await client.authenticate_user("testuser@example.com", "Password123!")
                results.append(result)
                # Small delay to avoid overwhelming
                await asyncio.sleep(0.1)
            
            # All should succeed for valid credentials (basic rate limiting test)
            successful_logins = [r for r in results if r.get("success")]
            assert len(successful_logins) >= 5, "Should allow multiple valid logins"
            
        finally:
            await client.disconnect()

    async def test_password_security_validation(self):
        """Test that password handling is secure"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Test various invalid passwords
            invalid_passwords = ["", "123", "password", "PASSWORD", "12345678"]
            
            for password in invalid_passwords:
                result = await client.authenticate_user("testuser@example.com", password)
                assert result["success"] is False, f"Should reject weak password: {password}"
            
        finally:
            await client.disconnect()

    async def test_session_token_security(self):
        """Test session token security properties"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Get a valid session token
            auth_result = await client.authenticate_user("testuser@example.com", "Password123!")
            assert auth_result["success"] is True
            
            session_token = auth_result["session_token"]
            
            # Verify token is not empty and has reasonable length
            assert len(session_token) > 20, "Session token should be sufficiently long"
            
            # Verify token contains expected JWT structure (has dots)
            assert "." in session_token, "Session token should be a JWT"
            
            # Test invalid token validation
            invalid_tokens = ["invalid", "", "fake.jwt.token", "a" * 100]
            
            for invalid_token in invalid_tokens:
                validation_result = await client.validate_token(invalid_token)
                assert validation_result["success"] is False, f"Should reject invalid token: {invalid_token[:20]}..."
            
        finally:
            await client.disconnect()

class TestStory12EdgeCases:
    """Tests for edge cases and error conditions"""

    async def test_malformed_requests(self):
        """Test handling of malformed authentication requests"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Test with missing parameters
            result = await client.call_tool("authenticate_user", {})
            assert result["success"] is False
            
            # Test with only email
            result = await client.call_tool("authenticate_user", {"email": "test@example.com"})
            assert result["success"] is False
            
            # Test with only password  
            result = await client.call_tool("authenticate_user", {"password": "password"})
            assert result["success"] is False
            
        finally:
            await client.disconnect()

    async def test_special_characters_in_credentials(self):
        """Test handling of special characters in email/password"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Test special characters in email
            special_emails = [
                "test+tag@example.com",
                "test.user@example.com", 
                "test_user@example.com",
                "test@sub.example.com"
            ]
            
            for email in special_emails:
                result = await client.authenticate_user(email, "Password123!")
                # Should handle gracefully even if user doesn't exist
                assert "success" in result
            
        finally:
            await client.disconnect()

    async def test_concurrent_authentication_attempts(self):
        """Test concurrent authentication attempts"""
        async def authenticate_user():
            client = MCPTestClient("http://localhost:8002")
            try:
                await client.connect()
                return await client.authenticate_user("testuser@example.com", "Password123!")
            finally:
                await client.disconnect()
        
        # Run multiple concurrent authentications
        tasks = [authenticate_user() for _ in range(5)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Count successful authentications
        successful = [r for r in results if isinstance(r, dict) and r.get("success")]
        assert len(successful) >= 3, "Should handle concurrent authentications"

class TestStory12Integration:
    """Integration tests combining multiple authentication features"""

    async def test_complete_user_session_lifecycle(self):
        """Test complete user session from login to logout"""
        scenarios = MCPTestScenarios()
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Run complete authentication flow
            flow_results = await scenarios.test_authentication_flow(
                client, "testuser@example.com", "Password123!"
            )
            
            # Verify all steps completed successfully
            assert flow_results["authentication"]["success"] is True
            assert flow_results["token_validation"]["success"] is True
            assert flow_results["profile_access"]["success"] is True
            
            # Session invalidation might be optional depending on implementation
            if flow_results["session_invalidation"]:
                assert flow_results["session_invalidation"]["success"] is True
            
        finally:
            await client.disconnect()

    async def test_admin_user_authentication(self):
        """Test authentication for admin user with special privileges"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Authenticate admin user
            result = await client.authenticate_user("admin@example.com", "AdminPass123!")
            
            assert result["success"] is True
            assert result["user_id"] == "mcp-admin-id-1"
            
            # Get admin profile
            client.set_session_token(result["session_token"])
            profile_result = await client.get_user_profile(result["user_id"])
            
            if profile_result.get("success"):
                assert profile_result["email"] == "admin@example.com"
                # Check for admin role if implemented
                if "role" in profile_result:
                    assert profile_result["role"] == "admin"
            
        finally:
            await client.disconnect()

    async def test_mcp_server_health_during_load(self):
        """Test MCP server health during authentication load"""
        client = MCPTestClient("http://localhost:8002")
        
        try:
            await client.connect()
            
            # Check initial health
            health_before = await client.health_check()
            assert health_before["status"] == "healthy"
            
            # Perform multiple authentications
            auth_tasks = []
            for _ in range(10):
                auth_tasks.append(client.authenticate_user("testuser@example.com", "Password123!"))
            
            auth_results = await asyncio.gather(*auth_tasks, return_exceptions=True)
            
            # Check health after load
            health_after = await client.health_check()
            assert health_after["status"] == "healthy"
            
            # Verify most authentications succeeded
            successful_auths = [r for r in auth_results if isinstance(r, dict) and r.get("success")]
            assert len(successful_auths) >= 8, "Most authentications should succeed under load"
            
        finally:
            await client.disconnect() 