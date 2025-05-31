"""
StockPulse Authentication Service
FastAPI backend with placeholder for future MCP integration.
"""
import asyncio
import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.database import init_database
from app.core.redis import init_redis
from app.middleware.security import security_headers_middleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown."""
    try:
        logger.info("Starting StockPulse backend...")

        # Startup
        logger.info("Initializing database...")
        await init_database()
        logger.info("Database initialization completed")

        # TODO: Re-enable Redis when ready
        # logger.info("Initializing Redis...")
        # await init_redis()
        # logger.info("Redis initialization completed")

        # TODO: Initialize MCP integration when fastapi-mcp becomes available
        # mcp = FastApiMCP(app)
        # app.state.mcp = mcp
        # app.state.agent_notifier = AgentNotificationService(mcp)

        logger.info("StockPulse backend startup completed successfully")
        yield

        # Shutdown - cleanup resources
        logger.info("Shutting down StockPulse backend...")

    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise


# Create FastAPI application
app = FastAPI(
    title="StockPulse API",
    description="Enterprise-grade financial portfolio management API with comprehensive security",
    version="0.2.1",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Use proper origins from settings instead of wildcard
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


@app.get("/", tags=["Health"])
async def read_root():
    """Health check endpoint with API information"""
    return {
        "message": "StockPulse Backend API",
        "version": "0.2.1",
        "status": "running",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
