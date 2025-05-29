"""
Initialize Super Admin User for StockPulse Application.

This script creates a default super admin user with credentials:
- Email: admin
- Password: admin@123
- Role: ADMIN

Run this script once during initial setup.
"""

import asyncio
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.core.database import AsyncSessionLocal, init_database
from app.models.user import UserRole
from app.services.auth.user_service import user_service


async def create_super_admin():
    """Create the super admin user."""
    try:
        # Initialize database
        await init_database()
        print("✅ Database initialized successfully")

        # Create database session
        async with AsyncSessionLocal() as db:
            # Check if admin user already exists
            existing_admin = await user_service.get_user_by_email("admin@sp.com", db)

            if existing_admin:
                print("⚠️  Super admin user already exists!")
                print(f"   Email: admin@sp.com")
                print(f"   Role: {existing_admin.role}")
                print(f"   Created: {existing_admin.created_at}")
                return

            # Create super admin user
            admin_user = await user_service.create_user(
                email="admin@sp.com", password="admin@123", db=db, role=UserRole.ADMIN
            )

            print("🎉 Super admin user created successfully!")
            print(f"   Email: admin@sp.com")
            print(f"   Password: admin@123")
            print(f"   Role: {admin_user.role}")
            print(f"   User ID: {admin_user.id}")
            print(f"   Created: {admin_user.created_at}")
            print("")
            print("⚠️  IMPORTANT: Change the default password after first login!")

    except Exception as e:
        print(f"❌ Error creating super admin user: {e}")
        sys.exit(1)


if __name__ == "__main__":
    print("🚀 StockPulse - Initializing Super Admin User")
    print("=" * 50)

    asyncio.run(create_super_admin())

    print("")
    print("✅ Initialization complete!")
    print("")
    print("Login credentials:")
    print("  Email: admin@sp.com")
    print("  Password: admin@123")
    print("")
    print("🔐 Remember to change the default password!")
