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
    role: str
    status: str
    created_at: datetime
    approved_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class PendingUserResponse(BaseModel):
    """Pending user response schema for admin approval."""

    id: str
    email: str
    name: Optional[str] = None
    created_at: datetime
    status: str

    class Config:
        from_attributes = True


class UserApprovalRequest(BaseModel):
    """User approval/rejection request schema."""

    user_id: str
    action: str  # "approve" or "reject"
    rejection_reason: Optional[str] = None

    @validator("action")
    def validate_action(cls, v):
        if v not in ["approve", "reject"]:
            raise ValueError("Action must be 'approve' or 'reject'")
        return v

    @validator("rejection_reason")
    def validate_rejection_reason(cls, v, values, **kwargs):
        if values.get("action") == "reject" and not v:
            raise ValueError("Rejection reason is required when rejecting a user")
        return v


class LoginResponse(BaseModel):
    """Login response schema."""

    user: UserResponse
    message: str
    csrf_token: str


class RegisterResponse(BaseModel):
    """Registration response schema."""

    message: str
    status: str
    user_id: str
    # No CSRF token since user is not logged in until approved
