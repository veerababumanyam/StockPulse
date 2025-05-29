#!/usr/bin/env python3
"""
Quick test script for admin approval functionality.
Run this after setting up the database and creating admin user.
"""
import asyncio
import sys
import os
from datetime import datetime

# Add the backend app to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'backend'))

from app.core.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.services.auth.user_service import user_service
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


async def test_admin_approval_workflow():
    """Test the complete admin approval workflow."""
    print("🧪 Testing Admin Approval Workflow")
    print("=" * 50)
    
    try:
        async for db in get_db():
            # Test 1: Create a test user in pending status
            print("\n1️⃣ Testing user creation with pending status...")
            try:
                test_user = await user_service.create_user(
                    email="test@example.com",
                    password="TestPass123!",
                    db=db
                )
                
                if test_user.status == UserStatus.PENDING:
                    print("✅ User created with pending status")
                else:
                    print(f"❌ User created with wrong status: {test_user.status}")
                    return False
                    
            except ValueError as e:
                if "already exists" in str(e):
                    print("ℹ️ Test user already exists, using existing one")
                    test_user = await user_service.get_user_by_email("test@example.com", db)
                else:
                    raise
            
            # Test 2: Verify pending user cannot login
            print("\n2️⃣ Testing pending user login restriction...")
            if test_user.can_login():
                print("❌ Pending user can login (should not be able to)")
                return False
            else:
                print("✅ Pending user cannot login")
            
            # Test 3: Get admin user
            print("\n3️⃣ Testing admin user exists...")
            admin_user = await user_service.get_user_by_email("admin@stockpulse.com", db)
            if not admin_user:
                print("❌ Admin user not found. Run create_admin_user.py first")
                return False
            
            if not admin_user.is_admin():
                print("❌ Admin user does not have admin role")
                return False
            
            print("✅ Admin user exists and has admin role")
            
            # Test 4: Test get pending users
            print("\n4️⃣ Testing get pending users...")
            pending_users = await user_service.get_pending_users(db)
            test_user_found = any(user.email == "test@example.com" for user in pending_users)
            
            if test_user_found:
                print(f"✅ Found {len(pending_users)} pending user(s)")
            else:
                print("❌ Test user not found in pending users list")
                return False
            
            # Test 5: Test user approval
            print("\n5️⃣ Testing user approval...")
            try:
                approved_user = await user_service.approve_user(
                    str(test_user.id),
                    str(admin_user.id),
                    db
                )
                
                if approved_user.status == UserStatus.APPROVED:
                    print("✅ User approved successfully")
                    print(f"   - Status: {approved_user.status}")
                    print(f"   - Approved at: {approved_user.approved_at}")
                    print(f"   - Approved by: {approved_user.approved_by}")
                else:
                    print(f"❌ User approval failed. Status: {approved_user.status}")
                    return False
                    
            except Exception as e:
                print(f"❌ User approval failed: {e}")
                return False
            
            # Test 6: Verify approved user can login
            print("\n6️⃣ Testing approved user can login...")
            if approved_user.can_login():
                print("✅ Approved user can login")
            else:
                print("❌ Approved user cannot login")
                return False
            
            # Test 7: Test user rejection (create another test user)
            print("\n7️⃣ Testing user rejection...")
            try:
                reject_user = await user_service.create_user(
                    email="reject@example.com",
                    password="TestPass123!",
                    db=db
                )
                print("   Created user for rejection test")
            except ValueError:
                reject_user = await user_service.get_user_by_email("reject@example.com", db)
                print("   Using existing user for rejection test")
            
            try:
                rejected_user = await user_service.reject_user(
                    str(reject_user.id),
                    str(admin_user.id),
                    "Test rejection",
                    db
                )
                
                if rejected_user.status == UserStatus.REJECTED:
                    print("✅ User rejected successfully")
                    print(f"   - Status: {rejected_user.status}")
                    print(f"   - Rejection reason: {rejected_user.rejection_reason}")
                else:
                    print(f"❌ User rejection failed. Status: {rejected_user.status}")
                    return False
                    
            except Exception as e:
                print(f"❌ User rejection failed: {e}")
                return False
            
            # Test 8: Verify rejected user cannot login
            print("\n8️⃣ Testing rejected user cannot login...")
            if not rejected_user.can_login():
                print("✅ Rejected user cannot login")
            else:
                print("❌ Rejected user can login (should not be able to)")
                return False
            
            # Cleanup test users
            print("\n🧹 Cleaning up test users...")
            try:
                # Note: In production, you might want to soft delete instead
                await db.delete(approved_user)
                await db.delete(rejected_user)
                await db.commit()
                print("✅ Test users cleaned up")
            except Exception as e:
                print(f"⚠️ Cleanup warning: {e}")
            
            print("\n🎉 All tests passed! Admin approval workflow is working correctly.")
            return True
            
    except Exception as e:
        print(f"\n💥 Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def verify_database_schema():
    """Verify that the database schema has the required columns."""
    print("\n🔍 Verifying database schema...")
    
    try:
        async for db in get_db():
            # Check if we can query the new fields
            result = await db.execute(
                text("SELECT column_name FROM information_schema.columns "
                     "WHERE table_name = 'users' AND column_name IN ('status', 'approved_at', 'approved_by', 'rejection_reason')")
            )
            columns = [row[0] for row in result.fetchall()]
            
            required_columns = ['status', 'approved_at', 'approved_by', 'rejection_reason']
            missing_columns = [col for col in required_columns if col not in columns]
            
            if missing_columns:
                print(f"❌ Missing database columns: {missing_columns}")
                print("   Please run the database migration first:")
                print("   psql -d stockpulse -f services/backend/migrations/add_user_approval_fields.sql")
                return False
            else:
                print("✅ Database schema is correct")
                return True
                
    except Exception as e:
        print(f"❌ Database schema check failed: {e}")
        return False


if __name__ == "__main__":
    print("🚀 StockPulse Admin Approval Test Suite")
    print("=" * 50)
    
    async def run_tests():
        # First verify database schema
        schema_ok = await verify_database_schema()
        if not schema_ok:
            sys.exit(1)
        
        # Then run the workflow tests
        success = await test_admin_approval_workflow()
        
        if success:
            print("\n✅ ALL TESTS PASSED")
            print("\n📝 Next steps:")
            print("1. Start the backend server: cd services/backend && python -m uvicorn main:app --reload")
            print("2. Start the frontend: npm start")
            print("3. Test the UI workflow using the testing plan in docs/testing/")
        else:
            print("\n❌ TESTS FAILED")
            sys.exit(1)
    
    try:
        asyncio.run(run_tests())
    except Exception as e:
        print(f"\n💥 Test suite failed: {e}")
        sys.exit(1) 