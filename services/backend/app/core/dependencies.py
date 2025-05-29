"""
FastAPI dependencies.
"""
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.auth.jwt_service import jwt_service

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get current authenticated user from JWT token in cookies.
    """
    user_data = jwt_service.get_current_user_data(request)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_data 