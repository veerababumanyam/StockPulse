import asyncio
import sys

sys.path.append("services/backend/app")

from datetime import datetime

from app.core.database import AsyncSessionLocal
from app.models.user import UserStatus
from app.services.auth.user_service import user_service


async def fix_admin_user():
    try:
        async with AsyncSessionLocal() as db:
            user = await user_service.get_user_by_email("admin@sp.com", db)

            if user:
                print(f"📋 Current admin user status:")
                print(f"   Email: {user.email}")
                print(f"   Role: {user.role}")
                print(f"   Status: {user.status}")
                print(f"   Is Active: {user.is_active}")
                print(f"   Can Login: {user.can_login()}")
                print()

                # Update user to approved status
                user.status = UserStatus.APPROVED
                user.is_active = True
                user.approved_at = datetime.utcnow()
                user.approved_by = user.id  # Self-approved for admin

                await db.commit()
                await db.refresh(user)

                print(f"✅ Admin user updated successfully!")
                print(f"   Status: {user.status}")
                print(f"   Is Active: {user.is_active}")
                print(f"   Can Login: {user.can_login()}")
                print(f"   Approved At: {user.approved_at}")

            else:
                print("❌ Admin user not found")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(fix_admin_user())
