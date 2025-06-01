#!/usr/bin/env python3
"""
Simple script to activate admin user directly via database connection
"""
import uuid
from datetime import datetime

import psycopg2


def activate_admin():
    """Activate the admin user directly in the database"""
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="stockpulse",
            user="postgres",
            password="postgres123",
        )
        cursor = conn.cursor()

        print("🔍 Checking admin user status...")

        # Check current user status
        cursor.execute(
            """
            SELECT id, email, role, status, is_active, approved_at, created_at
            FROM users
            WHERE email = 'admin@sp.com'
        """
        )

        user = cursor.fetchone()
        if not user:
            print("❌ Admin user not found in database")
            return False

        user_id, email, role, status, is_active, approved_at, created_at = user
        print(f"📋 Current admin user status:")
        print(f"   ID: {user_id}")
        print(f"   Email: {email}")
        print(f"   Role: {role}")
        print(f"   Status: {status}")
        print(f"   Is Active: {is_active}")
        print(f"   Approved At: {approved_at}")
        print(f"   Created: {created_at}")
        print()

        if status == "APPROVED":
            print("✅ Admin user is already activated!")
            return True

        print("🔧 Activating admin user...")

        # Update admin user status to approved
        cursor.execute(
            """
            UPDATE users
            SET status = 'APPROVED',
                is_active = true,
                approved_at = %s,
                approved_by = id,
                rejection_reason = NULL,
                updated_at = %s
            WHERE email = 'admin@sp.com'
        """,
            (datetime.utcnow(), datetime.utcnow()),
        )

        affected_rows = cursor.rowcount
        conn.commit()

        if affected_rows > 0:
            print("✅ Admin user activated successfully!")

            # Verify the update
            cursor.execute(
                """
                SELECT status, is_active, approved_at
                FROM users
                WHERE email = 'admin@sp.com'
            """
            )

            updated_user = cursor.fetchone()
            if updated_user:
                status, is_active, approved_at = updated_user
                print(f"   New Status: {status}")
                print(f"   Is Active: {is_active}")
                print(f"   Approved At: {approved_at}")
                print()
                print("🎉 Admin user is now ready for login!")
                print("   Email: admin@sp.com")
                print("   Password: admin@123")
                return True
        else:
            print("❌ No rows were updated")
            return False

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error activating admin user: {e}")
        return False


if __name__ == "__main__":
    print("🚀 StockPulse - Admin User Activation")
    print("=" * 40)
    success = activate_admin()
    if success:
        print("\n✅ Activation completed successfully!")
    else:
        print("\n❌ Activation failed!")
