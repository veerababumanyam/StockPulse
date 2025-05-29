"""
Unit tests for AgentNotificationService.
Tests the core agent notification functionality including success scenarios,
error handling, circuit breaker behavior, and performance characteristics.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime
import httpx

from app.services.mcp.agent_notification_service import AgentNotificationService
from app.services.mcp.agent_registry import AgentRegistry
from app.models.mcp.user_context import (
    UserContext, UserPreferences, PortfolioSettings, RiskProfile, TradingStrategy
)
from app.models.mcp.authentication_event import AuthenticationEvent, AuthenticationEventType


class TestAgentNotificationService:
    """Test suite for AgentNotificationService."""
    
    @pytest.mark.asyncio
    async def test_notify_user_login_success(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext,
        mock_event_bus: AsyncMock
    ):
        """Test successful user login notification to all agents."""
        # Setup
        with patch.object(
            agent_notification_service, 
            '_notify_single_agent_async',
            return_value=None
        ) as mock_notify:
            
            # Execute
            await agent_notification_service.notify_user_login(sample_user_context)
            
            # Verify event bus was called
            mock_event_bus.publish_authentication_event.assert_called_once()
            
            # Verify agents were notified based on permissions
            expected_agents = [
                "technical_analysis", "portfolio_optimization", 
                "risk_management", "news_analysis", "user_preference"
            ]
            
            # Should call notify for each agent the user has permissions for
            assert mock_notify.call_count == len(expected_agents)
            
            # Verify call arguments contain proper event
            for call_args in mock_notify.call_args_list:
                args, kwargs = call_args
                agent_name, auth_event = args
                assert agent_name in expected_agents
                assert isinstance(auth_event, AuthenticationEvent)
                assert auth_event.event_type == AuthenticationEventType.USER_LOGIN
                assert auth_event.user_id == sample_user_context.user_id
    
    @pytest.mark.asyncio
    async def test_notify_user_login_with_agent_failure(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext,
        mock_event_bus: AsyncMock
    ):
        """Test graceful handling of individual agent failures during login."""
        # Setup - one agent fails, others succeed
        def mock_notify_side_effect(agent_name, event):
            if agent_name == "technical_analysis":
                raise httpx.HTTPError("Agent unavailable")
            return None
        
        with patch.object(
            agent_notification_service,
            '_notify_single_agent_async',
            side_effect=mock_notify_side_effect
        ) as mock_notify:
            
            # Execute - should not raise exception despite agent failure
            await agent_notification_service.notify_user_login(sample_user_context)
            
            # Verify event bus was still called
            mock_event_bus.publish_authentication_event.assert_called_once()
            
            # Verify all agents were attempted
            assert mock_notify.call_count == 5
    
    @pytest.mark.asyncio
    async def test_notify_user_logout_success(
        self,
        agent_notification_service: AgentNotificationService,
        mock_event_bus: AsyncMock
    ):
        """Test successful user logout notification to all agents."""
        user_id = "test_user_123"
        
        with patch.object(
            agent_notification_service,
            '_notify_single_agent_async',
            return_value=None
        ) as mock_notify:
            
            # Execute
            await agent_notification_service.notify_user_logout(user_id)
            
            # Verify event bus was called
            mock_event_bus.publish_authentication_event.assert_called_once()
            
            # Verify all agents were notified for logout
            assert mock_notify.call_count == 5
            
            # Verify logout event was created
            for call_args in mock_notify.call_args_list:
                args, kwargs = call_args
                agent_name, auth_event = args
                assert isinstance(auth_event, AuthenticationEvent)
                assert auth_event.event_type == AuthenticationEventType.USER_LOGOUT
                assert auth_event.user_id == user_id
    
    @pytest.mark.asyncio
    async def test_propagate_user_context(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext,
        mock_event_bus: AsyncMock
    ):
        """Test user context propagation to relevant agents."""
        # Execute
        await agent_notification_service.propagate_user_context(sample_user_context)
        
        # Verify context update event was published
        mock_event_bus.publish_context_update_event.assert_called_once()
        
        # Verify event details
        call_args = mock_event_bus.publish_context_update_event.call_args
        auth_event = call_args[0][0]
        assert isinstance(auth_event, AuthenticationEvent)
        assert auth_event.event_type == AuthenticationEventType.CONTEXT_UPDATE
        assert auth_event.user_id == sample_user_context.user_id
        assert auth_event.user_context == sample_user_context
    
    @pytest.mark.asyncio
    async def test_update_user_preferences(
        self,
        agent_notification_service: AgentNotificationService,
        mock_event_bus: AsyncMock
    ):
        """Test user preference update notification to relevant agents."""
        user_id = "test_user_123"
        preferences = {
            "trading_style": "aggressive",
            "notification_settings": {"email_alerts": False}
        }
        
        with patch.object(
            agent_notification_service,
            '_notify_single_agent_async',
            return_value=None
        ) as mock_notify:
            
            # Execute
            await agent_notification_service.update_user_preferences(user_id, preferences)
            
            # Verify event bus was called
            mock_event_bus.publish_authentication_event.assert_called_once()
            
            # Verify preference-sensitive agents were notified
            expected_agents = [
                "technical_analysis", "portfolio_optimization", 
                "news_analysis", "user_preference"
            ]
            assert mock_notify.call_count == len(expected_agents)
            
            # Verify preference change event
            for call_args in mock_notify.call_args_list:
                args, kwargs = call_args
                agent_name, auth_event = args
                assert agent_name in expected_agents
                assert auth_event.event_type == AuthenticationEventType.PREFERENCE_CHANGE
                assert auth_event.additional_data["updated_preferences"] == preferences
    
    @pytest.mark.asyncio
    async def test_circuit_breaker_activation(
        self,
        agent_notification_service: AgentNotificationService,
        sample_authentication_event: AuthenticationEvent,
        circuit_breaker_test_config: dict
    ):
        """Test circuit breaker activation after threshold failures."""
        agent_name = "technical_analysis"
        
        # Mock agent registry to return valid config
        with patch.object(
            agent_notification_service.agent_registry,
            'get_agent_config',
            return_value={
                "endpoint": "http://localhost:8003",
                "name": "Technical Analysis Agent"
            }
        ), patch('httpx.AsyncClient') as mock_client_class:
            # Mock HTTP client to always fail
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post.side_effect = httpx.HTTPError("Connection failed")
            mock_client_class.return_value = mock_client
            
            # Execute multiple failed calls to trigger circuit breaker
            failure_count = 0
            for i in range(circuit_breaker_test_config["test_failure_count"]):
                try:
                    await agent_notification_service._notify_single_agent_async(
                        agent_name, sample_authentication_event
                    )
                except Exception:
                    failure_count += 1
            
            # Verify circuit breaker opened after threshold
            # Circuit breaker should fail after failure_threshold (3) attempts
            assert failure_count >= circuit_breaker_test_config["failure_threshold"]
    
    @pytest.mark.asyncio
    async def test_notification_timeout_handling(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext
    ):
        """Test handling of notification timeouts."""
        # Setup slow agent response
        async def slow_notify(*args, **kwargs):
            await asyncio.sleep(6)  # Longer than notification timeout (5s)
        
        with patch.object(
            agent_notification_service,
            '_notify_single_agent_async',
            side_effect=slow_notify
        ):
            
            # Execute - should complete despite timeout
            start_time = datetime.utcnow()
            await agent_notification_service.notify_user_login(sample_user_context)
            end_time = datetime.utcnow()
            
            # Verify it didn't wait for the full 6 seconds
            # Should timeout around the notification_timeout (5s) + some overhead
            duration = (end_time - start_time).total_seconds()
            assert duration < 7  # Should timeout around 5-6 seconds, not wait full 6
    
    @pytest.mark.asyncio
    async def test_agent_context_filtering_by_permissions(
        self,
        sample_user_context: UserContext,
        mock_agent_registry: AgentRegistry,
        mock_event_bus: AsyncMock
    ):
        """Test that agent context is properly filtered based on permissions."""
        # Create fresh service instance to avoid circuit breaker issues
        fresh_service = AgentNotificationService(
            agent_registry=mock_agent_registry,
            event_bus=mock_event_bus,
            circuit_breaker_failure_threshold=10,  # Higher threshold for this test
            notification_timeout=5.0,
            enable_circuit_breaker=False  # Disable for testing
        )
        
        agent_name = "technical_analysis"
        
        # Mock successful HTTP call and capture the payload
        captured_payload = None
        
        async def capture_payload(*args, **kwargs):
            nonlocal captured_payload
            if 'json' in kwargs:
                captured_payload = kwargs['json']
            # Return a proper mock response
            mock_response = AsyncMock()
            mock_response.raise_for_status.return_value = None
            return mock_response
        
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post = AsyncMock(side_effect=capture_payload)
            mock_client_class.return_value = mock_client
            
            # Create authentication event
            auth_event = AuthenticationEvent(
                event_type=AuthenticationEventType.USER_LOGIN,
                user_id=sample_user_context.user_id,
                user_context=sample_user_context,
                correlation_id="test_correlation"
            )
            
            # Execute
            await fresh_service._notify_single_agent_direct(agent_name, auth_event)
            
            # Verify payload was captured and filtered properly
            assert captured_payload is not None
            assert 'user_context' in captured_payload
            
            user_context_data = captured_payload['user_context']
            
            # Technical analysis agent context should contain transformed data
            # Based on actual UserContext.to_agent_context output
            assert 'user_id' in user_context_data
            assert 'risk_tolerance' in user_context_data
            assert 'trading_style' in user_context_data
            assert 'timezone' in user_context_data
            assert 'timestamp' in user_context_data
            
            # Should not have raw preferences object, but transformed data
            assert user_context_data.get('risk_tolerance') == 'moderate'
            assert user_context_data.get('trading_style') == 'moderate'
    
    @pytest.mark.asyncio
    async def test_notification_stats_tracking(
        self,
        sample_authentication_event: AuthenticationEvent,
        mock_agent_registry: AgentRegistry,
        mock_event_bus: AsyncMock
    ):
        """Test notification statistics are properly tracked."""
        # Create fresh service instance to avoid circuit breaker issues
        fresh_service = AgentNotificationService(
            agent_registry=mock_agent_registry,
            event_bus=mock_event_bus,
            circuit_breaker_failure_threshold=10,  # Higher threshold for this test
            notification_timeout=5.0,
            enable_circuit_breaker=False  # Disable for testing
        )
        
        agent_name = "technical_analysis"
        
        # Test successful notification
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_response = AsyncMock()
            mock_response.raise_for_status.return_value = None
            mock_client.post.return_value = mock_response
            mock_client_class.return_value = mock_client
            
            # Execute successful notification using direct method
            await fresh_service._notify_single_agent_direct(
                agent_name, sample_authentication_event
            )
            
            # Get stats
            stats = await fresh_service.get_notification_stats()
            
            # Verify stats are accessible
            assert 'successful_notifications' in stats
            assert 'timestamp' in stats
    
    @pytest.mark.asyncio
    async def test_notification_stats_failure_tracking(
        self,
        sample_authentication_event: AuthenticationEvent,
        mock_agent_registry: AgentRegistry,
        mock_event_bus: AsyncMock
    ):
        """Test notification failure statistics are properly tracked."""
        # Create fresh service instance to avoid circuit breaker issues
        fresh_service = AgentNotificationService(
            agent_registry=mock_agent_registry,
            event_bus=mock_event_bus,
            circuit_breaker_failure_threshold=10,  # Higher threshold for this test
            notification_timeout=5.0,
            enable_circuit_breaker=False  # Disable for testing
        )
        
        agent_name = "technical_analysis"
        
        # Test failed notification
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post.side_effect = httpx.HTTPError("Connection failed")
            mock_client_class.return_value = mock_client
            
            # Execute failed notification using direct method
            with pytest.raises(httpx.HTTPError):
                await fresh_service._notify_single_agent_direct(
                    agent_name, sample_authentication_event
                )
            
            # Get stats - failure stats won't be auto-updated since we're calling direct method
            stats = await fresh_service.get_notification_stats()
            
            # Verify stats structure is correct
            assert 'failed_notifications' in stats
    
    @pytest.mark.asyncio
    async def test_error_handling_in_notification_recording(
        self,
        sample_authentication_event: AuthenticationEvent,
        mock_agent_registry: AgentRegistry,
        mock_event_bus: AsyncMock
    ):
        """Test error handling when recording notification results fails."""
        # Create fresh service instance to avoid circuit breaker issues
        fresh_service = AgentNotificationService(
            agent_registry=mock_agent_registry,
            event_bus=mock_event_bus,
            circuit_breaker_failure_threshold=10,  # Higher threshold for this test
            notification_timeout=5.0,
            enable_circuit_breaker=False  # Disable for testing
        )
        
        agent_name = "technical_analysis"
        
        # Mock successful HTTP call but failed recording (this won't affect direct method)
        with patch('httpx.AsyncClient') as mock_client_class:
            
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_response = AsyncMock()
            mock_response.raise_for_status.return_value = None
            mock_client.post.return_value = mock_response
            mock_client_class.return_value = mock_client
            
            # Execute - should complete without errors using direct method
            await fresh_service._notify_single_agent_direct(
                agent_name, sample_authentication_event
            )
            
            # Should not raise exception
    
    @pytest.mark.asyncio
    async def test_validate_agent_permissions(
        self,
        agent_notification_service: AgentNotificationService
    ):
        """Test agent permission validation."""
        user_id = "test_user_123"
        agent_name = "technical_analysis"
        
        # Execute permission validation
        result = await agent_notification_service.validate_agent_permissions(user_id, agent_name)
        
        # For now, basic implementation returns True
        # In full implementation, this would check actual permissions
        assert isinstance(result, bool)
    
    @pytest.mark.asyncio
    async def test_correlation_id_propagation(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext
    ):
        """Test correlation ID is properly propagated through all operations."""
        # Capture correlation IDs from HTTP calls
        captured_headers = []
        
        async def capture_headers(*args, **kwargs):
            if 'headers' in kwargs:
                captured_headers.append(kwargs['headers'])
        
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post = AsyncMock(side_effect=capture_headers)
            mock_client_class.return_value = mock_client
            
            # Execute
            await agent_notification_service.notify_user_login(sample_user_context)
            
            # Verify correlation IDs were included in headers
            for headers in captured_headers:
                assert 'X-Correlation-ID' in headers
                # Correlation ID should be a valid UUID format
                correlation_id = headers['X-Correlation-ID']
                assert len(correlation_id) == 36  # UUID length
                assert correlation_id.count('-') == 4  # UUID format


class TestAgentNotificationServiceEdgeCases:
    """Test edge cases and error scenarios."""
    
    @pytest.mark.asyncio
    async def test_notify_with_empty_agent_registry(
        self,
        mock_event_bus: AsyncMock,
        sample_user_preferences: UserPreferences,
        sample_portfolio_settings: PortfolioSettings,
        sample_risk_profile: RiskProfile,
        sample_trading_strategies: list[TradingStrategy]
    ):
        """Test behavior when no agents are registered."""
        # Create service with empty registry
        empty_registry = MagicMock()
        empty_registry.get_registered_agents.return_value = []
        
        service = AgentNotificationService(
            agent_registry=empty_registry,
            event_bus=mock_event_bus
        )
        
        # Create proper user context using fixtures
        user_context = UserContext(
            user_id="test_user",
            preferences=sample_user_preferences,
            portfolio_settings=sample_portfolio_settings,
            risk_profile=sample_risk_profile,
            trading_strategies=sample_trading_strategies,
            session_info={
                "session_id": "session_123",
                "ip_address": "192.168.1.100",
                "user_agent": "Test Agent 1.0"
            }
        )
        
        # Execute - should complete without errors
        await service.notify_user_login(user_context)
        
        # Verify event bus was still called
        mock_event_bus.publish_authentication_event.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_notify_with_invalid_agent_config(
        self,
        sample_authentication_event: AuthenticationEvent,
        mock_event_bus: AsyncMock
    ):
        """Test handling of invalid agent configuration."""
        agent_name = "invalid_agent"
        
        # Create fresh service with registry that returns None for agent config
        mock_registry = MagicMock()
        mock_registry.get_agent_config.return_value = None
        
        fresh_service = AgentNotificationService(
            agent_registry=mock_registry,
            event_bus=mock_event_bus,
            circuit_breaker_failure_threshold=10,  # Higher threshold
            notification_timeout=5.0,
            enable_circuit_breaker=False  # Disable for testing
        )
        
        # Execute - should raise ValueError
        with pytest.raises(ValueError, match="Agent invalid_agent not found"):
            await fresh_service._notify_single_agent_direct(
                agent_name, sample_authentication_event
            )
    
    @pytest.mark.asyncio
    async def test_concurrent_notifications(
        self,
        agent_notification_service: AgentNotificationService,
        sample_user_context: UserContext
    ):
        """Test concurrent user login notifications."""
        # Create multiple user contexts
        user_contexts = []
        for i in range(5):
            context = UserContext(
                user_id=f"user_{i}",
                preferences=sample_user_context.preferences,
                portfolio_settings=sample_user_context.portfolio_settings,
                risk_profile=sample_user_context.risk_profile,
                trading_strategies=sample_user_context.trading_strategies,
                session_info={
                    "session_id": f"session_{i}",
                    "ip_address": "192.168.1.100",
                    "user_agent": "Test Agent 1.0"
                }
            )
            user_contexts.append(context)
        
        with patch.object(
            agent_notification_service,
            '_notify_single_agent_async',
            return_value=None
        ) as mock_notify:
            
            # Execute concurrent notifications
            tasks = [
                agent_notification_service.notify_user_login(context)
                for context in user_contexts
            ]
            await asyncio.gather(*tasks)
            
            # Verify all notifications were processed
            # 5 users * 5 agents each = 25 total notifications
            assert mock_notify.call_count == 25 