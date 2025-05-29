"""
Agent Notification Service for MCP integration.
Core orchestrator for agent communication and context management.
"""

import asyncio
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime
import httpx
import structlog
from circuitbreaker import circuit
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mcp.user_context import UserContext
from app.models.mcp.authentication_event import (
    AuthenticationEvent, 
    AgentNotificationEvent,
    AuthenticationEventType,
    AgentNotificationStatus
)
from app.services.mcp.agent_registry import AgentRegistry
from app.services.mcp.event_bus_service import EventBusService
from app.core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


class AgentNotificationService:
    """Core orchestrator for agent communication and context management."""
    
    def __init__(
        self, 
        agent_registry: AgentRegistry,
        event_bus: EventBusService,
        circuit_breaker_failure_threshold: int = 5,
        circuit_breaker_recovery_timeout: int = 30,
        notification_timeout: float = 5.0,
        max_retry_attempts: int = 3,
        enable_circuit_breaker: bool = True
    ):
        self.agent_registry = agent_registry
        self.event_bus = event_bus
        self.circuit_breaker_failure_threshold = circuit_breaker_failure_threshold
        self.circuit_breaker_recovery_timeout = circuit_breaker_recovery_timeout
        self.notification_timeout = notification_timeout
        self.max_retry_attempts = max_retry_attempts
        self.enable_circuit_breaker = enable_circuit_breaker
        
        # Performance tracking
        self._notification_stats = {
            "total_notifications": 0,
            "successful_notifications": 0,
            "failed_notifications": 0,
            "circuit_breaker_trips": 0
        }
    
    async def notify_user_login(self, user_context: UserContext) -> None:
        """
        Notify all relevant agents of user login with user context.
        Non-blocking operation that publishes events to the event bus.
        """
        correlation_id = str(uuid.uuid4())
        
        try:
            logger.info(
                "initiating_user_login_notifications",
                user_id=user_context.user_id,
                correlation_id=correlation_id,
                agent_count=len(self.agent_registry.get_registered_agents())
            )
            
            # Create authentication event
            auth_event = AuthenticationEvent(
                event_type=AuthenticationEventType.USER_LOGIN,
                user_id=user_context.user_id,
                user_context=user_context,
                correlation_id=correlation_id,
                session_info={
                    "session_id": user_context.session_info.get("session_id", "default_session"),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
            # Get agents that should be notified for login events
            target_agents = self._get_login_notification_agents(user_context)
            
            # Create notification tasks for each agent
            notification_tasks = []
            for agent_name in target_agents:
                if user_context.has_permission_for_agent(
                    agent_name, 
                    self.agent_registry.get_required_permission(agent_name)
                ):
                    task = asyncio.create_task(
                        self._notify_single_agent_async(agent_name, auth_event)
                    )
                    notification_tasks.append(task)
            
            # Publish to event bus (primary mechanism)
            await self.event_bus.publish_authentication_event(auth_event)
            
            # Wait for direct notifications (with timeout)
            if notification_tasks:
                await asyncio.wait_for(
                    asyncio.gather(*notification_tasks, return_exceptions=True),
                    timeout=self.notification_timeout
                )
            
            logger.info(
                "user_login_notifications_completed",
                user_id=user_context.user_id,
                correlation_id=correlation_id,
                agents_notified=len(target_agents)
            )
            
        except Exception as e:
            logger.error(
                "user_login_notification_error",
                user_id=user_context.user_id,
                correlation_id=correlation_id,
                error=str(e)
            )
            # Don't raise - authentication should not be blocked by agent failures
    
    async def notify_user_logout(self, user_id: str) -> None:
        """
        Notify all agents of user logout to clear contexts.
        Non-blocking operation.
        """
        correlation_id = str(uuid.uuid4())
        
        try:
            logger.info(
                "initiating_user_logout_notifications",
                user_id=user_id,
                correlation_id=correlation_id
            )
            
            # Create logout event
            auth_event = AuthenticationEvent(
                event_type=AuthenticationEventType.USER_LOGOUT,
                user_id=user_id,
                correlation_id=correlation_id,
                session_info={
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
            # Notify all agents to clear contexts
            target_agents = self.agent_registry.get_registered_agents()
            
            # Create notification tasks
            notification_tasks = [
                asyncio.create_task(
                    self._notify_single_agent_async(agent_name, auth_event)
                )
                for agent_name in target_agents
            ]
            
            # Publish to event bus
            await self.event_bus.publish_authentication_event(auth_event)
            
            # Wait for direct notifications (with timeout)
            if notification_tasks:
                await asyncio.wait_for(
                    asyncio.gather(*notification_tasks, return_exceptions=True),
                    timeout=self.notification_timeout
                )
            
            logger.info(
                "user_logout_notifications_completed",
                user_id=user_id,
                correlation_id=correlation_id,
                agents_notified=len(target_agents)
            )
            
        except Exception as e:
            logger.error(
                "user_logout_notification_error",
                user_id=user_id,
                correlation_id=correlation_id,
                error=str(e)
            )
    
    async def propagate_user_context(self, user_context: UserContext) -> None:
        """
        Propagate updated user context to relevant agents.
        """
        correlation_id = str(uuid.uuid4())
        
        try:
            # Create context update event
            auth_event = AuthenticationEvent(
                event_type=AuthenticationEventType.CONTEXT_UPDATE,
                user_id=user_context.user_id,
                user_context=user_context,
                correlation_id=correlation_id
            )
            
            # Publish to event bus
            await self.event_bus.publish_context_update_event(auth_event)
            
            logger.info(
                "user_context_propagated",
                user_id=user_context.user_id,
                correlation_id=correlation_id
            )
            
        except Exception as e:
            logger.error(
                "context_propagation_error",
                user_id=user_context.user_id,
                correlation_id=correlation_id,
                error=str(e)
            )
    
    async def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> None:
        """
        Notify agents of user preference changes.
        """
        correlation_id = str(uuid.uuid4())
        
        try:
            # Create preference change event
            auth_event = AuthenticationEvent(
                event_type=AuthenticationEventType.PREFERENCE_CHANGE,
                user_id=user_id,
                correlation_id=correlation_id,
                additional_data={"updated_preferences": preferences}
            )
            
            # Get agents that care about preference changes
            preference_sensitive_agents = self._get_preference_sensitive_agents()
            
            # Create notification tasks
            notification_tasks = [
                asyncio.create_task(
                    self._notify_single_agent_async(agent_name, auth_event)
                )
                for agent_name in preference_sensitive_agents
            ]
            
            # Publish to event bus
            await self.event_bus.publish_authentication_event(auth_event)
            
            # Wait for notifications
            if notification_tasks:
                await asyncio.wait_for(
                    asyncio.gather(*notification_tasks, return_exceptions=True),
                    timeout=self.notification_timeout
                )
            
            logger.info(
                "user_preferences_updated",
                user_id=user_id,
                correlation_id=correlation_id,
                agents_notified=len(preference_sensitive_agents)
            )
            
        except Exception as e:
            logger.error(
                "preference_update_error",
                user_id=user_id,
                correlation_id=correlation_id,
                error=str(e)
            )
    
    @circuit(failure_threshold=5, recovery_timeout=30, expected_exception=Exception)
    async def _notify_single_agent_async(
        self, 
        agent_name: str, 
        event: AuthenticationEvent
    ) -> None:
        """
        Notify individual agent with circuit breaker protection.
        """
        if not self.enable_circuit_breaker:
            # Bypass circuit breaker for testing
            return await self._notify_single_agent_direct(agent_name, event)
        
        try:
            await self._notify_single_agent_direct(agent_name, event)
            
            # Record successful notification
            await self._record_notification_success(agent_name, event)
            self._notification_stats["successful_notifications"] += 1
            
            logger.debug(
                "agent_notification_successful",
                agent_name=agent_name,
                event_id=event.event_id,
                correlation_id=event.correlation_id
            )
            
        except Exception as e:
            await self._record_notification_failure(agent_name, event, str(e))
            self._notification_stats["failed_notifications"] += 1
            
            logger.error(
                "agent_notification_failed",
                agent_name=agent_name,
                event_id=event.event_id,
                correlation_id=event.correlation_id,
                error=str(e)
            )
            raise
    
    async def _notify_single_agent_direct(
        self, 
        agent_name: str, 
        event: AuthenticationEvent
    ) -> None:
        """
        Direct agent notification without circuit breaker protection.
        Used internally and for testing.
        """
        try:
            agent_config = self.agent_registry.get_agent_config(agent_name)
            if not agent_config:
                raise ValueError(f"Agent {agent_name} not found in registry")
            
            # Create agent-specific context
            agent_context = {}
            if event.user_context:
                agent_context = event.user_context.to_agent_context(agent_name)
            
            # Prepare notification payload
            notification_payload = {
                "event_type": event.event_type,
                "event_id": event.event_id,
                "correlation_id": event.correlation_id,
                "timestamp": event.timestamp.isoformat(),
                "user_context": agent_context
            }
            
            # Send HTTP notification
            async with httpx.AsyncClient(timeout=self.notification_timeout) as client:
                response = await client.post(
                    f"{agent_config['endpoint']}/context/update",
                    json=notification_payload,
                    headers={
                        "Authorization": f"Bearer {await self._get_agent_token(agent_name)}",
                        "Content-Type": "application/json",
                        "X-Correlation-ID": event.correlation_id
                    }
                )
                response.raise_for_status()
            
        except Exception as e:
            raise
    
    async def validate_agent_permissions(self, user_id: str, agent_name: str) -> bool:
        """
        Validate if user has granted permission for specific agent.
        """
        try:
            # This would typically fetch from user context repository
            # For now, return True for basic implementation
            return True
        except Exception as e:
            logger.error(
                "agent_permission_validation_error",
                user_id=user_id,
                agent_name=agent_name,
                error=str(e)
            )
            return False
    
    def _get_login_notification_agents(self, user_context: UserContext) -> List[str]:
        """Get list of agents that should be notified on user login."""
        # Return all registered agents that user has permissions for
        all_agents = self.agent_registry.get_registered_agents()
        return [
            agent for agent in all_agents
            if user_context.has_permission_for_agent(
                agent, 
                self.agent_registry.get_required_permission(agent)
            )
        ]
    
    def _get_preference_sensitive_agents(self) -> List[str]:
        """Get list of agents that care about preference changes."""
        # Agents that typically care about user preferences
        return [
            "technical_analysis",
            "portfolio_optimization", 
            "news_analysis",
            "user_preference"
        ]
    
    async def _get_agent_token(self, agent_name: str) -> str:
        """
        Get authentication token for agent communication.
        This would typically use a proper JWT token for the agent.
        """
        # For now, return a simple token
        # In production, this should be a proper JWT
        return f"agent_token_{agent_name}"
    
    async def _record_notification_success(
        self, 
        agent_name: str, 
        event: AuthenticationEvent
    ) -> None:
        """Record successful agent notification."""
        try:
            notification_event = AgentNotificationEvent(
                target_agent=agent_name,
                user_id=event.user_id,
                event_type=event.event_type,
                payload={"event_id": event.event_id},
                status=AgentNotificationStatus.DELIVERED,
                correlation_id=event.correlation_id
            )
            notification_event.mark_delivered()
            
            # Store in database (implementation depends on repository)
            logger.debug(
                "notification_success_recorded",
                agent_name=agent_name,
                event_id=event.event_id
            )
            
        except Exception as e:
            logger.error(
                "failed_to_record_notification_success",
                agent_name=agent_name,
                event_id=event.event_id,
                error=str(e)
            )
    
    async def _record_notification_failure(
        self, 
        agent_name: str, 
        event: AuthenticationEvent, 
        error_message: str
    ) -> None:
        """Record failed agent notification."""
        try:
            notification_event = AgentNotificationEvent(
                target_agent=agent_name,
                user_id=event.user_id,
                event_type=event.event_type,
                payload={"event_id": event.event_id},
                correlation_id=event.correlation_id
            )
            notification_event.mark_failed(error_message)
            
            # Store in database (implementation depends on repository)
            logger.debug(
                "notification_failure_recorded",
                agent_name=agent_name,
                event_id=event.event_id,
                error=error_message
            )
            
        except Exception as e:
            logger.error(
                "failed_to_record_notification_failure",
                agent_name=agent_name,
                event_id=event.event_id,
                error=str(e)
            )
    
    async def get_notification_stats(self) -> Dict[str, Any]:
        """Get notification statistics for monitoring."""
        return {
            **self._notification_stats,
            "timestamp": datetime.utcnow().isoformat()
        } 