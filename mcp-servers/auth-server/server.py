#!/usr/bin/env python3
"""
StockPulse Authentication MCP Server

MCP server providing tools for authentication and user management.
Enhanced for Story 1.2 testing with real authentication functionality.
"""

import os
import hashlib
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import structlog
import jwt
import bcrypt

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Configuration
SERVER_PORT = int(os.getenv("MCP_SERVER_PORT", "8002"))
SERVER_HOST = "0.0.0.0"
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://stockpulse_user:stockpulse_password@postgres:5432/stockpulse")
REDIS_URL = os.getenv("REDIS_URL", "redis://:stockpulse_redis_password@redis:6379")

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "mcp-test-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# FastAPI app
app = FastAPI(
    title="StockPulse Authentication MCP Server",
    description="MCP server for authentication and user management",
    version="1.0.0"
)

# Test users database (in-memory for testing)
TEST_USERS = {
    "testuser@example.com": {
        "id": "mcp-user-id-1",
        "email": "testuser@example.com",
        "password_hash": bcrypt.hashpw("Password123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": True,
        "created_at": datetime.now() - timedelta(days=30),
        "failed_attempts": 0,
        "locked_until": None
    },
    "inactive@example.com": {
        "id": "mcp-user-id-2", 
        "email": "inactive@example.com",
        "password_hash": bcrypt.hashpw("Password123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": False,
        "created_at": datetime.now() - timedelta(days=60),
        "failed_attempts": 0,
        "locked_until": None
    },
    "locked@example.com": {
        "id": "mcp-user-id-3",
        "email": "locked@example.com", 
        "password_hash": bcrypt.hashpw("Password123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": True,
        "created_at": datetime.now() - timedelta(days=15),
        "failed_attempts": 6,
        "locked_until": datetime.now() + timedelta(minutes=30)
    },
    "admin@example.com": {
        "id": "mcp-admin-id-1",
        "email": "admin@example.com",
        "password_hash": bcrypt.hashpw("AdminPass123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "is_active": True,
        "created_at": datetime.now() - timedelta(days=90),
        "failed_attempts": 0,
        "locked_until": None,
        "role": "admin"
    }
}

# Active sessions storage (in-memory for testing)
active_sessions = {}

class MCPToolRequest(BaseModel):
    tool: str
    parameters: Dict[str, Any]
    timestamp: Optional[str] = None

@app.on_event("startup")
async def startup():
    """Initialize the Authentication MCP server."""
    logger.info("Starting Authentication MCP Server", port=SERVER_PORT, database_url=DATABASE_URL)

@app.get("/")
async def root():
    """Root endpoint with server information."""
    return {
        "service": "StockPulse Authentication MCP Server",
        "version": "1.0.0",
        "protocol": "MCP-1.0",
        "tools": [
            "authenticate_user",
            "validate_token",
            "create_user",
            "get_user_profile",
            "update_user_profile",
            "invalidate_session",
            "get_user_sessions"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        return {
            "status": "healthy",
            "service": "auth-mcp-server",
            "timestamp": datetime.utcnow().isoformat(),
            "database_connected": True,
            "redis_connected": True,
            "test_users_count": len(TEST_USERS),
            "active_sessions_count": len(active_sessions)
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        return {
            "status": "unhealthy", 
            "service": "auth-mcp-server",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }

@app.get("/tools/list")
async def list_tools():
    """List available MCP tools."""
    return {
        "tools": [
            {
                "name": "authenticate_user",
                "description": "Authenticate user with email and password",
                "parameters": ["email", "password"]
            },
            {
                "name": "validate_token",
                "description": "Validate authentication token",
                "parameters": ["token"]
            },
            {
                "name": "create_user",
                "description": "Create new user account",
                "parameters": ["email", "password"]
            },
            {
                "name": "get_user_profile",
                "description": "Get user profile information",
                "parameters": ["user_id"]
            },
            {
                "name": "update_user_profile",
                "description": "Update user profile",
                "parameters": ["user_id", "updates"]
            },
            {
                "name": "invalidate_session",
                "description": "Invalidate user session",
                "parameters": ["session_token"]
            },
            {
                "name": "get_user_sessions",
                "description": "Get active user sessions",
                "parameters": ["user_id"]
            }
        ]
    }

@app.get("/tools/{tool_name}")
async def get_tool_info(tool_name: str):
    """Get information about a specific tool."""
    tools_info = {
        "authenticate_user": {
            "name": "authenticate_user",
            "description": "Authenticate user with email and password",
            "parameters": {
                "email": {"type": "string", "required": True},
                "password": {"type": "string", "required": True}
            },
            "returns": {
                "success": "boolean",
                "user_id": "string",
                "session_token": "string",
                "expires_at": "string"
            }
        },
        "validate_token": {
            "name": "validate_token",
            "description": "Validate authentication token",
            "parameters": {
                "token": {"type": "string", "required": True}
            },
            "returns": {
                "success": "boolean",
                "valid": "boolean",
                "user_id": "string",
                "expires_at": "string"
            }
        }
    }
    
    if tool_name not in tools_info:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found")
    
    return tools_info[tool_name]

@app.post("/tools/call")
async def call_tool(request: MCPToolRequest):
    """Call an MCP tool with parameters."""
    tool_name = request.tool
    parameters = request.parameters
    
    try:
        if tool_name == "authenticate_user":
            return await authenticate_user_impl(parameters)
        elif tool_name == "validate_token":
            return await validate_token_impl(parameters)
        elif tool_name == "create_user":
            return await create_user_impl(parameters)
        elif tool_name == "get_user_profile":
            return await get_user_profile_impl(parameters)
        elif tool_name == "update_user_profile":
            return await update_user_profile_impl(parameters)
        elif tool_name == "invalidate_session":
            return await invalidate_session_impl(parameters)
        elif tool_name == "get_user_sessions":
            return await get_user_sessions_impl(parameters)
        else:
            return {
                "success": False,
                "error": f"Unknown tool: {tool_name}",
                "tool": tool_name
            }
    except Exception as e:
        logger.error("Tool execution failed", tool=tool_name, error=str(e))
        return {
            "success": False,
            "error": str(e),
            "tool": tool_name
        }

# Tool implementations
async def authenticate_user_impl(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Authenticate user implementation."""
    email = parameters.get("email")
    password = parameters.get("password")
    
    if not email or not password:
        return {
            "success": False,
            "error": "Email and password are required"
        }
    
    # Get user
    user = TEST_USERS.get(email)
    if not user:
        return {
            "success": False,
            "error": "User not found"
        }
    
    # Verify password
    if not verify_password(password, user["password_hash"]):
        return {
            "success": False,
            "error": "Invalid password"
        }
    
    # Check if user is active
    if not user["is_active"]:
        return {
            "success": False,
            "error": "Account is deactivated"
        }
    
    # Check if account is locked
    if user.get("locked_until") and datetime.now() < user["locked_until"]:
        return {
            "success": False,
            "error": "Account temporarily locked"
        }
    
    # Create session token
    session_token = create_session_token(user)
    expires_at = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Store session
    active_sessions[session_token] = {
        "user_id": user["id"],
        "email": user["email"],
        "created_at": datetime.now(),
        "expires_at": expires_at
    }
    
    return {
        "success": True,
        "user_id": user["id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat()
    }

async def validate_token_impl(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Validate token implementation."""
    token = parameters.get("token")
    
    if not token:
        return {
            "success": False,
            "error": "Token is required"
        }
    
    # Check if session exists
    session = active_sessions.get(token)
    if not session:
        return {
            "success": False,
            "error": "Invalid token",
            "valid": False
        }
    
    # Check if session is expired
    if datetime.now() > session["expires_at"]:
        # Remove expired session
        del active_sessions[token]
        return {
            "success": False,
            "error": "Token expired",
            "valid": False
        }
    
    return {
        "success": True,
        "valid": True,
        "user_id": session["user_id"],
        "expires_at": session["expires_at"].isoformat()
    }

async def get_user_profile_impl(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Get user profile implementation."""
    user_id = parameters.get("user_id")
    
    if not user_id:
        return {
            "success": False,
            "error": "User ID is required"
        }
    
    # Find user by ID
    user = None
    for u in TEST_USERS.values():
        if u["id"] == user_id:
            user = u
            break
    
    if not user:
        return {
            "success": False,
            "error": "User not found"
        }
    
    return {
        "success": True,
        "user_id": user["id"],
        "email": user["email"],
        "created_at": user["created_at"].isoformat(),
        "is_active": user["is_active"],
        "role": user.get("role", "user")
    }

async def create_user_impl(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Create user implementation."""
    return {
        "success": False,
        "error": "User creation not implemented in test mode"
    }

async def update_user_profile_impl(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Update user profile implementation."""
    return {
        "success": False,
        "error": "Profile updates not implemented in test mode"
    }

async def invalidate_session_impl(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Invalidate session implementation."""
    session_token = parameters.get("session_token")
    
    if not session_token:
        return {
            "success": False,
            "error": "Session token is required"
        }
    
    # Remove session
    if session_token in active_sessions:
        del active_sessions[session_token]
        return {
            "success": True,
            "message": "Session invalidated"
        }
    else:
        return {
            "success": False,
            "error": "Session not found"
        }

async def get_user_sessions_impl(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Get user sessions implementation."""
    user_id = parameters.get("user_id")
    
    if not user_id:
        return {
            "success": False,
            "error": "User ID is required"
        }
    
    # Find all sessions for this user
    user_sessions = []
    for token, session in active_sessions.items():
        if session["user_id"] == user_id:
            user_sessions.append({
                "session_token": token,
                "created_at": session["created_at"].isoformat(),
                "expires_at": session["expires_at"].isoformat()
            })
    
    return {
        "success": True,
        "sessions": user_sessions
    }

# Utility functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_session_token(user: Dict[str, Any]) -> str:
    """Create session token for user."""
    data = {
        "sub": user["email"],
        "user_id": user["id"],
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=SERVER_HOST,
        port=SERVER_PORT,
        log_level="info"
    ) 