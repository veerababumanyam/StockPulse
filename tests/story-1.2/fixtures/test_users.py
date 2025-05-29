"""
Test user data fixtures for Story 1.2 login testing
"""
from datetime import datetime, timedelta
import bcrypt

# Test user database structure
TEST_USERS = {
    "testuser@example.com": {
        "id": "test-user-id-1",
        "email": "testuser@example.com",
        "password_hash": bcrypt.hashpw("Password123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": True,
        "created_at": datetime.now() - timedelta(days=30),
        "failed_attempts": 0,
        "locked_until": None,
        "description": "Active test user for successful login scenarios"
    },
    "inactive@example.com": {
        "id": "test-user-id-2", 
        "email": "inactive@example.com",
        "password_hash": bcrypt.hashpw("Password123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": False,
        "created_at": datetime.now() - timedelta(days=60),
        "failed_attempts": 0,
        "locked_until": None,
        "description": "Inactive user for testing account deactivation handling"
    },
    "locked@example.com": {
        "id": "test-user-id-3",
        "email": "locked@example.com", 
        "password_hash": bcrypt.hashpw("Password123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": True,
        "created_at": datetime.now() - timedelta(days=15),
        "failed_attempts": 6,
        "locked_until": datetime.now() + timedelta(minutes=30),
        "description": "Locked user for testing account lockout scenarios"
    },
    "admin@example.com": {
        "id": "test-admin-id-1",
        "email": "admin@example.com",
        "password_hash": bcrypt.hashpw("AdminPass123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": True,
        "created_at": datetime.now() - timedelta(days=90),
        "failed_attempts": 0,
        "locked_until": None,
        "role": "admin",
        "description": "Admin user for testing privileged operations"
    }
}

# Test credentials for easy access in tests
VALID_CREDENTIALS = {
    "email": "testuser@example.com",
    "password": "Password123!"
}

INVALID_CREDENTIALS = {
    "email": "invalid@example.com", 
    "password": "wrongpassword"
}

INACTIVE_USER_CREDENTIALS = {
    "email": "inactive@example.com",
    "password": "Password123!"
}

LOCKED_USER_CREDENTIALS = {
    "email": "locked@example.com",
    "password": "Password123!"
}

ADMIN_CREDENTIALS = {
    "email": "admin@example.com",
    "password": "AdminPass123!"
}

# Password variations for testing
WEAK_PASSWORDS = [
    "123",
    "password",
    "abc",
    "test",
    "admin"
]

INVALID_EMAILS = [
    "notanemail",
    "@example.com",
    "test@",
    "test..test@example.com",
    "test@example",
    ""
]

# Common test scenarios
TEST_SCENARIOS = {
    "valid_login": {
        "credentials": VALID_CREDENTIALS,
        "expected_status": 200,
        "expected_outcome": "success"
    },
    "invalid_email": {
        "credentials": {"email": "invalid@example.com", "password": "Password123!"},
        "expected_status": 401,
        "expected_outcome": "invalid_credentials"
    },
    "invalid_password": {
        "credentials": {"email": "testuser@example.com", "password": "wrongpassword"},
        "expected_status": 401,
        "expected_outcome": "invalid_credentials"
    },
    "inactive_account": {
        "credentials": INACTIVE_USER_CREDENTIALS,
        "expected_status": 403,
        "expected_outcome": "account_deactivated"
    },
    "locked_account": {
        "credentials": LOCKED_USER_CREDENTIALS,
        "expected_status": 423,
        "expected_outcome": "account_locked"
    },
    "empty_email": {
        "credentials": {"email": "", "password": "Password123!"},
        "expected_status": 422,
        "expected_outcome": "validation_error"
    },
    "empty_password": {
        "credentials": {"email": "testuser@example.com", "password": ""},
        "expected_status": 422,
        "expected_outcome": "validation_error"
    }
}

def get_test_user_by_email(email: str):
    """Get test user data by email."""
    return TEST_USERS.get(email)

def create_test_user(email: str, password: str, is_active: bool = True, **kwargs):
    """Create a new test user."""
    user_data = {
        "id": f"test-user-{len(TEST_USERS) + 1}",
        "email": email,
        "password_hash": bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": is_active,
        "created_at": datetime.now(),
        "failed_attempts": 0,
        "locked_until": None,
        **kwargs
    }
    TEST_USERS[email] = user_data
    return user_data

def reset_user_lockout(email: str):
    """Reset user lockout status for testing."""
    if email in TEST_USERS:
        TEST_USERS[email]["failed_attempts"] = 0
        TEST_USERS[email]["locked_until"] = None

def lock_user_account(email: str, duration_minutes: int = 30):
    """Lock user account for testing."""
    if email in TEST_USERS:
        TEST_USERS[email]["failed_attempts"] = 5
        TEST_USERS[email]["locked_until"] = datetime.now() + timedelta(minutes=duration_minutes)

def deactivate_user(email: str):
    """Deactivate user for testing."""
    if email in TEST_USERS:
        TEST_USERS[email]["is_active"] = False

def activate_user(email: str):
    """Activate user for testing."""
    if email in TEST_USERS:
        TEST_USERS[email]["is_active"] = True 