#!/usr/bin/env python3
"""
Create an admin user for testing the user approval system.
This script should be run after the database migration.
"""
import asyncio
import os
import sys
from datetime import datetime

# Add the backend app to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "services", "backend"))

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.services.auth.user_service import user_service


async def create_admin_user():
    """Create an admin user for testing."""
    admin_email = "admin@stockpulse.com"
    admin_password = "AdminPass123!"

    print(f"🔧 Creating admin user: {admin_email}")

    try:
        # Get database session
        async for db in get_db():
            # Check if admin already exists
            existing_admin = await user_service.get_user_by_email(admin_email, db)
            if existing_admin:
                print(f"✅ Admin user already exists: {admin_email}")

                # Update to admin role and approved status if needed
                if existing_admin.role != UserRole.ADMIN:
                    existing_admin.role = UserRole.ADMIN
                    existing_admin.status = UserStatus.APPROVED
                    existing_admin.approved_at = datetime.utcnow()
                    await db.commit()
                    print(f"🔄 Updated existing user to admin role")

                return existing_admin

            # Create new admin user
            admin_user = await user_service.create_user(
                email=admin_email, password=admin_password, role=UserRole.ADMIN, db=db
            )

            # Set admin as approved
            admin_user.status = UserStatus.APPROVED
            admin_user.approved_at = datetime.utcnow()
            admin_user.approved_by = admin_user.id  # Self-approved

            await db.commit()
            await db.refresh(admin_user)

            print(f"✅ Admin user created successfully!")
            print(f"📧 Email: {admin_email}")
            print(f"🔑 Password: {admin_password}")
            print(f"🛡️ Role: {admin_user.role}")
            print(f"✅ Status: {admin_user.status}")
            print(f"🆔 ID: {admin_user.id}")

            return admin_user

    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        raise


if __name__ == "__main__":
    print("🚀 StockPulse Admin User Creation Script")
    print("=" * 50)

    try:
        asyncio.run(create_admin_user())
        print("\n🎉 Admin user setup completed!")
        print("\n📝 Next steps:")
        print("1. Start the backend server")
        print("2. Login with the admin credentials")
        print("3. Navigate to /admin/user-approval to manage registrations")

    except Exception as e:
        print(f"\n💥 Script failed: {e}")
        sys.exit(1)
