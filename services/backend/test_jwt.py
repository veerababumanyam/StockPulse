import asyncio
import os
import sys

sys.path.append("services/backend/app")

from app.core.config import get_settings
from app.services.auth.jwt_service import jwt_service


async def test_jwt():
    try:
        settings = get_settings()
        print(f"🔧 Configuration check:")
        print(f"   SECRET_KEY: {settings.SECRET_KEY[:10]}...")
        print(f"   ALGORITHM: {settings.ALGORITHM}")
        print(f"   ACCESS_TOKEN_EXPIRE_MINUTES: {settings.ACCESS_TOKEN_EXPIRE_MINUTES}")
        print(f"   JWT_SECRET_KEY from env: {os.getenv('JWT_SECRET_KEY', 'NOT SET')}")
        print()

        # Test JWT token creation
        token_data = {"sub": "test-user-id", "email": "admin@sp.com"}

        try:
            access_token = jwt_service.create_access_token(token_data)
            print(f"✅ Access token created successfully")
            print(f"   Token length: {len(access_token)}")
            print(f"   Token preview: {access_token[:50]}...")

            refresh_token = jwt_service.create_refresh_token(token_data)
            print(f"✅ Refresh token created successfully")
            print(f"   Token length: {len(refresh_token)}")

            # Test token verification
            payload = jwt_service.verify_token(access_token)
            if payload:
                print(f"✅ Token verification successful")
                print(f"   Payload: {payload}")
            else:
                print(f"❌ Token verification failed")

        except Exception as e:
            print(f"❌ JWT token creation failed: {e}")
            import traceback

            traceback.print_exc()

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_jwt())
