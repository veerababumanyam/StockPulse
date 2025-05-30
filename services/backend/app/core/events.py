"""
Event Bus System
Handles application-wide events for portfolio management, user actions, and integrations
Supports async event handling with proper error recovery
"""
import asyncio
import logging
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, List, Optional
from uuid import UUID

logger = logging.getLogger(__name__)


class PortfolioEvent(str, Enum):
    """Portfolio-related events."""
    CREATED = "portfolio.created"
    UPDATED = "portfolio.updated"
    DELETED = "portfolio.deleted"
    METRICS_UPDATED = "portfolio.metrics_updated"
    POSITION_ADDED = "portfolio.position_added"
    POSITION_UPDATED = "portfolio.position_updated"
    POSITION_REMOVED = "portfolio.position_removed"
    AI_INSIGHTS_GENERATED = "portfolio.ai_insights_generated"
    SNAPSHOT_CREATED = "portfolio.snapshot_created"


class UserEvent(str, Enum):
    """User-related events."""
    LOGGED_IN = "user.logged_in"
    LOGGED_OUT = "user.logged_out"
    PROFILE_UPDATED = "user.profile_updated"


class MarketEvent(str, Enum):
    """Market-related events."""
    PRICE_UPDATE = "market.price_update"
    MARKET_OPEN = "market.open"
    MARKET_CLOSE = "market.close"
    NEWS_UPDATE = "market.news_update"


class APIKeyEvent(str, Enum):
    """API Key-related events."""
    CREATED = "api_key.created"
    UPDATED = "api_key.updated"
    DELETED = "api_key.deleted"
    VALIDATED = "api_key.validated"
    USED = "api_key.used"
    VALIDATION_FAILED = "api_key.validation_failed"
    RATE_LIMITED = "api_key.rate_limited"


# Event data classes for type safety
class BaseEvent:
    """Base event class."""
    def __init__(self, event_type: str, **kwargs):
        self.event_type = event_type
        self.timestamp = datetime.utcnow()
        self.data = kwargs

class PortfolioEventData(BaseEvent):
    """Portfolio event with structured data."""
    def __init__(self, event_type: PortfolioEvent, portfolio_id: UUID, user_id: UUID, **kwargs):
        super().__init__(event_type)
        self.portfolio_id = portfolio_id
        self.user_id = user_id
        self.data.update(kwargs)

class UserEventData(BaseEvent):
    """User event with structured data."""
    def __init__(self, event_type: UserEvent, user_id: UUID, **kwargs):
        super().__init__(event_type)
        self.user_id = user_id
        self.data.update(kwargs)

class APIKeyEventData(BaseEvent):
    """API Key event with structured data."""
    def __init__(self, event_type: str, user_id: UUID, api_key_id: UUID, provider_id: str, **kwargs):
        super().__init__(event_type)
        self.user_id = user_id
        self.api_key_id = api_key_id
        self.provider_id = provider_id
        self.data.update(kwargs)


class EventBus:
    """
    Simple async event bus for handling application events.
    
    Features:
    - Async event emission and handling
    - Event subscribers and handlers
    - Event logging and debugging
    - Error handling and recovery
    """
    
    def __init__(self):
        self.handlers: Dict[str, List[Callable]] = {}
        self.event_history: List[Dict[str, Any]] = []
        self.max_history = 1000  # Keep last 1000 events
        
    def subscribe(self, event_type: str, handler: Callable):
        """Subscribe a handler to an event type."""
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        self.handlers[event_type].append(handler)
        logger.debug(f"Subscribed handler to event: {event_type}")
    
    def unsubscribe(self, event_type: str, handler: Callable):
        """Unsubscribe a handler from an event type."""
        if event_type in self.handlers:
            try:
                self.handlers[event_type].remove(handler)
                logger.debug(f"Unsubscribed handler from event: {event_type}")
            except ValueError:
                logger.warning(f"Handler not found for event: {event_type}")
    
    async def emit(self, event_data):
        """
        Emit an event asynchronously.
        
        Args:
            event_data: Event data (can be Event object or dict for backward compatibility)
        """
        # Handle both new Event objects and legacy dict format
        if hasattr(event_data, 'event_type'):
            event_type = event_data.event_type
            data = event_data.data
        else:
            # Legacy dict format
            event_type = event_data
            data = {}
        
        event = {
            'type': event_type,
            'data': data,
            'timestamp': datetime.utcnow(),
            'id': f"{event_type}_{int(datetime.utcnow().timestamp())}"
        }
        
        # Add to history
        self._add_to_history(event)
        
        # Get handlers for this event type
        handlers = self.handlers.get(event_type, [])
        
        if not handlers:
            logger.debug(f"No handlers for event: {event_type}")
            return
        
        # Execute all handlers concurrently
        try:
            tasks = []
            for handler in handlers:
                if asyncio.iscoroutinefunction(handler):
                    tasks.append(handler(event))
                else:
                    # Wrap sync handlers in async
                    tasks.append(asyncio.create_task(self._run_sync_handler(handler, event)))
            
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)
                
            logger.debug(f"Event emitted successfully: {event_type}")
            
        except Exception as e:
            logger.error(f"Error emitting event {event_type}: {e}")
    
    async def _run_sync_handler(self, handler: Callable, event: Dict[str, Any]):
        """Wrap synchronous handler in async execution."""
        try:
            handler(event)
        except Exception as e:
            logger.error(f"Error in sync event handler: {e}")
    
    def _add_to_history(self, event: Dict[str, Any]):
        """Add event to history with size limit."""
        self.event_history.append(event)
        
        # Maintain history size limit
        if len(self.event_history) > self.max_history:
            self.event_history = self.event_history[-self.max_history:]
    
    def get_recent_events(self, event_type: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent events, optionally filtered by type."""
        events = self.event_history
        
        if event_type:
            events = [e for e in events if e['type'] == event_type]
        
        return events[-limit:] if limit else events


# Global event bus instance
event_bus = EventBus()


# Portfolio event handlers
async def handle_portfolio_created(event: Dict[str, Any]):
    """Handle portfolio creation event."""
    data = event['data']
    portfolio_id = data.get('portfolio_id')
    user_id = data.get('user_id')
    
    logger.info(f"Portfolio created: {portfolio_id} for user {user_id}")
    
    # Here you could:
    # - Send welcome email
    # - Create default watchlists
    # - Initialize analytics
    # - Send to external systems


async def handle_portfolio_metrics_updated(event: Dict[str, Any]):
    """Handle portfolio metrics update event."""
    data = event['data']
    portfolio_id = data.get('portfolio_id')
    total_value = data.get('total_value', 0)
    day_change = data.get('day_change', 0)
    
    logger.debug(f"Portfolio {portfolio_id} metrics updated: value=${total_value:,.2f}, change=${day_change:+,.2f}")
    
    # Here you could:
    # - Update caches
    # - Trigger alerts based on thresholds
    # - Update external systems
    # - Send push notifications


async def handle_ai_insights_generated(event: Dict[str, Any]):
    """Handle AI insights generation event."""
    data = event['data']
    portfolio_id = data.get('portfolio_id')
    insights_count = data.get('insights_count', 0)
    high_priority_count = data.get('high_priority_count', 0)
    
    logger.info(f"AI insights generated for portfolio {portfolio_id}: {insights_count} total, {high_priority_count} high priority")
    
    # Here you could:
    # - Send notifications for high-priority insights
    # - Update user dashboard
    # - Log analytics events


# API Key event handlers
async def handle_api_key_created(event: Dict[str, Any]):
    """Handle API key creation event."""
    data = event['data']
    api_key_id = data.get('api_key_id')
    user_id = data.get('user_id')
    provider_id = data.get('provider_id')
    
    logger.info(f"API key created: {api_key_id} for user {user_id}, provider {provider_id}")
    
    # Here you could:
    # - Send notification to user
    # - Log security event
    # - Initialize usage tracking
    # - Validate key in background


async def handle_api_key_used(event: Dict[str, Any]):
    """Handle API key usage event."""
    data = event['data']
    api_key_id = data.get('api_key_id')
    provider_id = data.get('provider_id')
    endpoint = data.get('endpoint')
    
    logger.debug(f"API key used: {api_key_id} for {provider_id} endpoint {endpoint}")
    
    # Here you could:
    # - Update usage statistics
    # - Check rate limits
    # - Log for billing
    # - Monitor for abuse


async def handle_api_key_validation_failed(event: Dict[str, Any]):
    """Handle API key validation failure event."""
    data = event['data']
    api_key_id = data.get('api_key_id')
    provider_id = data.get('provider_id')
    error = data.get('error')
    
    logger.warning(f"API key validation failed: {api_key_id} for {provider_id}, error: {error}")
    
    # Here you could:
    # - Notify user of invalid key
    # - Disable key if repeatedly failing
    # - Log security event
    # - Suggest key rotation


# Subscribe default handlers
event_bus.subscribe(PortfolioEvent.CREATED, handle_portfolio_created)
event_bus.subscribe(PortfolioEvent.METRICS_UPDATED, handle_portfolio_metrics_updated)
event_bus.subscribe(PortfolioEvent.AI_INSIGHTS_GENERATED, handle_ai_insights_generated)

# Subscribe API key handlers
event_bus.subscribe(APIKeyEvent.CREATED, handle_api_key_created)
event_bus.subscribe(APIKeyEvent.USED, handle_api_key_used)
event_bus.subscribe(APIKeyEvent.VALIDATION_FAILED, handle_api_key_validation_failed)


# Utility functions for common event patterns
async def emit_portfolio_event(event_type: PortfolioEvent, portfolio_id: str, **kwargs):
    """Utility to emit portfolio events with common structure."""
    data = {
        'portfolio_id': portfolio_id,
        **kwargs
    }
    await event_bus.emit(event_type, data)


async def emit_user_event(event_type: UserEvent, user_id: str, **kwargs):
    """Utility to emit user events with common structure."""
    data = {
        'user_id': user_id,
        **kwargs
    }
    await event_bus.emit(event_type, data)


async def emit_market_event(event_type: MarketEvent, **kwargs):
    """Utility to emit market events."""
    await event_bus.emit(event_type, kwargs)


async def emit_api_key_event(event_type: APIKeyEvent, user_id: UUID, api_key_id: UUID, provider_id: str, **kwargs):
    """Utility to emit API key events with common structure."""
    event_data = APIKeyEventData(
        event_type=event_type,
        user_id=user_id,
        api_key_id=api_key_id,
        provider_id=provider_id,
        **kwargs
    )
    await event_bus.emit(event_data)


# Dependency for FastAPI
async def get_event_bus() -> EventBus:
    """Get the global event bus instance."""
    return event_bus 