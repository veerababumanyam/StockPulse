"""
Main API router.
"""
from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.portfolio import router as portfolio_router
from app.api.v1.api_keys import router as api_keys_router

api_router = APIRouter()

# Include routers
api_router.include_router(auth_router)
api_router.include_router(portfolio_router)
api_router.include_router(api_keys_router)
