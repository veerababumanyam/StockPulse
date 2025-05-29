"""
StockPulse Authentication Service
FastAPI backend with placeholder for future MCP integration.
"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.database import init_database
from app.core.redis import init_redis
from app.middleware.security import security_headers_middleware

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown."""
    # Startup
    await init_database()
    # await init_redis()  # Temporarily disabled for testing

    # TODO: Initialize MCP integration when fastapi-mcp becomes available
    # mcp = FastApiMCP(app)
    # app.state.mcp = mcp
    # app.state.agent_notifier = AgentNotificationService(mcp)

    yield

    # Shutdown - cleanup resources
    pass


# Create FastAPI application
app = FastAPI(
    title="StockPulse Authentication Service",
    description="Secure authentication with AI agent integration",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Security Headers Middleware
app.middleware("http")(security_headers_middleware)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "stockpulse-auth"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
