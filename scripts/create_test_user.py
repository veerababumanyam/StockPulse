#!/usr/bin/env python3
"""
Create test user for StockPulse application
"""
import requests
import json

def create_test_user():
    """Create a test user via the registration API"""
    
    # Test user data
    user_data = {
        "email": "test@stockpulse.com",
        "password": "test123",
        "first_name": "Test",
        "last_name": "User",
        "phone": "+1234567890"
    }
    
    # API endpoint
    register_url = "http://localhost:8000/api/v1/auth/register"
    
    try:
        print("🧪 Creating Test User")
        print(f"Email: {user_data['email']}")
        print(f"Name: {user_data['first_name']} {user_data['last_name']}")
        print(f"URL: {register_url}")
        print("-" * 50)
        
        # Make registration request
        response = requests.post(
            register_url,
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print("✅ USER CREATED SUCCESSFULLY!")
            print(f"User ID: {data.get('user', {}).get('id')}")
            print(f"Email: {data.get('user', {}).get('email')}")
            print(f"Status: {data.get('user', {}).get('status', 'Unknown')}")
            print(f"Message: {data.get('message')}")
            
        else:
            print(f"❌ USER CREATION FAILED - {response.status_code}")
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
    create_test_user() 