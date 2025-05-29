"""
Integration tests for authentication and MCP agent integration.
Tests the complete flow from authentication events to agent notifications.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import FastAPI
import httpx

from app.models.mcp.user_context import UserContext, AgentPermissionLevel
from app.models.mcp.authentication_event import AuthenticationEvent, AuthenticationEventType
from app.services.mcp.agent_notification_service import AgentNotificationService
from app.api.v1.auth import router as auth_router


class TestAuthMCPIntegration:
    """Integration tests for authentication and MCP agent system."""
    
    @pytest.fixture
    def test_app(self):
        """Create test FastAPI application."""
        app = FastAPI()
        app.include_router(auth_router)
        return app
    
    @pytest.fixture
    def test_client(self, test_app):
        """Create test client."""
        return TestClient(test_app)
    
    @pytest.mark.asyncio
    async def test_complete_authentication_flow(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext,
        mock_event_bus: AsyncMock
    ):
        """Test end-to-end authentication with agent notifications."""
        # Track all HTTP calls made during the flow
        http_calls = []
        
        async def track_http_calls(*args, **kwargs):
            http_calls.append({
                'url': kwargs.get('url', args[0] if args else None),
                'method': 'POST',
                'headers': kwargs.get('headers', {}),
                'json': kwargs.get('json', {})
            })
        
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_response = AsyncMock()
            mock_response.status_code = 200
            mock_response.raise_for_status.return_value = None
            mock_client.post = AsyncMock(side_effect=track_http_calls)
            mock_client_class.return_value = mock_client
            
            # Simulate complete authentication flow
            # 1. User login triggers agent notifications
            await agent_notification_service.notify_user_login(sample_user_context)
            
            # 2. Verify event bus was called
            mock_event_bus.publish_authentication_event.assert_called_once()
            
            # 3. Verify all agents received notifications
            expected_agents = [
                "technical_analysis", "portfolio_optimization",
                "risk_management", "news_analysis", "user_preference"
            ]
            
            assert len(http_calls) == len(expected_agents)
            
            # 4. Verify each agent received proper context
            for call in http_calls:
                assert 'user_context' in call['json']
                assert call['json']['event_type'] == 'user_login'
                assert 'correlation_id' in call['json']
                assert 'X-Correlation-ID' in call['headers']
    
    @pytest.mark.asyncio
    async def test_logout_clears_agent_contexts(
        self,
        agent_notification_service: AgentNotificationService,
        mock_event_bus: AsyncMock
    ):
        """Test logout properly notifies agents to clear contexts."""
        user_id = "test_user_123"
        logout_calls = []
        
        async def track_logout_calls(*args, **kwargs):
            logout_calls.append({
                'json': kwargs.get('json', {}),
                'headers': kwargs.get('headers', {})
            })
        
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_response = AsyncMock()
            mock_response.status_code = 200
            mock_response.raise_for_status.return_value = None
            mock_client.post = AsyncMock(side_effect=track_logout_calls)
            mock_client_class.return_value = mock_client
            
            # Execute logout
            await agent_notification_service.notify_user_logout(user_id)
            
            # Verify event bus was called
            mock_event_bus.publish_authentication_event.assert_called_once()
            
            # Verify all agents received logout notifications
            assert len(logout_calls) == 5  # All 5 agents
            
            # Verify logout event structure
            for call in logout_calls:
                assert call['json']['event_type'] == 'user_logout'
                assert call['json']['user_id'] == user_id
                assert 'correlation_id' in call['json']
    
    @pytest.mark.asyncio
    async def test_preference_update_propagation(
        self,
        agent_notification_service: AgentNotificationService,
        mock_event_bus: AsyncMock
    ):
        """Test user preference changes propagate to relevant agents."""
        user_id = "test_user_123"
        new_preferences = {
            "trading_style": "aggressive",
            "sectors_of_interest": ["technology", "biotech"],
            "notification_settings": {"email_alerts": False}
        }
        
        preference_calls = []
        
        async def track_preference_calls(*args, **kwargs):
            preference_calls.append({
                'json': kwargs.get('json', {}),
                'headers': kwargs.get('headers', {})
            })
        
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_response = AsyncMock()
            mock_response.status_code = 200
            mock_response.raise_for_status.return_value = None
            mock_client.post = AsyncMock(side_effect=track_preference_calls)
            mock_client_class.return_value = mock_client
            
            # Execute preference update
            await agent_notification_service.update_user_preferences(user_id, new_preferences)
            
            # Verify event bus was called
            mock_event_bus.publish_authentication_event.assert_called_once()
            
            # Verify preference-sensitive agents were notified
            expected_agents = ["technical_analysis", "portfolio_optimization", "news_analysis", "user_preference"]
            assert len(preference_calls) == len(expected_agents)
            
            # Verify preference change structure
            for call in preference_calls:
                assert call['json']['event_type'] == 'preference_change'
                assert call['json']['user_id'] == user_id
                # Note: additional_data is part of the auth event, not directly in the JSON payload
    
    @pytest.mark.asyncio
    async def test_agent_permission_enforcement(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext
    ):
        """Test that agents only receive context they have permission for."""
        # Create user context with limited permissions
        limited_context = UserContext(
            user_id="limited_user",
            email="limited@example.com",
            preferences=sample_user_context.preferences,
            portfolio_settings=sample_user_context.portfolio_settings,
            risk_profile=sample_user_context.risk_profile,
            agent_permissions={
                "technical_analysis": AgentPermissionLevel.READ_ONLY,
                "portfolio_optimization": AgentPermissionLevel.RESTRICTED,  # No access
                "risk_management": AgentPermissionLevel.READ_ONLY,
                "news_analysis": AgentPermissionLevel.READ_ONLY,
                "user_preference": AgentPermissionLevel.READ_WRITE
            },
            session_id="limited_session",
            correlation_id="limited_corr"
        )
        
        agent_contexts = {}
        
        async def capture_agent_contexts(*args, **kwargs):
            # Extract agent endpoint from URL to identify agent
            url = kwargs.get('url', '')
            for agent in ['technical_analysis', 'portfolio_optimization', 'risk_management', 'news_analysis', 'user_preference']:
                if agent.replace('_', '') in url or f"800{['technical_analysis', 'portfolio_optimization', 'risk_management', 'news_analysis', 'user_preference'].index(agent) + 3}" in url:
                    agent_contexts[agent] = kwargs.get('json', {}).get('user_context', {})
                    break
        
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_response = AsyncMock()
            mock_response.status_code = 200
            mock_response.raise_for_status.return_value = None
            mock_client.post = AsyncMock(side_effect=capture_agent_contexts)
            mock_client_class.return_value = mock_client
            
            # Execute login with limited permissions
            await agent_notification_service.notify_user_login(limited_context)
            
            # Verify agents with READ_ONLY access received basic context
            for agent in ["technical_analysis", "risk_management", "news_analysis"]:
                if agent in agent_contexts:
                    context = agent_contexts[agent]
                    assert 'user_id' in context
                    assert 'preferences' in context
                    assert 'risk_profile' in context
                    # Should not have admin-level data
                    assert context.get('agent_permission_level') in ['read_only', 'read_write']
            
            # Verify agent with READ_WRITE access received additional context
            if "user_preference" in agent_contexts:
                context = agent_contexts["user_preference"]
                assert 'user_id' in context
                assert 'preferences' in context
                assert 'portfolio_settings' in context
    
    @pytest.mark.asyncio
    async def test_agent_failure_resilience(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext,
        mock_event_bus: AsyncMock
    ):
        """Test system resilience when some agents fail."""
        call_count = 0
        successful_calls = []
        failed_agents = ["portfolio_optimization", "risk_management"]
        
        async def selective_failure(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            
            # Determine which agent this call is for based on URL
            url = kwargs.get('url', '')
            current_agent = None
            for agent in failed_agents:
                if agent.replace('_', '') in url:
                    current_agent = agent
                    break
            
            if current_agent in failed_agents:
                raise httpx.HTTPError(f"Agent {current_agent} is down")
            else:
                successful_calls.append(url)
        
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post = AsyncMock(side_effect=selective_failure)
            mock_client_class.return_value = mock_client
            
            # Execute login - should complete despite some agent failures
            await agent_notification_service.notify_user_login(sample_user_context)
            
            # Verify event bus was still called (primary mechanism)
            mock_event_bus.publish_authentication_event.assert_called_once()
            
            # Verify some agents succeeded despite others failing
            assert len(successful_calls) > 0
            assert call_count == 5  # All agents were attempted
    
    @pytest.mark.asyncio
    async def test_concurrent_user_authentications(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext,
        mock_event_bus: AsyncMock
    ):
        """Test concurrent user authentications don't interfere."""
        concurrent_users = 10
        all_calls = []
        
        async def track_all_calls(*args, **kwargs):
            all_calls.append({
                'user_id': kwargs.get('json', {}).get('user_context', {}).get('user_id'),
                'timestamp': kwargs.get('json', {}).get('timestamp'),
                'correlation_id': kwargs.get('headers', {}).get('X-Correlation-ID')
            })
        
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_response = AsyncMock()
            mock_response.status_code = 200
            mock_response.raise_for_status.return_value = None
            mock_client.post = AsyncMock(side_effect=track_all_calls)
            mock_client_class.return_value = mock_client
            
            # Create multiple user contexts
            user_contexts = []
            for i in range(concurrent_users):
                context = UserContext(
                    user_id=f"concurrent_user_{i}",
                    email=f"user{i}@example.com",
                    preferences=sample_user_context.preferences,
                    portfolio_settings=sample_user_context.portfolio_settings,
                    risk_profile=sample_user_context.risk_profile,
                    agent_permissions=sample_user_context.agent_permissions,
                    session_id=f"session_{i}",
                    correlation_id=f"corr_{i}"
                )
                user_contexts.append(context)
            
            # Execute concurrent logins
            tasks = [
                agent_notification_service.notify_user_login(context)
                for context in user_contexts
            ]
            await asyncio.gather(*tasks)
            
            # Verify all users were processed
            # concurrent_users * 5 agents each = total calls
            expected_calls = concurrent_users * 5
            assert len(all_calls) == expected_calls
            
            # Verify each user's calls have unique correlation IDs
            correlation_ids = [call['correlation_id'] for call in all_calls if call['correlation_id']]
            user_correlation_groups = {}
            for call in all_calls:
                user_id = call['user_id']
                corr_id = call['correlation_id']
                if user_id not in user_correlation_groups:
                    user_correlation_groups[user_id] = set()
                user_correlation_groups[user_id].add(corr_id)
            
            # Each user should have their own correlation ID
            for user_id, corr_ids in user_correlation_groups.items():
                assert len(corr_ids) == 1  # All calls for a user should have same correlation ID
    
    @pytest.mark.asyncio
    async def test_event_bus_integration(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext,
        mock_event_bus: AsyncMock
    ):
        """Test integration with event bus for reliable message delivery."""
        # Configure event bus to track calls
        event_calls = []
        
        def track_event_calls(event):
            event_calls.append({
                'event_type': event.event_type,
                'user_id': event.user_id,
                'correlation_id': event.correlation_id
            })
        
        mock_event_bus.publish_authentication_event.side_effect = track_event_calls
        mock_event_bus.publish_context_update_event.side_effect = track_event_calls
        
        # Execute various operations
        await agent_notification_service.notify_user_login(sample_user_context)
        await agent_notification_service.notify_user_logout(sample_user_context.user_id)
        await agent_notification_service.propagate_user_context(sample_user_context)
        
        # Verify event bus received all events
        assert len(event_calls) == 3
        
        # Verify event types
        event_types = [call['event_type'] for call in event_calls]
        assert AuthenticationEventType.USER_LOGIN in event_types
        assert AuthenticationEventType.USER_LOGOUT in event_types
        assert AuthenticationEventType.CONTEXT_UPDATE in event_types
    
    @pytest.mark.asyncio
    async def test_authentication_latency_with_agents(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext,
        performance_test_data: dict
    ):
        """Test authentication latency remains acceptable with agent notifications."""
        import time
        
        # Mock fast agent responses
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_response = AsyncMock()
            mock_response.status_code = 200
            mock_response.raise_for_status.return_value = None
            
            # Add small delay to simulate real network call
            async def delayed_response(*args, **kwargs):
                await asyncio.sleep(0.01)  # 10ms delay per agent
                return mock_response
            
            mock_client.post = delayed_response
            mock_client_class.return_value = mock_client
            
            # Measure authentication time
            start_time = time.perf_counter()
            await agent_notification_service.notify_user_login(sample_user_context)
            end_time = time.perf_counter()
            
            duration_ms = (end_time - start_time) * 1000
            
            # Verify latency is within acceptable bounds
            target_latency = performance_test_data['target_latency_ms']
            assert duration_ms < target_latency, f"Authentication took {duration_ms}ms, target was {target_latency}ms"


class TestAuthMCPIntegrationErrorScenarios:
    """Test error scenarios in the integrated system."""
    
    @pytest.mark.asyncio
    async def test_partial_agent_ecosystem_failure(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext,
        mock_event_bus: AsyncMock
    ):
        """Test system behavior when part of agent ecosystem fails."""
        # Simulate some agents being completely unreachable
        unreachable_agents = ["portfolio_optimization", "news_analysis"]
        reachable_calls = []
        
        async def selective_connectivity(*args, **kwargs):
            url = kwargs.get('url', '')
            
            # Check if this is an unreachable agent
            for agent in unreachable_agents:
                if agent.replace('_', '') in url:
                    raise httpx.ConnectTimeout("Agent unreachable")
            
            # Reachable agents respond normally
            reachable_calls.append(url)
        
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post = AsyncMock(side_effect=selective_connectivity)
            mock_client_class.return_value = mock_client
            
            # Execute - should complete with partial success
            await agent_notification_service.notify_user_login(sample_user_context)
            
            # Verify event bus was called (ensures fallback mechanism)
            mock_event_bus.publish_authentication_event.assert_called_once()
            
            # Verify some agents were reached
            assert len(reachable_calls) > 0
    
    @pytest.mark.asyncio
    async def test_event_bus_failure_fallback(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext,
        mock_event_bus: AsyncMock
    ):
        """Test behavior when event bus fails but direct notifications work."""
        # Configure event bus to fail
        mock_event_bus.publish_authentication_event.side_effect = Exception("Event bus down")
        
        direct_calls = []
        
        async def track_direct_calls(*args, **kwargs):
            direct_calls.append(kwargs.get('json', {}))
        
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_response = AsyncMock()
            mock_response.status_code = 200
            mock_response.raise_for_status.return_value = None
            mock_client.post = AsyncMock(side_effect=track_direct_calls)
            mock_client_class.return_value = mock_client
            
            # Execute - should complete despite event bus failure
            await agent_notification_service.notify_user_login(sample_user_context)
            
            # Verify direct notifications still worked
            assert len(direct_calls) == 5  # All agents notified directly
    
    @pytest.mark.asyncio
    async def test_authentication_continues_despite_agent_issues(
        self,
        sample_user_context: UserContext
    ):
        """Test that authentication flow continues even if agent system fails completely."""
        # Create service with completely broken dependencies
        broken_registry = MagicMock()
        broken_registry.get_registered_agents.side_effect = Exception("Registry failure")
        
        broken_event_bus = AsyncMock()
        broken_event_bus.publish_authentication_event.side_effect = Exception("Event bus failure")
        
        broken_service = AgentNotificationService(
            agent_registry=broken_registry,
            event_bus=broken_event_bus
        )
        
        # Execute - should not raise exceptions that would block authentication
        try:
            await broken_service.notify_user_login(sample_user_context)
            # If we get here, the service handled the errors gracefully
            success = True
        except Exception:
            # Agent failures should not propagate up to block authentication
            success = False
        
        assert success, "Agent system failures should not block authentication" 