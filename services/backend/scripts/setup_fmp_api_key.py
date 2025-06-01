#!/usr/bin/env python3
"""
Setup FMP API Key Script
Securely adds the Financial Modeling Prep API key to the database for the admin user
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent / "app"))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.events import EventBus
from app.models.api_keys import APIProvider
from app.models.user import User
from app.schemas.api_keys import APIKeyCreate, APIProviderCreate
from app.services.api_keys import APIKeyService


async def setup_fmp_provider_and_key():
    """Setup FMP provider and add API key for admin user"""

    # FMP API Key
    FMP_API_KEY = "lHZG8GLLFpcKtHZ4VTGVlYv7aOe0Q7AK"

    async with AsyncSessionLocal() as db:
        try:
            # Initialize services
            event_bus = EventBus()
            api_key_service = APIKeyService(event_bus)

            # Check if FMP provider exists, create if not
            provider_result = await db.execute(
                select(APIProvider).where(APIProvider.id == "fmp")
            )
            fmp_provider = provider_result.scalar_one_or_none()

            if not fmp_provider:
                print("Creating FMP provider...")
                fmp_provider = APIProvider(
                    id="fmp",
                    name="Financial Modeling Prep",
                    description="Real-time and historical financial data API",
                    website_url="https://financialmodelingprep.com",
                    docs_url="https://financialmodelingprep.com/developer/docs",
                    category="financial",
                    key_format="32-character alphanumeric string",
                    validation_endpoint="https://financialmodelingprep.com/api/v3/profile/AAPL",
                    rate_limit_per_minute=250,
                    is_active=True,
                    is_premium=False,
                )
                db.add(fmp_provider)
                await db.commit()
                print("✅ FMP provider created successfully")
            else:
                print("✅ FMP provider already exists")

            # Find admin user
            admin_result = await db.execute(
                select(User).where(User.email == "admin@sp.com")
            )
            admin_user = admin_result.scalar_one_or_none()

            if not admin_user:
                print("❌ Admin user not found. Please create admin user first.")
                return

            print(f"Found admin user: {admin_user.email} (ID: {admin_user.id})")

            # Check if admin already has FMP API key
            existing_key = await api_key_service.get_api_key_for_provider(
                db=db, user_id=admin_user.id, provider_id="fmp"
            )

            if existing_key:
                print("✅ Admin user already has FMP API key configured")
                return

            # Create API key for admin user
            print("Adding FMP API key for admin user...")
            api_key_data = APIKeyCreate(
                provider_id="fmp",
                name="Default FMP API Key",
                description="Financial Modeling Prep API key for StockPulse dashboard",
                key=FMP_API_KEY,
            )

            api_key_response = await api_key_service.create_api_key(
                db=db,
                user_id=admin_user.id,
                api_key_data=api_key_data,
                client_ip="127.0.0.1",
            )

            print(f"✅ FMP API key added successfully (ID: {api_key_response.id})")

            # Validate the API key
            print("Validating FMP API key...")
            validation_result = await api_key_service.validate_api_key(
                db=db, user_id=admin_user.id, api_key_id=api_key_response.id
            )

            if validation_result.is_valid:
                print("✅ FMP API key validation successful")
                if validation_result.response_time_ms:
                    print(f"   Response time: {validation_result.response_time_ms}ms")
                if validation_result.rate_limit_remaining:
                    print(
                        f"   Rate limit remaining: {validation_result.rate_limit_remaining}"
                    )
            else:
                print(
                    f"⚠️  FMP API key validation failed: {validation_result.error_message}"
                )

            print("\n🚀 FMP API key setup completed successfully!")
            print(
                "You can now use the StockPulse dashboard with real Financial Modeling Prep data."
            )

        except Exception as e:
            print(f"❌ Error setting up FMP API key: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    print("🔧 Setting up Financial Modeling Prep API key...")
    asyncio.run(setup_fmp_provider_and_key())
