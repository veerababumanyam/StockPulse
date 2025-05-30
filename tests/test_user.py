import asyncio
import sys

sys.path.append("services/backend/app")

from app.core.database import AsyncSessionLocal
from app.services.auth.user_service import user_service


async def test_auth():
    try:
        async with AsyncSessionLocal() as db:
            # Test get user
            user = await user_service.get_user_by_email("admin@sp.com", db)
            if user:
                print(f"✅ User found: {user.email}")
                print(f"   Can login: {user.can_login()}")
                print(f"   Status: {user.status}")
                print(f"   Is active: {user.is_active}")

                # Test password verification
                result = await user_service.authenticate_user(
                    "admin@sp.com", "admin@123", db
                )
                if result:
                    print(f"✅ Authentication successful")
                    print(f"   User ID: {result.id}")
                else:
                    print(f"❌ Authentication failed")
            else:
                print("❌ User not found")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_auth())
