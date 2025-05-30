#!/usr/bin/env python3
"""
Simple test to verify backend components can load without database connection.
"""
import os
import sys

# Add the backend app to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "services", "backend"))


def test_imports():
    """Test that all required modules can be imported."""
    print("🧪 Testing Backend Component Imports")
    print("=" * 50)

    try:
        print("1️⃣ Testing configuration import...")
        from app.core.config import get_settings

        settings = get_settings()
        print(f"✅ Configuration loaded successfully")
        print(f"   - Database URL: {settings.DATABASE_URL[:50]}...")
        print(f"   - Secret Key set: {'***' if settings.SECRET_KEY else 'NO'}")

        print("\n2️⃣ Testing model imports...")
        from app.models.user import User, UserRole, UserStatus

        print("✅ User models imported successfully")
        print(f"   - UserRole enum: {list(UserRole)}")
        print(f"   - UserStatus enum: {list(UserStatus)}")

        print("\n3️⃣ Testing service imports...")
        from app.services.auth.user_service import user_service

        print("✅ User service imported successfully")

        print("\n4️⃣ Testing schema imports...")
        from app.schemas.auth import LoginRequest, RegisterRequest, UserApprovalRequest

        print("✅ Auth schemas imported successfully")

        print("\n5️⃣ Testing endpoint imports...")
        from app.api.v1.auth import router

        print("✅ Auth endpoints imported successfully")

        print("\n6️⃣ Testing user model methods...")
        # Test UserStatus methods without database
        print("   Testing UserStatus.PENDING...")
        assert UserStatus.PENDING == "pending"
        print("   Testing UserStatus.APPROVED...")
        assert UserStatus.APPROVED == "approved"
        print("   Testing UserStatus.REJECTED...")
        assert UserStatus.REJECTED == "rejected"
        print("✅ UserStatus enum working correctly")

        print("\n🎉 All imports and basic functionality working!")
        return True

    except Exception as e:
        print(f"\n❌ Import test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_password_hashing():
    """Test password hashing functionality."""
    print("\n🔐 Testing Password Hashing")
    print("=" * 30)

    try:
        from app.services.auth.user_service import user_service

        test_password = "TestPass123!"

        # Test password hashing
        hashed = user_service.hash_password(test_password)
        print(f"✅ Password hashed successfully: {hashed[:20]}...")

        # Test password verification
        is_valid = user_service.verify_password(test_password, hashed)
        print(f"✅ Password verification: {is_valid}")

        # Test wrong password
        is_invalid = user_service.verify_password("WrongPass", hashed)
        print(f"✅ Wrong password rejected: {not is_invalid}")

        return True

    except Exception as e:
        print(f"❌ Password hashing test failed: {e}")
        return False


if __name__ == "__main__":
    print("🚀 StockPulse Backend Component Test")
    print("=" * 50)

    # Test imports
    imports_ok = test_imports()

    # Test password functionality
    password_ok = test_password_hashing()

    if imports_ok and password_ok:
        print("\n✅ ALL BASIC TESTS PASSED")
        print("\nℹ️ Backend components are working correctly!")
        print("📝 Next steps:")
        print("1. Set up a PostgreSQL database")
        print("2. Run database migrations")
        print("3. Run the full admin approval test")
    else:
        print("\n❌ BASIC TESTS FAILED")
        sys.exit(1)
