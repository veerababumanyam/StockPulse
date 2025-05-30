#!/usr/bin/env python3
"""
Create a test user for login testing
"""
import asyncio
import sys
import os
from pathlib import Path

# Add the services/backend directory to the Python path
backend_path = Path(__file__).parent / "services" / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session_maker
from app.models.user import User, UserRole, UserStatus
from app.services.auth.security_service import security_service
import uuid

async def create_test_user():
    """Create a test user with known credentials."""
    try:
        async with async_session_maker() as db:
            # Check if user already exists
            existing_user = await db.execute(
                "SELECT * FROM users WHERE email = 'admin@sp.com'"
            )
            if existing_user.first():
                print("✅ Test user admin@sp.com already exists")
                return

            # Hash the password
            password_hash = security_service.hash_password("password123")
            
            # Create test user
            test_user = User(
                id=uuid.uuid4(),
                email="admin@sp.com",
                password_hash=password_hash,
                role=UserRole.ADMIN,
                status=UserStatus.APPROVED,
                is_active=True,
                first_name="Admin",
                last_name="User",
                subscription_tier="PREMIUM"
            )
            
            db.add(test_user)
            await db.commit()
            
            print("✅ Test user created successfully!")
            print("   Email: admin@sp.com")
            print("   Password: password123")
            print("   Role: ADMIN")
            print("   Status: APPROVED")
            
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(create_test_user()) 