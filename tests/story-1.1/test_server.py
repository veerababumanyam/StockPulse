#!/usr/bin/env python3
"""
Simplified test server for Story 1.2 login testing
"""
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import FastAPI, HTTPException, status, Response, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import jwt
import bcrypt

# Configuration
SECRET_KEY = "test-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title="StockPulse Authentication Test Server",
    description="Test server for Story 1.2 login flow testing",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Rate limit handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Models
class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime
    last_login: datetime

class LoginResponse(BaseModel):
    user: UserResponse
    message: str
    csrf_token: str

# Test user database (in-memory for testing)
TEST_USERS = {
    "testuser@example.com": {
        "id": "test-user-id-1",
        "email": "testuser@example.com",
        "password_hash": bcrypt.hashpw("Password123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": True,
        "created_at": datetime.now() - timedelta(days=30),
        "failed_attempts": 0,
        "locked_until": None
    },
    "inactive@example.com": {
        "id": "test-user-id-2", 
        "email": "inactive@example.com",
        "password_hash": bcrypt.hashpw("Password123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": False,
        "created_at": datetime.now() - timedelta(days=60),
        "failed_attempts": 0,
        "locked_until": None
    },
    "locked@example.com": {
        "id": "test-user-id-3",
        "email": "locked@example.com", 
        "password_hash": bcrypt.hashpw("Password123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": True,
        "created_at": datetime.now() - timedelta(days=15),
        "failed_attempts": 6,
        "locked_until": datetime.now() + timedelta(minutes=30)
    }
}

# Failed attempts tracking (in-memory)
failed_attempts_tracker = {}
ip_blocks = {}

def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_csrf_token():
    """Generate CSRF token"""
    return hashlib.sha256(f"{time.time()}{SECRET_KEY}".encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def is_ip_blocked(ip: str) -> bool:
    """Check if IP is blocked"""
    if ip in ip_blocks:
        if datetime.now() < ip_blocks[ip]:
            return True
        else:
            del ip_blocks[ip]
    return False

def is_account_locked(email: str) -> bool:
    """Check if account is locked"""
    if email in TEST_USERS:
        user = TEST_USERS[email]
        if user.get("locked_until") and datetime.now() < user["locked_until"]:
            return True
        elif user.get("locked_until") and datetime.now() >= user["locked_until"]:
            # Unlock account
            user["locked_until"] = None
            user["failed_attempts"] = 0
    return False

def record_failed_attempt(email: str, ip: str):
    """Record failed login attempt"""
    # Track by email
    if email in TEST_USERS:
        TEST_USERS[email]["failed_attempts"] += 1
        if TEST_USERS[email]["failed_attempts"] >= 5:
            TEST_USERS[email]["locked_until"] = datetime.now() + timedelta(minutes=30)
    
    # Track by IP
    if ip not in failed_attempts_tracker:
        failed_attempts_tracker[ip] = []
    
    failed_attempts_tracker[ip].append(datetime.now())
    
    # Remove old attempts (older than 1 hour)
    failed_attempts_tracker[ip] = [
        attempt for attempt in failed_attempts_tracker[ip] 
        if datetime.now() - attempt < timedelta(hours=1)
    ]
    
    # Block IP if too many attempts
    if len(failed_attempts_tracker[ip]) >= 10:
        ip_blocks[ip] = datetime.now() + timedelta(hours=1)

# Dependency for getting current user
def get_current_user(request: Request):
    """Get current user from JWT token"""
    authorization = request.cookies.get("access_token")
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(authorization, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        if email in TEST_USERS:
            return {"sub": TEST_USERS[email]["id"], "email": email}
        else:
            raise HTTPException(status_code=401, detail="User not found")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "stockpulse-auth-test"}

@app.post("/api/v1/auth/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(request: Request, response: Response, credentials: LoginRequest):
    """Login endpoint for testing"""
    ip_address = get_remote_address(request)
    
    # Check IP blocking
    if is_ip_blocked(ip_address):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="IP address temporarily blocked due to suspicious activity"
        )
    
    # Check account lockout
    if is_account_locked(credentials.email):
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account temporarily locked due to multiple failed login attempts"
        )
    
    # Get user
    user = TEST_USERS.get(credentials.email)
    if not user or not verify_password(credentials.password, user["password_hash"]):
        record_failed_attempt(credentials.email, ip_address)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if user is active
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Create tokens
    access_token = create_access_token({"sub": user["email"], "email": user["email"]})
    csrf_token = generate_csrf_token()
    
    # Set cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # False for localhost testing
        samesite="lax",
        max_age=1800
    )
    
    response.set_cookie(
        key="csrf_token", 
        value=csrf_token,
        httponly=False,  # CSRF token needs to be accessible to client
        secure=False,
        samesite="lax",
        max_age=1800
    )
    
    # Clear failed attempts
    if credentials.email in TEST_USERS:
        TEST_USERS[credentials.email]["failed_attempts"] = 0
        TEST_USERS[credentials.email]["locked_until"] = None
    
    return LoginResponse(
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            created_at=user["created_at"],
            last_login=datetime.now()
        ),
        message="Login successful",
        csrf_token=csrf_token
    )

@app.get("/api/v1/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    email = current_user["email"]
    user = TEST_USERS.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        created_at=user["created_at"],
        last_login=datetime.now()
    )

@app.post("/api/v1/auth/logout")
async def logout(response: Response):
    """Logout endpoint"""
    response.delete_cookie("access_token")
    response.delete_cookie("csrf_token")
    return {"message": "Logged out successfully"}

@app.post("/api/v1/auth/refresh")
async def refresh_token(request: Request, response: Response):
    """Refresh token endpoint"""
    # Simple refresh for testing
    authorization = request.cookies.get("access_token")
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(authorization, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email and email in TEST_USERS:
            new_token = create_access_token({"sub": email, "email": email})
            response.set_cookie(
                key="access_token",
                value=new_token,
                httponly=True,
                secure=False,
                samesite="lax",
                max_age=1800
            )
            return {"message": "Token refreshed"}
    except jwt.PyJWTError:
        pass
    
    raise HTTPException(status_code=401, detail="Invalid token")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("test_server:app", host="0.0.0.0", port=8000, reload=True) 