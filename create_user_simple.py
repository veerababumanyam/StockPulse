#!/usr/bin/env python3
"""
Simple user creation script for SQLite testing
"""
import asyncio
import sqlite3
import bcrypt
import uuid
from datetime import datetime

async def create_test_user():
    """Create a test user directly in SQLite."""
    try:
        # Connect to SQLite database
        conn = sqlite3.connect('stockpulse.db')
        cursor = conn.cursor()
        
        # Create users table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'USER',
                status TEXT DEFAULT 'APPROVED',
                is_active BOOLEAN DEFAULT TRUE,
                first_name TEXT,
                last_name TEXT,
                subscription_tier TEXT DEFAULT 'FREE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email = ?", ('admin@sp.com',))
        if cursor.fetchone():
            print("✅ Test user admin@sp.com already exists")
            conn.close()
            return
            
        # Hash the password
        password = "password123"
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        # Create test user
        user_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO users (id, email, password_hash, role, status, is_active, first_name, last_name, subscription_tier)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, 'admin@sp.com', password_hash, 'ADMIN', 'APPROVED', True, 'Admin', 'User', 'PREMIUM'))
        
        conn.commit()
        conn.close()
        
        print("✅ Test user created successfully!")
        print("   Email: admin@sp.com")
        print("   Password: password123")
        print("   Role: ADMIN")
        print("   Status: APPROVED")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(create_test_user()) 