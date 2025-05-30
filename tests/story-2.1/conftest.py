"""
Test configuration and fixtures for Story 2.1 Basic Dashboard Layout and Portfolio Snapshot tests.
"""

import asyncio
import os
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, AsyncGenerator, Dict, List
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Import application components
from main import app
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import get_db
from app.core.events import EventBus
from app.models.api_keys import APIKey, APIProvider
from app.models.portfolio import (
    AIPortfolioInsight,
    Portfolio,
    PortfolioPosition,
    Transaction,
)
from app.models.user import User
from app.schemas.api_keys import APIKeyCreate
from app.schemas.portfolio import (
    DashboardSummary,
    MarketSummary,
    PerformanceMetrics,
    PortfolioCreate,
    PortfolioPositionCreate,
    TransactionCreate,
)
from app.services.ai_analysis import AIAnalysisService
from app.services.api_keys import APIKeyService
from app.services.market_data import MarketDataService
from app.services.portfolio import PortfolioService

# Test database URL
TEST_DATABASE_URL = (
    "postgresql+asyncpg://test_user:test_pass@localhost:5432/test_stockpulse"
)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=True)
    yield engine
    await engine.dispose()


@pytest.fixture(scope="session")
async def test_session_factory(test_engine):
    """Create test session factory."""
    TestingSessionLocal = sessionmaker(
        bind=test_engine, class_=AsyncSession, expire_on_commit=False
    )
    yield TestingSessionLocal


@pytest.fixture
async def db_session(test_session_factory):
    """Create a test database session."""
    async with test_session_factory() as session:
        yield session
        await session.rollback()


@pytest.fixture
def test_client(db_session):
    """Create a test client with database dependency override."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


# User Fixtures
@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        id=uuid.uuid4(),
        email="test@stockpulse.com",
        password_hash="hashed_password",
        role="USER",
        status="APPROVED",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def admin_user(db_session: AsyncSession) -> User:
    """Create an admin test user."""
    user = User(
        id=uuid.uuid4(),
        email="admin@stockpulse.com",
        password_hash="hashed_password",
        role="ADMIN",
        status="APPROVED",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


# Portfolio Fixtures
@pytest.fixture
def sample_portfolio_create() -> PortfolioCreate:
    """Create sample portfolio creation data."""
    return PortfolioCreate(
        name="Test Portfolio",
        description="A test portfolio for unit testing",
        cash_balance=Decimal("10000.00"),
    )


@pytest.fixture
async def test_portfolio(db_session: AsyncSession, test_user: User) -> Portfolio:
    """Create a test portfolio with positions."""
    portfolio = Portfolio(
        id=uuid.uuid4(),
        user_id=test_user.id,
        name="Test Portfolio",
        description="Test portfolio for unit tests",
        cash_balance=Decimal("10000.00"),
        total_invested=Decimal("15000.00"),
        total_value=Decimal("16500.00"),
        total_pnl=Decimal("1500.00"),
        total_pnl_percentage=Decimal("10.00"),
        day_pnl=Decimal("250.00"),
        day_pnl_percentage=Decimal("1.54"),
    )
    db_session.add(portfolio)

    # Add some test positions
    positions = [
        PortfolioPosition(
            id=uuid.uuid4(),
            portfolio_id=portfolio.id,
            symbol="AAPL",
            quantity=Decimal("100"),
            average_cost=Decimal("150.00"),
            current_price=Decimal("155.00"),
            market_value=Decimal("15500.00"),
            unrealized_pnl=Decimal("500.00"),
            unrealized_pnl_percentage=Decimal("3.33"),
            weight_percentage=Decimal("50.00"),
        ),
        PortfolioPosition(
            id=uuid.uuid4(),
            portfolio_id=portfolio.id,
            symbol="TSLA",
            quantity=Decimal("50"),
            average_cost=Decimal("200.00"),
            current_price=Decimal("220.00"),
            market_value=Decimal("11000.00"),
            unrealized_pnl=Decimal("1000.00"),
            unrealized_pnl_percentage=Decimal("10.00"),
            weight_percentage=Decimal("35.48"),
        ),
    ]

    for position in positions:
        db_session.add(position)

    await db_session.commit()
    await db_session.refresh(portfolio)
    return portfolio


@pytest.fixture
def sample_position_create() -> PortfolioPositionCreate:
    """Create sample position creation data."""
    return PortfolioPositionCreate(
        symbol="NVDA",
        quantity=Decimal("25"),
        average_cost=Decimal("800.00"),
        current_price=Decimal("850.00"),
    )


@pytest.fixture
def sample_transaction_create() -> TransactionCreate:
    """Create sample transaction data."""
    return TransactionCreate(
        symbol="AAPL",
        transaction_type="BUY",
        quantity=Decimal("10"),
        price=Decimal("155.00"),
        fees=Decimal("1.00"),
        transaction_date=datetime.utcnow(),
    )


# API Key Fixtures
@pytest.fixture
async def api_providers(db_session: AsyncSession) -> List[APIProvider]:
    """Create test API providers."""
    providers = [
        APIProvider(
            id="openai",
            name="OpenAI",
            description="OpenAI GPT models",
            category="ai",
            is_active=True,
        ),
        APIProvider(
            id="fmp",
            name="Financial Modeling Prep",
            description="Financial market data",
            category="financial",
            is_active=True,
        ),
        APIProvider(
            id="alpha_vantage",
            name="Alpha Vantage",
            description="Stock market data",
            category="financial",
            is_active=True,
        ),
    ]

    for provider in providers:
        db_session.add(provider)

    await db_session.commit()
    return providers


@pytest.fixture
def real_api_keys() -> Dict[str, str]:
    """Real API keys provided by the user for testing."""
    return {
        "openai": os.getenv("OPENAI_API_KEY", "sk-test-openai-key-placeholder"),
        "anthropic": os.getenv(
            "ANTHROPIC_API_KEY", "sk-ant-test-anthropic-key-placeholder"
        ),
        "gemini": os.getenv("GOOGLE_API_KEY", "test-gemini-key-placeholder"),
        "fmp": os.getenv("FMP_API_KEY", "test-fmp-key-placeholder"),
        "alpha_vantage": os.getenv("ALPHA_VANTAGE_API_KEY", "test-av-key-placeholder"),
        "polygon": os.getenv("POLYGON_API_KEY", "test-polygon-key-placeholder"),
        "taapi": os.getenv("TAAPI_API_KEY", "test-taapi-key-placeholder"),
        "openrouter": os.getenv(
            "OPENROUTER_API_KEY", "sk-or-test-openrouter-key-placeholder"
        ),
    }


@pytest.fixture
async def test_api_keys(
    db_session: AsyncSession, test_user: User, api_providers: List[APIProvider]
) -> List[APIKey]:
    """Create test API keys."""
    api_keys = []
    test_keys = {
        "openai": "sk-test_openai_key_123",
        "fmp": "test_fmp_key_456",
        "alpha_vantage": "test_av_key_789",
    }

    for provider_id, key_value in test_keys.items():
        api_key = APIKey(
            id=uuid.uuid4(),
            user_id=test_user.id,
            provider_id=provider_id,
            name=f"Test {provider_id.title()} Key",
            encrypted_key=f"encrypted_{key_value}",
            key_hash=f"hash_{key_value}",
            is_active=True,
            is_validated=True,
        )
        db_session.add(api_key)
        api_keys.append(api_key)

    await db_session.commit()
    return api_keys


# Service Fixtures
@pytest.fixture
def mock_event_bus() -> EventBus:
    """Create a mock event bus for testing."""
    return MagicMock(spec=EventBus)


@pytest.fixture
def mock_market_data_service() -> MarketDataService:
    """Create a mock market data service."""
    service = MagicMock(spec=MarketDataService)

    # Mock market data responses
    service.get_bulk_quotes.return_value = {
        "AAPL": {
            "price": 155.00,
            "previous_close": 153.50,
            "change": 1.50,
            "change_percent": 0.98,
        },
        "TSLA": {
            "price": 220.00,
            "previous_close": 218.00,
            "change": 2.00,
            "change_percent": 0.92,
        },
        "NVDA": {
            "price": 850.00,
            "previous_close": 840.00,
            "change": 10.00,
            "change_percent": 1.19,
        },
    }

    service.get_current_price.return_value = Decimal("155.00")
    service.get_market_summary.return_value = MarketSummary(
        market_status="OPEN",
        major_indices=[
            {
                "symbol": "SPY",
                "price": Decimal("485.23"),
                "change": Decimal("2.45"),
                "change_pct": Decimal("0.51"),
            },
            {
                "symbol": "QQQ",
                "price": Decimal("412.67"),
                "change": Decimal("-1.23"),
                "change_pct": Decimal("-0.30"),
            },
            {
                "symbol": "IWM",
                "price": Decimal("201.89"),
                "change": Decimal("0.87"),
                "change_pct": Decimal("0.43"),
            },
        ],
        market_sentiment="bullish",
        trending_stocks=[
            {"symbol": "AAPL", "change_pct": Decimal("3.2")},
            {"symbol": "TSLA", "change_pct": Decimal("-2.1")},
            {"symbol": "NVDA", "change_pct": Decimal("5.4")},
        ],
    )

    return service


@pytest.fixture
def mock_ai_service() -> AIAnalysisService:
    """Create a mock AI analysis service."""
    service = MagicMock(spec=AIAnalysisService)

    # Mock AI insights
    service.analyze_portfolio.return_value = [
        {
            "type": "ANALYSIS",
            "title": "Portfolio Diversification",
            "content": "Your portfolio shows good diversification across technology stocks.",
            "confidence": 0.85,
            "priority": "medium",
            "action_required": False,
        },
        {
            "type": "RECOMMENDATION",
            "title": "Rebalancing Opportunity",
            "content": "Consider reducing TSLA position to lock in gains.",
            "confidence": 0.78,
            "priority": "high",
            "action_required": True,
        },
    ]

    return service


@pytest.fixture
def portfolio_service(
    db_session: AsyncSession,
    mock_market_data_service: MarketDataService,
    mock_ai_service: AIAnalysisService,
    mock_event_bus: EventBus,
) -> PortfolioService:
    """Create a portfolio service with mocked dependencies."""
    api_key_service = MagicMock(spec=APIKeyService)
    api_key_service.get_api_key_for_provider.return_value = "test_api_key"

    return PortfolioService(
        db=db_session,
        market_data_service=mock_market_data_service,
        ai_service=mock_ai_service,
        event_bus=mock_event_bus,
        api_key_service=api_key_service,
    )


@pytest.fixture
def api_key_service(
    db_session: AsyncSession, mock_event_bus: EventBus
) -> APIKeyService:
    """Create an API key service."""
    return APIKeyService(event_bus=mock_event_bus)


# Mock Market Data Responses
@pytest.fixture
def sample_market_data():
    """Sample market data for testing."""
    return {
        "AAPL": {
            "price": 155.00,
            "previous_close": 153.50,
            "change": 1.50,
            "change_percent": 0.98,
            "volume": 50000000,
            "market_cap": 2400000000000,
        },
        "TSLA": {
            "price": 220.00,
            "previous_close": 218.00,
            "change": 2.00,
            "change_percent": 0.92,
            "volume": 25000000,
            "market_cap": 700000000000,
        },
    }


# AI Insights Fixtures
@pytest.fixture
def sample_ai_insights():
    """Sample AI insights for testing."""
    return [
        {
            "type": "ANALYSIS",
            "title": "Portfolio Performance Review",
            "content": "Your portfolio has outperformed the S&P 500 by 2.3% this quarter.",
            "confidence": 0.92,
            "priority": "medium",
            "action_required": False,
            "metadata": {"benchmark": "SPY", "outperformance": 2.3},
        },
        {
            "type": "ALERT",
            "title": "High Volatility Warning",
            "content": "TSLA shows increased volatility. Consider position sizing review.",
            "confidence": 0.78,
            "priority": "high",
            "action_required": True,
            "metadata": {"symbol": "TSLA", "volatility": 45.2},
        },
    ]


# Dashboard Fixtures
@pytest.fixture
def sample_dashboard_summary(test_portfolio: Portfolio) -> DashboardSummary:
    """Create sample dashboard summary."""
    return DashboardSummary(
        total_value=Decimal("26500.00"),
        total_invested=Decimal("25000.00"),
        total_pnl=Decimal("1500.00"),
        total_pnl_percentage=Decimal("6.00"),
        day_pnl=Decimal("250.00"),
        day_pnl_percentage=Decimal("0.95"),
        cash_balance=Decimal("10000.00"),
        portfolios=[],
        recent_transactions=[],
        ai_insights=[],
        performance_metrics=PerformanceMetrics(
            sharpe_ratio=Decimal("1.25"),
            max_drawdown=Decimal("-12.5"),
            volatility=Decimal("18.2"),
            beta=Decimal("1.15"),
            alpha=Decimal("3.8"),
        ),
        market_summary=MarketSummary(
            market_status="OPEN",
            major_indices=[],
            market_sentiment="bullish",
            trending_stocks=[],
        ),
    )


# Test Environment Variables
@pytest.fixture(autouse=True)
def test_env_vars():
    """Set test environment variables."""
    os.environ["ENVIRONMENT"] = "test"
    os.environ["API_KEY_ENCRYPTION_KEY"] = "test_encryption_key_for_testing_only"
    yield
    # Cleanup
    os.environ.pop("ENVIRONMENT", None)
    os.environ.pop("API_KEY_ENCRYPTION_KEY", None)


# Authentication Fixtures
@pytest.fixture
def authenticated_headers(test_user: User) -> Dict[str, str]:
    """Create authenticated headers for API requests."""
    # In a real implementation, this would generate a proper JWT token
    return {
        "Authorization": f"Bearer test_token_for_{test_user.id}",
        "Content-Type": "application/json",
    }


# Error Testing Fixtures
@pytest.fixture
def api_error_responses():
    """Common API error responses for testing."""
    return {
        "unauthorized": {"detail": "Not authenticated"},
        "forbidden": {"detail": "Not enough permissions"},
        "not_found": {"detail": "Resource not found"},
        "validation_error": {"detail": "Validation error"},
        "server_error": {"detail": "Internal server error"},
    }


# Performance Testing Fixtures
@pytest.fixture
def performance_test_data():
    """Large dataset for performance testing."""
    return {
        "portfolios": 100,
        "positions_per_portfolio": 50,
        "transactions_per_portfolio": 1000,
        "ai_insights_per_portfolio": 25,
    }
