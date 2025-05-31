#!/usr/bin/env python3
"""
Simple script to create user directly in database
"""
import psycopg2
from datetime import datetime
import uuid
import bcrypt

def create_simple_user():
    """Create a simple user directly in the database"""
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="stockpulse", 
            user="postgres",
            password="postgres123"
        )
        cursor = conn.cursor()
        
        # User data
        email = "simple@test.com"
        password = "simple123"
        first_name = "Simple"
        last_name = "User"
        
        # Hash password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        # Generate UUID
        user_id = str(uuid.uuid4())
        
        print(f"🔧 Creating simple user: {email}")
        
        # Insert user
        cursor.execute("""
            INSERT INTO users (
                id, email, password_hash, first_name, last_name, 
                role, status, is_active, created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """, (
            user_id,
            email,
            hashed_password.decode('utf-8'),
            first_name,
            last_name,
            'USER',
            'APPROVED',
            True,
            datetime.utcnow(),
            datetime.utcnow()
        ))
        
        conn.commit()
        print("✅ Simple user created successfully!")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   ID: {user_id}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error creating simple user: {e}")

if __name__ == "__main__":
    create_simple_user() 