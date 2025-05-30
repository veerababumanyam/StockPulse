import asyncio
import sys

sys.path.append("services/backend/app")

from app.core.database import AsyncSessionLocal
from app.services.auth.jwt_service import jwt_service
from app.services.auth.user_service import user_service


async def test_session():
    try:
        async with AsyncSessionLocal() as db:
            # Get user
            user = await user_service.get_user_by_email("admin@sp.com", db)
            if not user:
                print("❌ User not found")
                return

            print(f"✅ User found: {user.email}")

            # Create tokens
            token_data = {"sub": str(user.id), "email": user.email}
            access_token = jwt_service.create_access_token(token_data)
            refresh_token = jwt_service.create_refresh_token(token_data)

            print(f"✅ Tokens created")

            # Test session creation
            try:
                session = await user_service.create_user_session(
                    str(user.id),
                    access_token,
                    refresh_token,
                    "127.0.0.1",
                    "test-user-agent",
                    db,
                )
                print(f"✅ Session created successfully")
                print(f"   Session ID: {session.id}")
                print(f"   Session token: {session.session_token[:20]}...")

            except Exception as e:
                print(f"❌ Session creation failed: {e}")
                import traceback

                traceback.print_exc()

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_session())
