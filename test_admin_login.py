#!/usr/bin/env python3
"""
Test admin login with admin@sp.com / admin@123 credentials
"""
import requests
import json
import psycopg2
from datetime import datetime

def activate_admin_user():
    """Activate the admin user directly in the database"""
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
        
        print("🔧 Activating admin user in database...")
        
        # Update admin user status
        cursor.execute("""
            UPDATE users 
            SET status = 'APPROVED', 
                is_active = true, 
                approved_at = %s,
                approved_by = id
            WHERE email = 'admin@sp.com'
        """, (datetime.utcnow(),))
        
        conn.commit()
        print("✅ Admin user activated successfully!")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error activating admin user: {e}")

def test_admin_login():
    """Test admin login via API"""
    
    # Test credentials
    credentials = {
        "email": "admin@sp.com",
        "password": "admin@123"
    }
    
    # API endpoint
    login_url = "http://localhost:8000/api/v1/auth/login"
    
    try:
        print("🧪 Testing Admin Login")
        print(f"Email: {credentials['email']}")
        print(f"Password: {'*' * len(credentials['password'])}")
        print(f"URL: {login_url}")
        print("-" * 50)
        
        # Make login request
        response = requests.post(
            login_url,
            json=credentials,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ LOGIN SUCCESSFUL!")
            print(f"User ID: {data.get('user', {}).get('id')}")
            print(f"Email: {data.get('user', {}).get('email')}")
            print(f"Role: {data.get('user', {}).get('role', 'Not specified')}")
            print(f"Message: {data.get('message')}")
            print(f"CSRF Token: {data.get('csrf_token', 'Not provided')[:20]}...")
            
        elif response.status_code == 403:
            print("❌ LOGIN FAILED - 403 Forbidden")
            print("This could mean:")
            print("- User account is deactivated")
            print("- User doesn't have permission")
            print("- Account is pending approval")
            print()
            print("🔧 Attempting to activate admin user...")
            activate_admin_user()
            print()
            print("🔄 Retrying login...")
            return test_admin_login()  # Retry after activation
            
        elif response.status_code == 401:
            print("❌ LOGIN FAILED - 401 Unauthorized")
            print("This could mean:")
            print("- Invalid email/password")
            print("- User doesn't exist")
            try:
                error_data = response.json()
                print(f"Error: {error_data}")
            except:
                print(f"Response: {response.text}")
                
        elif response.status_code == 404:
            print("❌ LOGIN FAILED - 404 Not Found")
            print("The authentication endpoint doesn't exist")
            print("Check if the backend service is running")
            
        else:
            print(f"❌ LOGIN FAILED - {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data}")
            except:
                print(f"Response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR")
        print("Cannot connect to backend service on port 8000")
        print("Make sure the backend service is running")
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")

if __name__ == "__main__":
    test_admin_login() 