"""
Main API router.
"""
from fastapi import APIRouter

from app.api.v1.agents import router as agents_router
from app.api.v1.api_keys import router as api_keys_router
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.data_orchestration import router as data_orchestration_router
from app.api.v1.fmp_proxy import router as fmp_proxy_router
from app.api.v1.portfolio import router as portfolio_router
from app.api.v1.websocket import router as websocket_router
from app.api.v1.widgets import router as widgets_router

api_router = APIRouter()

# Include routers
api_router.include_router(auth_router)
api_router.include_router(portfolio_router)
api_router.include_router(api_keys_router)

# Include the FMP proxy router
api_router.include_router(fmp_proxy_router)

# Include the data orchestration router
api_router.include_router(data_orchestration_router)

# Include the dashboard router with the correct prefix that frontend expects
api_router.include_router(dashboard_router, prefix="/dashboards", tags=["Dashboards"])

# Include the widgets router
api_router.include_router(
    widgets_router,
    # tags=["Widget Data"]
)

# Include the WebSocket router for real-time market data
api_router.include_router(websocket_router, tags=["WebSocket"])

# Include the agents router for AI Market Research Agent
api_router.include_router(agents_router, tags=["AI Agents"])
