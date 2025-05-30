"""
FastAPI dependencies.
"""
from typing import Any, Dict, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.auth.jwt_service import jwt_service


class CurrentUser:
    """Simple user object for dependency injection."""
    def __init__(self, user_id: str, email: str, **kwargs):
        self.id = UUID(user_id)  # Convert string UUID to UUID object
        self.email = email
        # Store any additional user data
        for key, value in kwargs.items():
            setattr(self, key, value)


async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db)
) -> CurrentUser:
    """
    Get current authenticated user from JWT token in cookies.
    Returns a CurrentUser object with id and email attributes.
    """
    user_data = jwt_service.get_current_user_data(request)

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user ID from JWT 'sub' field
    user_id = user_data.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract email and other user data
    email = user_data.get("email", "")
    
    # Create CurrentUser object with proper ID attribute
    return CurrentUser(
        user_id=user_id,
        email=email,
        **{k: v for k, v in user_data.items() if k not in ["sub", "email", "exp", "iat", "type"]}
    )
