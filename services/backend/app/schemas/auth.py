"""
Authentication schema models for request/response validation.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """User response schema."""
    id: str
    email: str
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    """Login response schema."""
    user: UserResponse
    message: str
    csrf_token: str 