"""
Test configuration and fixtures for Story 1.4 MCP Agent Integration tests.
"""

import pytest
import asyncio
from typing import Dict, Any, AsyncGenerator
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime, timedelta
from decimal import Decimal
import sys

from app.models.mcp.user_context import (
    UserContext, UserPreferences, PortfolioSettings, RiskProfile, 
    TradingStrategy, AgentPermissionLevel
)
from app.models.mcp.authentication_event import (
    AuthenticationEvent, AgentNotificationEvent, AuthenticationEventType
)
from app.services.mcp.agent_notification_service import AgentNotificationService
from app.services.mcp.agent_registry import AgentRegistry
from app.services.mcp.event_bus_service import EventBusService


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
def reset_circuit_breaker():
    """Reset circuit breaker state before each test to ensure isolation."""
    # Reset circuit breaker state before test
    try:
        import circuitbreaker
        # Clear all existing circuit breaker instances
        if hasattr(circuitbreaker, '_CircuitBreaker'):
            if hasattr(circuitbreaker._CircuitBreaker, '_instances'):
                circuitbreaker._CircuitBreaker._instances.clear()
        
        # Also clear any module-level circuit breaker decorators
        for module_name, module in sys.modules.items():
            if module and hasattr(module, '__dict__'):
                for attr_name, attr_value in module.__dict__.items():
                    if hasattr(attr_value, '__wrapped__') and hasattr(attr_value, '_circuit_breaker'):
                        # Reset the circuit breaker state
                        cb = attr_value._circuit_breaker
                        cb._failure_count = 0
                        cb._last_failure_time = None
                        cb._state = circuitbreaker.STATE_CLOSED
    except (ImportError, AttributeError):
        pass
    
    yield
    
    # Cleanup after test
    try:
        import circuitbreaker
        if hasattr(circuitbreaker, '_CircuitBreaker'):
            if hasattr(circuitbreaker._CircuitBreaker, '_instances'):
                circuitbreaker._CircuitBreaker._instances.clear()
    except (ImportError, AttributeError):
        pass


@pytest.fixture
def sample_user_preferences() -> UserPreferences:
    """Create sample user preferences for testing."""
    return UserPreferences(
        trading_style="moderate",
        risk_tolerance="moderate",
        notification_settings={
            "email_alerts": True,
            "push_notifications": True,
            "sms_alerts": False
        },
        ui_settings={
            "theme": "dark",
            "dashboard_layout": "compact"
        },
        timezone="America/New_York"
    )


@pytest.fixture
def sample_portfolio_settings() -> PortfolioSettings:
    """Create sample portfolio settings for testing."""
    return PortfolioSettings(
        rebalancing_frequency="monthly",
        asset_allocation={
            "stocks": 0.6,
            "bonds": 0.3,
            "cash": 0.1
        },
        max_position_size=Decimal("0.05"),
        min_cash_reserve=Decimal("0.1")
    )


@pytest.fixture
def sample_risk_profile() -> RiskProfile:
    """Create sample risk profile for testing."""
    return RiskProfile(
        risk_tolerance="moderate",
        max_daily_loss=Decimal("0.02"),
        max_portfolio_drawdown=Decimal("0.15"),
        position_sizing_method="fixed_percentage"
    )


@pytest.fixture
def sample_trading_strategies() -> list[TradingStrategy]:
    """Create sample trading strategies for testing."""
    return [
        TradingStrategy(
            strategy_name="Momentum Trading",
            enabled=True,
            parameters={
                "lookback_period": 20,
                "momentum_threshold": 0.02
            },
            risk_limits={
                "max_position_size": Decimal("0.1"),
                "stop_loss": Decimal("0.05")
            }
        ),
        TradingStrategy(
            strategy_name="Value Investing",
            enabled=True,
            parameters={
                "pe_threshold": 15,
                "pb_threshold": 2.0
            },
            risk_limits={
                "max_position_size": Decimal("0.15"),
                "stop_loss": Decimal("0.03")
            }
        )
    ]


@pytest.fixture
def sample_user_context(
    sample_user_preferences: UserPreferences,
    sample_portfolio_settings: PortfolioSettings,
    sample_risk_profile: RiskProfile,
    sample_trading_strategies: list[TradingStrategy]
) -> UserContext:
    """Create comprehensive sample user context for testing."""
    return UserContext(
        user_id="test_user_123",
        preferences=sample_user_preferences,
        portfolio_settings=sample_portfolio_settings,
        risk_profile=sample_risk_profile,
        trading_strategies=sample_trading_strategies,
        session_info={
            "session_id": "session_456",
            "ip_address": "192.168.1.100",
            "user_agent": "Test Agent 1.0"
        }
    )


@pytest.fixture
def sample_authentication_event(sample_user_context: UserContext) -> AuthenticationEvent:
    """Create sample authentication event for testing."""
    return AuthenticationEvent(
        event_type=AuthenticationEventType.USER_LOGIN,
        user_id=sample_user_context.user_id,
        user_context=sample_user_context,
        correlation_id="corr_789",
        session_info=sample_user_context.session_info,
        ip_address="192.168.1.100",
        user_agent="Test Agent 1.0"
    )


@pytest.fixture
def mock_agent_registry() -> AgentRegistry:
    """Create mock agent registry for testing."""
    registry = MagicMock(spec=AgentRegistry)
    
    # Mock agent configurations
    registry.get_registered_agents.return_value = [
        "technical_analysis",
        "portfolio_optimization",
        "risk_management",
        "news_analysis",
        "user_preference"
    ]
    
    registry.get_agent_config.side_effect = lambda agent_name: {
        "technical_analysis": {
            "name": "Technical Analysis Agent",
            "endpoint": "http://localhost:8003",
            "capabilities": ["chart_analysis", "technical_indicators"],
            "required_permissions": ["read_market_data"]
        },
        "portfolio_optimization": {
            "name": "Portfolio Optimization Agent",
            "endpoint": "http://localhost:8004",
            "capabilities": ["portfolio_rebalancing", "asset_allocation"],
            "required_permissions": ["read_portfolio"]
        },
        "risk_management": {
            "name": "Risk Management Agent",
            "endpoint": "http://localhost:8005",
            "capabilities": ["risk_monitoring", "position_sizing"],
            "required_permissions": ["read_positions"]
        },
        "news_analysis": {
            "name": "News Analysis Agent",
            "endpoint": "http://localhost:8006",
            "capabilities": ["sentiment_analysis", "news_filtering"],
            "required_permissions": ["read_user_preferences"]
        },
        "user_preference": {
            "name": "User Preference Agent",
            "endpoint": "http://localhost:8007",
            "capabilities": ["preference_learning", "behavior_analysis"],
            "required_permissions": ["read_user_data"]
        }
    }.get(agent_name)
    
    registry.get_required_permission.side_effect = lambda agent_name: {
        "technical_analysis": "read_user_context",
        "portfolio_optimization": "read_user_context",
        "risk_management": "read_user_context",
        "news_analysis": "read_user_context",
        "user_preference": "read_user_context"
    }.get(agent_name, "restricted")
    
    return registry


@pytest.fixture
def mock_event_bus() -> AsyncMock:
    """Create mock event bus service for testing."""
    event_bus = AsyncMock(spec=EventBusService)
    
    # Mock successful event publishing
    event_bus.publish_authentication_event.return_value = None
    event_bus.publish_context_update_event.return_value = None
    event_bus.get_event_stream_stats.return_value = {
        "total_events": 100,
        "events_pending": 5,
        "events_processed": 95
    }
    
    return event_bus


@pytest.fixture
def agent_notification_service(
    mock_agent_registry: AgentRegistry,
    mock_event_bus: AsyncMock
) -> AgentNotificationService:
    """Create agent notification service with mocked dependencies."""
    return AgentNotificationService(
        agent_registry=mock_agent_registry,
        event_bus=mock_event_bus,
        circuit_breaker_failure_threshold=5,
        circuit_breaker_recovery_timeout=30,
        notification_timeout=5.0,
        max_retry_attempts=3
    )


@pytest.fixture
def mock_httpx_client() -> AsyncMock:
    """Create mock httpx client for testing HTTP requests."""
    client = AsyncMock()
    client.post.return_value.status_code = 200
    client.post.return_value.raise_for_status.return_value = None
    return client


@pytest.fixture
def performance_test_data() -> Dict[str, Any]:
    """Test data for performance testing."""
    return {
        "concurrent_users": 100,
        "requests_per_user": 10,
        "expected_max_response_time": 5.0,
        "expected_success_rate": 0.99
    }


@pytest.fixture
def security_test_data() -> Dict[str, Any]:
    """Test data for security testing."""
    return {
        "invalid_user_ids": ["", None, "../../etc/passwd", "<script>alert('xss')</script>"],
        "invalid_agent_names": ["", None, "../../../config", "'; DROP TABLE users; --"],
        "malicious_contexts": [
            {"user_id": "test", "malicious_field": "<script>alert('xss')</script>"},
            {"user_id": "test", "sql_injection": "'; DROP TABLE users; --"},
            {"user_id": "test", "path_traversal": "../../etc/passwd"}
        ],
        "oversized_payloads": {
            "large_preferences": {"key" + str(i): "value" * 1000 for i in range(1000)},
            "large_strategies": [
                {"strategy_name": f"strategy_{i}", "enabled": True, "parameters": {"param" + str(j): "value" * 100 for j in range(100)}}
                for i in range(50)
            ]
        }
    }


@pytest.fixture
async def cleanup_test_data():
    """Fixture to clean up test data after each test."""
    # Setup
    yield
    # Cleanup - would clear test databases, reset services, etc.
    pass


@pytest.fixture
def circuit_breaker_test_config() -> Dict[str, Any]:
    """Configuration for circuit breaker testing."""
    return {
        "failure_threshold": 3,
        "recovery_timeout": 5,
        "expected_exception": Exception,
        "test_failure_count": 5
    }


@pytest.fixture
def agent_failure_scenarios() -> list[Dict[str, Any]]:
    """Different agent failure scenarios for resilience testing."""
    return [
        {
            "scenario": "network_timeout",
            "agents": ["technical_analysis"],
            "error_type": "timeout",
            "expected_fallback": "event_bus_notification"
        },
        {
            "scenario": "agent_unavailable",
            "agents": ["portfolio_optimization"],
            "error_type": "connection_refused",
            "expected_fallback": "retry_mechanism"
        },
        {
            "scenario": "partial_agent_failure",
            "agents": ["risk_management", "news_analysis"],
            "error_type": "http_500",
            "expected_fallback": "continue_with_available_agents"
        },
        {
            "scenario": "all_agents_down",
            "agents": ["technical_analysis", "portfolio_optimization", "risk_management", "news_analysis", "user_preference"],
            "error_type": "connection_refused",
            "expected_fallback": "event_bus_only"
        }
    ]


@pytest.fixture
def integration_test_agents() -> list[Dict[str, Any]]:
    """Real agent configurations for integration testing."""
    return [
        {
            "name": "technical_analysis",
            "endpoint": "http://localhost:8003",
            "health_check_path": "/health",
            "expected_capabilities": ["chart_analysis", "technical_indicators"]
        },
        {
            "name": "portfolio_optimization", 
            "endpoint": "http://localhost:8004",
            "health_check_path": "/health",
            "expected_capabilities": ["portfolio_rebalancing", "asset_allocation"]
        }
    ] 