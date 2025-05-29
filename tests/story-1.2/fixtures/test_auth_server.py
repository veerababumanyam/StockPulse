#!/usr/bin/env python3
"""
Test Authentication Server for Story 1.2 testing - STAYS IN TESTS FOLDER
This integrates with the existing MCP auth-server at /mcp-servers/auth-server/
"""
import asyncio
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import FastAPI, HTTPException, status, Response, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
import jwt
import bcrypt
import uvicorn

# Test configuration
SECRET_KEY = "test-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class TestAuthServerForMCPIntegration:
    """
    Test authentication server that provides test endpoints
    and integrates with the existing MCP auth-server infrastructure.
    This server runs on localhost:8000 for testing purposes.
    """
    
    def __init__(self, host: str = "127.0.0.1", port: int = 8000):
        self.host = host
        self.port = port
        self.app = self._create_app()
        self.server = None
        
        # Test users for Story 1.2 testing
        self.test_users = {
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
        
        # Failed attempts tracking (in-memory for testing)
        self.failed_attempts_tracker = {}
        self.ip_blocks = {}
        
    def _create_app(self) -> FastAPI:
        """Create FastAPI test application."""
        app = FastAPI(
            title="StockPulse Test Authentication Server",
            description="Test server for Story 1.2 login flow testing - integrates with MCP",
            version="1.0.0"
        )

        # CORS Configuration for frontend testing
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:3000", "http://localhost:5173"],
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE"],
            allow_headers=["*"],
        )
        
        # Add test endpoints
        self._add_test_routes(app)
        
        return app
    
    def _add_test_routes(self, app: FastAPI):
        """Add test authentication routes."""
        
        @app.get("/health")
        async def health_check():
            """Health check endpoint"""
            return {
                "status": "healthy", 
                "service": "stockpulse-test-auth-server",
                "mcp_auth_server": "http://localhost:8002",
                "test_users_count": len(self.test_users)
            }

        @app.post("/test/reset-state")
        async def reset_test_state():
            """Reset test state (rate limits, lockouts, etc.)"""
            self.failed_attempts_tracker.clear()
            self.ip_blocks.clear()
            
            # Reset user states
            for user in self.test_users.values():
                user["failed_attempts"] = 0
                user["locked_until"] = None
                if user["email"] == "locked@example.com":
                    # Keep one user locked for testing
                    user["failed_attempts"] = 6
                    user["locked_until"] = datetime.now() + timedelta(minutes=30)
            
            return {"message": "Test state reset", "timestamp": datetime.now().isoformat()}

        @app.post("/api/v1/auth/login")
        async def test_login(request: Request, response: Response, credentials: dict):
            """Test login endpoint that mimics production behavior"""
            email = credentials.get("email")
            password = credentials.get("password")
            
            if not email or not password:
                raise HTTPException(status_code=422, detail="Email and password required")
            
            # Check if user exists
            user = self.test_users.get(email)
            if not user or not self._verify_password(password, user["password_hash"]):
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            # Check if user is active
            if not user["is_active"]:
                raise HTTPException(status_code=403, detail="Account is deactivated")
            
            # Check if account is locked
            if user.get("locked_until") and datetime.now() < user["locked_until"]:
                raise HTTPException(status_code=423, detail="Account temporarily locked due to multiple failed login attempts")
            
            # Create token
            access_token = self._create_access_token({"sub": user["email"], "email": user["email"]})
            csrf_token = self._generate_csrf_token()
            
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
                httponly=False,
                secure=False,
                samesite="lax",
                max_age=1800
            )
            
            return {
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "created_at": user["created_at"].isoformat(),
                    "last_login": datetime.now().isoformat()
                },
                "message": "Login successful",
                "csrf_token": csrf_token
            }

        @app.get("/api/v1/auth/me")
        async def get_current_user(request: Request):
            """Get current user info from token"""
            token = request.cookies.get("access_token")
            if not token:
                raise HTTPException(status_code=401, detail="Not authenticated")
            
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                email = payload.get("sub")
                user = self.test_users.get(email)
                
                if not user:
                    raise HTTPException(status_code=401, detail="User not found")
                
                return {
                    "id": user["id"],
                    "email": user["email"],
                    "created_at": user["created_at"].isoformat(),
                    "last_login": datetime.now().isoformat()
                }
            except jwt.PyJWTError:
                raise HTTPException(status_code=401, detail="Invalid token")

        @app.post("/api/v1/auth/logout")
        async def logout(response: Response):
            """Logout endpoint"""
            response.delete_cookie("access_token")
            response.delete_cookie("csrf_token")
            return {"message": "Logged out successfully"}

        @app.get("/test/users")
        async def get_test_users():
            """Get test users for debugging (test endpoint only)"""
            return {
                "users": [
                    {
                        "email": user["email"],
                        "is_active": user["is_active"],
                        "failed_attempts": user["failed_attempts"],
                        "locked_until": user["locked_until"].isoformat() if user["locked_until"] else None
                    }
                    for user in self.test_users.values()
                ]
            }

    def _create_access_token(self, data: dict):
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    def _generate_csrf_token(self):
        """Generate CSRF token"""
        return hashlib.sha256(f"{time.time()}{SECRET_KEY}".encode()).hexdigest()

    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

    async def start(self):
        """Start the test server."""
        config = uvicorn.Config(
            self.app, 
            host=self.host, 
            port=self.port, 
            log_level="info",
            access_log=False
        )
        self.server = uvicorn.Server(config)
        
        # Start server in background task
        self.server_task = asyncio.create_task(self.server.serve())
        
        # Wait a bit for server to start
        await asyncio.sleep(1)

    async def stop(self):
        """Stop the test server."""
        if self.server:
            self.server.should_exit = True
            if hasattr(self, 'server_task'):
                self.server_task.cancel()
                try:
                    await self.server_task
                except asyncio.CancelledError:
                    pass

# For running directly during development
if __name__ == "__main__":
    async def run_test_server():
        server = TestAuthServerForMCPIntegration()
        await server.start()
        print("Test authentication server running on http://localhost:8000")
        print("MCP Auth Server should be running on http://localhost:8002")
        print("Press Ctrl+C to stop")
        try:
            await asyncio.Event().wait()
        except KeyboardInterrupt:
            print("Stopping server...")
            await server.stop()
    
    asyncio.run(run_test_server()) 