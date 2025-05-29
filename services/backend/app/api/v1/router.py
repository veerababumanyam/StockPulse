"""
Main API router.
"""
from fastapi import APIRouter

from app.api.v1.auth import router as auth_router

api_router = APIRouter()

# Include routers
api_router.include_router(auth_router)
