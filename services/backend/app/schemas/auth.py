"""
Authentication schema models for request/response validation.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, validator


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """User registration request schema."""

    email: EmailStr
    password: str
    confirm_password: str
    name: Optional[str] = None

    @validator("confirm_password")
    def passwords_match(cls, v, values, **kwargs):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v


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


class RegisterResponse(BaseModel):
    """Registration response schema."""

    user: UserResponse
    message: str
    csrf_token: str
