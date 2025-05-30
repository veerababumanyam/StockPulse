"""
Initialize Super Admin User for StockPulse Application.

This script creates a default super admin user with credentials:
- Email: admin@sp.com
- Password: admin@123
- Role: ADMIN
- Status: APPROVED (auto-activated)

Run this script once during initial setup.
"""

import asyncio
import sys
from datetime import datetime
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.core.database import AsyncSessionLocal, init_database
from app.models.user import User, UserRole, UserStatus
from app.services.auth.user_service import user_service


async def create_super_admin():
    """Create the super admin user with auto-activation."""
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
                print(f"   Status: {existing_admin.status}")
                print(f"   Is Active: {existing_admin.is_active}")
                print(f"   Can Login: {existing_admin.can_login()}")
                print(f"   Created: {existing_admin.created_at}")
                
                # If user exists but is not approved, activate them
                if existing_admin.status != UserStatus.APPROVED:
                    print("🔧 Activating existing admin user...")
                    existing_admin.status = UserStatus.APPROVED
                    existing_admin.is_active = True
                    existing_admin.approved_at = datetime.utcnow()
                    existing_admin.approved_by = existing_admin.id  # Self-approved for admin
                    existing_admin.rejection_reason = None  # Clear any rejection reason
                    
                    await db.commit()
                    await db.refresh(existing_admin)
                    
                    print("✅ Admin user activated successfully!")
                    print(f"   Status: {existing_admin.status}")
                    print(f"   Is Active: {existing_admin.is_active}")
                    print(f"   Can Login: {existing_admin.can_login()}")
                    print(f"   Approved At: {existing_admin.approved_at}")
                else:
                    print("✅ Admin user is already activated!")
                
                return

            # Create super admin user with auto-activation
            print("🚀 Creating new super admin user...")
            
            # Hash the password
            password_hash = user_service.hash_password("admin@123")
            current_time = datetime.utcnow()
            
            # Create user with APPROVED status and activation details
            admin_user = User(
                email="admin@sp.com",
                password_hash=password_hash,
                role=UserRole.ADMIN,
                status=UserStatus.APPROVED,  # Pre-approved
                is_active=True,
                approved_at=current_time,
                created_at=current_time,
                updated_at=current_time
            )
            
            db.add(admin_user)
            await db.flush()  # Get the ID before commit
            
            # Set approved_by to self for admin user
            admin_user.approved_by = admin_user.id
            
            await db.commit()
            await db.refresh(admin_user)

            print("🎉 Super admin user created and activated successfully!")
            print(f"   Email: admin@sp.com")
            print(f"   Password: admin@123")
            print(f"   Role: {admin_user.role}")
            print(f"   Status: {admin_user.status}")
            print(f"   Is Active: {admin_user.is_active}")
            print(f"   Can Login: {admin_user.can_login()}")
            print(f"   User ID: {admin_user.id}")
            print(f"   Created: {admin_user.created_at}")
            print(f"   Approved At: {admin_user.approved_at}")
            print("")
            print("⚠️  IMPORTANT: Change the default password after first login!")

    except Exception as e:
        print(f"❌ Error creating super admin user: {e}")
        import traceback
        traceback.print_exc()
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
    print("  Status: APPROVED (Ready to login)")
    print("")
    print("🔐 Remember to change the default password!")
