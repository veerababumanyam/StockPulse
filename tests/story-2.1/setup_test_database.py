"""
Database setup script for Story 2.1 testing.
Populates test database with real API keys and sample portfolio data.
"""

import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List

# Add the backend app to the path
sys.path.append("../../services/backend")

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.models.api_keys import APIKey, APIProvider
from app.models.portfolio import (
    AIPortfolioInsight,
    Portfolio,
    PortfolioPosition,
    Transaction,
)
from app.models.user import User
from app.services.api_keys import APIKeyEncryption, APIKeyService

# Test database configuration
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://test_user:test_pass@localhost:5432/test_stockpulse",
)
ENCRYPTION_KEY = os.getenv(
    "API_KEY_ENCRYPTION_KEY", "test_encryption_key_for_story_2_1_testing"
)

# Real API keys provided by the user
REAL_API_KEYS = {
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


class DatabaseSetup:
    """Class to handle database setup for Story 2.1 testing."""

    def __init__(self):
        self.engine = create_async_engine(TEST_DATABASE_URL, echo=True)
        self.SessionLocal = sessionmaker(
            bind=self.engine, class_=AsyncSession, expire_on_commit=False
        )
        self.encryption = APIKeyEncryption(ENCRYPTION_KEY)

    async def setup_complete_database(self):
        """Set up complete database with all test data."""
        print("🚀 Setting up StockPulse Story 2.1 test database...")

        try:
            # Create all required data
            async with self.SessionLocal() as db:
                # 1. Create API providers
                print("📡 Creating API providers...")
                providers = await self.create_api_providers(db)

                # 2. Create test users
                print("👤 Creating test users...")
                users = await self.create_test_users(db)

                # 3. Create API keys with real values
                print("🔑 Creating API keys with real values...")
                api_keys = await self.create_real_api_keys(db, users[0])

                # 4. Create sample portfolios
                print("💼 Creating sample portfolios...")
                portfolios = await self.create_sample_portfolios(db, users[0])

                # 5. Create portfolio positions
                print("📈 Creating portfolio positions...")
                positions = await self.create_portfolio_positions(db, portfolios[0])

                # 6. Create sample transactions
                print("💰 Creating sample transactions...")
                transactions = await self.create_sample_transactions(db, portfolios[0])

                # 7. Create AI insights
                print("🤖 Creating AI insights...")
                insights = await self.create_ai_insights(db, portfolios[0])

                await db.commit()

                print("✅ Database setup completed successfully!")
                print(f"   - {len(providers)} API providers created")
                print(f"   - {len(users)} users created")
                print(f"   - {len(api_keys)} API keys created")
                print(f"   - {len(portfolios)} portfolios created")
                print(f"   - {len(positions)} positions created")
                print(f"   - {len(transactions)} transactions created")
                print(f"   - {len(insights)} AI insights created")

                return {
                    "providers": providers,
                    "users": users,
                    "api_keys": api_keys,
                    "portfolios": portfolios,
                    "positions": positions,
                    "transactions": transactions,
                    "insights": insights,
                }

        except Exception as e:
            print(f"❌ Error setting up database: {e}")
            raise

    async def create_api_providers(self, db: AsyncSession) -> List[APIProvider]:
        """Create API providers."""
        providers_data = [
            {
                "id": "openai",
                "name": "OpenAI",
                "description": "OpenAI GPT models for AI analysis",
                "category": "ai",
                "website_url": "https://openai.com",
                "docs_url": "https://platform.openai.com/docs/api-reference",
                "key_format": "Bearer token starting with 'sk-'",
                "validation_endpoint": "https://api.openai.com/v1/models",
                "rate_limit_per_minute": 3000,
                "is_active": True,
                "is_premium": True,
            },
            {
                "id": "anthropic",
                "name": "Anthropic",
                "description": "Claude AI models for analysis",
                "category": "ai",
                "website_url": "https://anthropic.com",
                "docs_url": "https://docs.anthropic.com/claude/reference",
                "key_format": "API key starting with 'sk-ant-'",
                "validation_endpoint": "https://api.anthropic.com/v1/messages",
                "rate_limit_per_minute": 1000,
                "is_active": True,
                "is_premium": True,
            },
            {
                "id": "gemini",
                "name": "Google Gemini",
                "description": "Google Gemini AI models",
                "category": "ai",
                "website_url": "https://ai.google.dev",
                "docs_url": "https://ai.google.dev/docs",
                "key_format": "API key starting with 'AIza'",
                "validation_endpoint": "https://generativelanguage.googleapis.com/v1/models",
                "rate_limit_per_minute": 1500,
                "is_active": True,
                "is_premium": False,
            },
            {
                "id": "fmp",
                "name": "Financial Modeling Prep",
                "description": "Comprehensive financial market data",
                "category": "financial",
                "website_url": "https://financialmodelingprep.com",
                "docs_url": "https://financialmodelingprep.com/developer/docs",
                "key_format": "API key string",
                "validation_endpoint": "https://financialmodelingprep.com/api/v3/profile/AAPL",
                "rate_limit_per_minute": 300,
                "is_active": True,
                "is_premium": True,
            },
            {
                "id": "alpha_vantage",
                "name": "Alpha Vantage",
                "description": "Real-time and historical stock data",
                "category": "financial",
                "website_url": "https://www.alphavantage.co",
                "docs_url": "https://www.alphavantage.co/documentation",
                "key_format": "API key string",
                "validation_endpoint": "https://www.alphavantage.co/query",
                "rate_limit_per_minute": 25,
                "is_active": True,
                "is_premium": False,
            },
            {
                "id": "polygon",
                "name": "Polygon.io",
                "description": "Real-time stock market data",
                "category": "financial",
                "website_url": "https://polygon.io",
                "docs_url": "https://polygon.io/docs",
                "key_format": "API key string",
                "validation_endpoint": "https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-01/2023-01-02",
                "rate_limit_per_minute": 1000,
                "is_active": True,
                "is_premium": True,
            },
            {
                "id": "taapi",
                "name": "TAAPI.IO",
                "description": "Technical analysis indicators",
                "category": "data",
                "website_url": "https://taapi.io",
                "docs_url": "https://taapi.io/docs",
                "key_format": "JWT token",
                "validation_endpoint": "https://api.taapi.io/rsi",
                "rate_limit_per_minute": 120,
                "is_active": True,
                "is_premium": True,
            },
            {
                "id": "openrouter",
                "name": "OpenRouter",
                "description": "Access to multiple AI models",
                "category": "ai",
                "website_url": "https://openrouter.ai",
                "docs_url": "https://openrouter.ai/docs",
                "key_format": "API key starting with 'sk-or-'",
                "validation_endpoint": "https://openrouter.ai/api/v1/models",
                "rate_limit_per_minute": 500,
                "is_active": True,
                "is_premium": True,
            },
        ]

        providers = []
        for provider_data in providers_data:
            provider = APIProvider(**provider_data)
            db.add(provider)
            providers.append(provider)

        await db.flush()
        return providers

    async def create_test_users(self, db: AsyncSession) -> List[User]:
        """Create test users."""
        users_data = [
            {
                "email": "test.story2.1@stockpulse.com",
                "password_hash": "$2b$12$test.hash.for.story.2.1.testing",
                "role": "USER",
                "status": "APPROVED",
                "is_active": True,
                "first_name": "Story",
                "last_name": "TwoPointOne",
                "subscription_tier": "PREMIUM",
            },
            {
                "email": "admin.story2.1@stockpulse.com",
                "password_hash": "$2b$12$admin.hash.for.story.2.1.testing",
                "role": "ADMIN",
                "status": "APPROVED",
                "is_active": True,
                "first_name": "Admin",
                "last_name": "User",
                "subscription_tier": "PREMIUM",
            },
        ]

        users = []
        for user_data in users_data:
            user = User(id=uuid.uuid4(), **user_data)
            db.add(user)
            users.append(user)

        await db.flush()
        return users

    async def create_real_api_keys(self, db: AsyncSession, user: User) -> List[APIKey]:
        """Create API keys with real values."""
        api_keys = []

        for provider_id, key_value in REAL_API_KEYS.items():
            # Encrypt the real API key
            encrypted_key = self.encryption.encrypt_key(key_value)
            key_hash = APIKeyEncryption.hash_key(key_value)

            api_key = APIKey(
                id=uuid.uuid4(),
                user_id=user.id,
                provider_id=provider_id,
                name=f"Story 2.1 Test {provider_id.title()} Key",
                description=f"Real {provider_id} API key for Story 2.1 testing",
                encrypted_key=encrypted_key,
                key_hash=key_hash,
                is_active=True,
                is_validated=False,  # Will be validated during tests
                validation_result={},
            )

            db.add(api_key)
            api_keys.append(api_key)

        await db.flush()
        return api_keys

    async def create_sample_portfolios(
        self, db: AsyncSession, user: User
    ) -> List[Portfolio]:
        """Create sample portfolios."""
        portfolios_data = [
            {
                "name": "Tech Growth Portfolio",
                "description": "Portfolio focused on technology growth stocks",
                "cash_balance": Decimal("25000.00"),
                "total_invested": Decimal("75000.00"),
                "total_value": Decimal("82500.00"),
                "total_pnl": Decimal("7500.00"),
                "total_pnl_percentage": Decimal("10.00"),
                "day_pnl": Decimal("1200.00"),
                "day_pnl_percentage": Decimal("1.48"),
            },
            {
                "name": "Dividend Income Portfolio",
                "description": "Portfolio focused on dividend-paying stocks",
                "cash_balance": Decimal("15000.00"),
                "total_invested": Decimal("50000.00"),
                "total_value": Decimal("52000.00"),
                "total_pnl": Decimal("2000.00"),
                "total_pnl_percentage": Decimal("4.00"),
                "day_pnl": Decimal("150.00"),
                "day_pnl_percentage": Decimal("0.29"),
            },
        ]

        portfolios = []
        for portfolio_data in portfolios_data:
            portfolio = Portfolio(id=uuid.uuid4(), user_id=user.id, **portfolio_data)
            db.add(portfolio)
            portfolios.append(portfolio)

        await db.flush()
        return portfolios

    async def create_portfolio_positions(
        self, db: AsyncSession, portfolio: Portfolio
    ) -> List[PortfolioPosition]:
        """Create portfolio positions."""
        positions_data = [
            {
                "symbol": "AAPL",
                "quantity": Decimal("100"),
                "average_cost": Decimal("150.00"),
                "current_price": Decimal("155.00"),
                "market_value": Decimal("15500.00"),
                "unrealized_pnl": Decimal("500.00"),
                "unrealized_pnl_percentage": Decimal("3.33"),
                "weight_percentage": Decimal("18.79"),
            },
            {
                "symbol": "TSLA",
                "quantity": Decimal("50"),
                "average_cost": Decimal("200.00"),
                "current_price": Decimal("220.00"),
                "market_value": Decimal("11000.00"),
                "unrealized_pnl": Decimal("1000.00"),
                "unrealized_pnl_percentage": Decimal("10.00"),
                "weight_percentage": Decimal("13.33"),
            },
            {
                "symbol": "NVDA",
                "quantity": Decimal("25"),
                "average_cost": Decimal("800.00"),
                "current_price": Decimal("850.00"),
                "market_value": Decimal("21250.00"),
                "unrealized_pnl": Decimal("1250.00"),
                "unrealized_pnl_percentage": Decimal("6.25"),
                "weight_percentage": Decimal("25.76"),
            },
            {
                "symbol": "MSFT",
                "quantity": Decimal("75"),
                "average_cost": Decimal("300.00"),
                "current_price": Decimal("320.00"),
                "market_value": Decimal("24000.00"),
                "unrealized_pnl": Decimal("1500.00"),
                "unrealized_pnl_percentage": Decimal("6.67"),
                "weight_percentage": Decimal("29.09"),
            },
            {
                "symbol": "GOOGL",
                "quantity": Decimal("30"),
                "average_cost": Decimal("280.00"),
                "current_price": Decimal("290.00"),
                "market_value": Decimal("8700.00"),
                "unrealized_pnl": Decimal("300.00"),
                "unrealized_pnl_percentage": Decimal("3.57"),
                "weight_percentage": Decimal("10.55"),
            },
        ]

        positions = []
        for position_data in positions_data:
            position = PortfolioPosition(
                id=uuid.uuid4(), portfolio_id=portfolio.id, **position_data
            )
            db.add(position)
            positions.append(position)

        await db.flush()
        return positions

    async def create_sample_transactions(
        self, db: AsyncSession, portfolio: Portfolio
    ) -> List[Transaction]:
        """Create sample transactions."""
        base_date = datetime.utcnow() - timedelta(days=30)

        transactions_data = [
            {
                "symbol": "AAPL",
                "transaction_type": "BUY",
                "quantity": Decimal("100"),
                "price": Decimal("150.00"),
                "fees": Decimal("1.00"),
                "transaction_date": base_date + timedelta(days=1),
            },
            {
                "symbol": "TSLA",
                "transaction_type": "BUY",
                "quantity": Decimal("50"),
                "price": Decimal("200.00"),
                "fees": Decimal("1.00"),
                "transaction_date": base_date + timedelta(days=3),
            },
            {
                "symbol": "NVDA",
                "transaction_type": "BUY",
                "quantity": Decimal("25"),
                "price": Decimal("800.00"),
                "fees": Decimal("2.00"),
                "transaction_date": base_date + timedelta(days=7),
            },
            {
                "symbol": "MSFT",
                "transaction_type": "BUY",
                "quantity": Decimal("50"),
                "price": Decimal("300.00"),
                "fees": Decimal("1.50"),
                "transaction_date": base_date + timedelta(days=10),
            },
            {
                "symbol": "MSFT",
                "transaction_type": "BUY",
                "quantity": Decimal("25"),
                "price": Decimal("300.00"),
                "fees": Decimal("1.00"),
                "transaction_date": base_date + timedelta(days=15),
            },
            {
                "symbol": "GOOGL",
                "transaction_type": "BUY",
                "quantity": Decimal("30"),
                "price": Decimal("280.00"),
                "fees": Decimal("1.50"),
                "transaction_date": base_date + timedelta(days=20),
            },
            {
                "symbol": "AAPL",
                "transaction_type": "DIVIDEND",
                "quantity": Decimal("100"),
                "price": Decimal("0.24"),
                "fees": Decimal("0.00"),
                "transaction_date": base_date + timedelta(days=25),
            },
        ]

        transactions = []
        for transaction_data in transactions_data:
            transaction = Transaction(
                id=uuid.uuid4(), portfolio_id=portfolio.id, **transaction_data
            )
            db.add(transaction)
            transactions.append(transaction)

        await db.flush()
        return transactions

    async def create_ai_insights(
        self, db: AsyncSession, portfolio: Portfolio
    ) -> List[AIPortfolioInsight]:
        """Create AI insights."""
        insights_data = [
            {
                "insight_type": "ANALYSIS",
                "title": "Portfolio Diversification Analysis",
                "content": "Your portfolio shows strong concentration in technology stocks (72%). Consider diversifying into other sectors like healthcare, finance, or consumer goods to reduce sector-specific risk.",
                "confidence": Decimal("0.85"),
                "priority": "medium",
                "action_required": False,
                "metadata": {
                    "tech_concentration": 0.72,
                    "recommended_sectors": ["healthcare", "finance", "consumer_goods"],
                    "risk_level": "medium",
                },
            },
            {
                "insight_type": "RECOMMENDATION",
                "title": "Rebalancing Opportunity",
                "content": "NVDA has grown to 25.76% of your portfolio. Consider taking some profits to maintain target allocation of 20% per position.",
                "confidence": Decimal("0.78"),
                "priority": "high",
                "action_required": True,
                "metadata": {
                    "symbol": "NVDA",
                    "current_weight": 25.76,
                    "target_weight": 20.0,
                    "excess_amount": 4750.00,
                },
            },
            {
                "insight_type": "ALERT",
                "title": "Strong Performance Alert",
                "content": "Your portfolio has outperformed the S&P 500 by 3.2% this month. Great job on stock selection!",
                "confidence": Decimal("0.92"),
                "priority": "low",
                "action_required": False,
                "metadata": {
                    "outperformance": 3.2,
                    "benchmark": "SPY",
                    "period": "1_month",
                },
            },
            {
                "insight_type": "RISK",
                "title": "Volatility Warning",
                "content": "Tesla (TSLA) shows high volatility (45% annualized). Monitor position sizing and consider protective stops.",
                "confidence": Decimal("0.88"),
                "priority": "medium",
                "action_required": True,
                "metadata": {
                    "symbol": "TSLA",
                    "volatility": 45.0,
                    "risk_level": "high",
                    "suggested_action": "protective_stops",
                },
            },
        ]

        insights = []
        for insight_data in insights_data:
            insight = AIPortfolioInsight(
                id=uuid.uuid4(), portfolio_id=portfolio.id, **insight_data
            )
            db.add(insight)
            insights.append(insight)

        await db.flush()
        return insights

    async def cleanup_database(self):
        """Clean up the database."""
        print("🧹 Cleaning up test database...")
        try:
            # In a real scenario, you might want to drop and recreate tables
            # For now, we'll just close the engine
            await self.engine.dispose()
            print("✅ Database cleanup completed")
        except Exception as e:
            print(f"❌ Error cleaning up database: {e}")

    async def verify_setup(self):
        """Verify the database setup."""
        print("🔍 Verifying database setup...")

        try:
            async with self.SessionLocal() as db:
                # Check providers
                providers_count = len(await db.execute("SELECT id FROM api_providers"))
                print(f"   ✓ API Providers: {providers_count}")

                # Check users
                users_count = len(await db.execute("SELECT id FROM users"))
                print(f"   ✓ Users: {users_count}")

                # Check API keys
                keys_count = len(await db.execute("SELECT id FROM api_keys"))
                print(f"   ✓ API Keys: {keys_count}")

                # Check portfolios
                portfolios_count = len(await db.execute("SELECT id FROM portfolios"))
                print(f"   ✓ Portfolios: {portfolios_count}")

                # Check positions
                positions_count = len(
                    await db.execute("SELECT id FROM portfolio_positions")
                )
                print(f"   ✓ Positions: {positions_count}")

                print("✅ Database verification completed successfully!")

        except Exception as e:
            print(f"❌ Error verifying database: {e}")
            raise


async def main():
    """Main function to set up the database."""
    setup = DatabaseSetup()

    try:
        # Setup the complete database
        result = await setup.setup_complete_database()

        # Verify the setup
        await setup.verify_setup()

        print("\n🎉 Story 2.1 database setup completed successfully!")
        print("📝 You can now run the test suite with: pytest tests/story-2.1/")
        print("🚀 Or run specific integration tests to validate the real API keys")

        return result

    except Exception as e:
        print(f"\n💥 Setup failed: {e}")
        raise

    finally:
        await setup.cleanup_database()


if __name__ == "__main__":
    asyncio.run(main())
